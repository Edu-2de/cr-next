import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { TrailingScroll } from "@/hooks/useTrailingScroll";
import { remap } from "@/components/sections/engineering/scrollUtils";
import { CONTENT_END } from "@/components/sections/engineering/ScrollShowcase";

gsap.registerPlugin(ScrollTrigger);

export function useScrollShowcase(
  sectionRef: RefObject<HTMLElement | null>,
  rootRef: RefObject<HTMLDivElement | null>,
  trailingScroll: RefObject<TrailingScroll>,
) {
  const progressRef = useRef(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = remap(self.progress, 0, CONTENT_END, 0, 1);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [sectionRef]);

  useEffect(() => {
    // Residual parallax nudge from scroll momentum, fades out once settled.
    function tick() {
      const entranceInfluence = 1 - remap(progressRef.current, 0, 0.15, 0, 1);
      if (rootRef.current) {
        const offset = trailingScroll.current.delta * 0.7 * entranceInfluence;
        rootRef.current.style.transform = offset ? `translateY(${offset}px)` : "";
      }
    }
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [rootRef, trailingScroll]);

  return progressRef;
}
