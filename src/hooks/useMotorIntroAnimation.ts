import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { remap } from "@/components/sections/engineering/scrollUtils";

gsap.registerPlugin(ScrollTrigger);

const FORM_EASE = gsap.parseEase("sine.inOut");
const SLIDE_EASE = gsap.parseEase("sine.inOut");

// Drives MotorIntro's pinned sequence: scroll progress → eased form/slide
// progress → the motor box's slide offset and the text column's fade-in.
// `formEnd`/`slideEnd` are the 0-1 breakpoints (within the section's own
// pinned scroll) where the cube→motor formation and the slide-into-place
// each finish.
export function useMotorIntroAnimation(formEnd: number, slideEnd: number) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const motorBoxRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const formProgressRef = useRef(0);
  const centerOffsetRef = useRef(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: outerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    return () => trigger.kill();
  }, []);

  // Distance (px) from viewport center, measured with any transform
  // cleared first so a resize mid-slide can't bake in a stale offset.
  useEffect(() => {
    function measure() {
      const box = motorBoxRef.current;
      if (!box) return;
      const prevTransform = box.style.transform;
      box.style.transform = "";
      const rect = box.getBoundingClientRect();
      box.style.transform = prevTransform;
      centerOffsetRef.current = window.innerWidth / 2 - (rect.left + rect.width / 2);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    function tick() {
      const progress = progressRef.current;
      const formT = FORM_EASE(remap(progress, 0, formEnd, 0, 1));
      const slideT = SLIDE_EASE(remap(progress, formEnd, slideEnd, 0, 1));

      formProgressRef.current = formT;

      if (motorBoxRef.current) {
        const offset = centerOffsetRef.current * (1 - slideT);
        motorBoxRef.current.style.transform = offset ? `translateX(${offset}px)` : "";
      }

      if (textRef.current) {
        textRef.current.style.opacity = String(slideT);
        textRef.current.style.transform = `translateY(${(1 - slideT) * 16}px)`;
      }
    }
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [formEnd, slideEnd]);

  return { outerRef, motorBoxRef, textRef, formProgressRef, progressRef, centerOffsetRef };
}
