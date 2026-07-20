import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCRAMBLE_CHARS = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ+#";

export const STAT_TEXT = "50+";

// Locks each character in left-to-right over its own short window inside
// the overall duration, so the reveal reads as a cascading "decryption"
// rather than every glyph settling at once.
function runScramble(el: HTMLElement, finalText: string, durationMs = 1100) {
  const start = performance.now();
  let rafId = 0;

  function frame(now: number) {
    const overallT = Math.min(1, (now - start) / durationMs);
    let out = "";
    for (let i = 0; i < finalText.length; i++) {
      const ch = finalText[i];
      const lockT = Math.min(1, Math.max(0, (overallT - i * 0.12) / 0.55));
      out += lockT >= 1 ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
    if (overallT < 1) {
      rafId = requestAnimationFrame(frame);
    }
  }
  rafId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(rafId);
}

export type AboutAnimationRefs = {
  sectionRef: RefObject<HTMLElement | null>;
  headlineRef: RefObject<HTMLHeadingElement | null>;
  introRef: RefObject<HTMLDivElement | null>;
  statWrapRef: RefObject<HTMLDivElement | null>;
  statRef: RefObject<HTMLSpanElement | null>;
  consolidatedRef: RefObject<HTMLDivElement | null>;
  logoRef: RefObject<HTMLDivElement | null>;
  factoryRef: RefObject<HTMLDivElement | null>;
  factoryPhotoBoxRef: RefObject<HTMLDivElement | null>;
  factoryPhotoRef: RefObject<HTMLDivElement | null>;
  mapBoxRef: RefObject<HTMLDivElement | null>;
};

export function useAboutAnimations(refs: AboutAnimationRefs) {
  const {
    sectionRef,
    headlineRef,
    introRef,
    statWrapRef,
    statRef,
    consolidatedRef,
    logoRef,
    factoryRef,
    factoryPhotoBoxRef,
    factoryPhotoRef,
    mapBoxRef,
  } = refs;

  const statTriggeredRef = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headlineTween = gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 30, scale: 0.92, filter: "blur(18px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top bottom",
            end: "center 35%",
            scrub: 0.6,
          },
        },
      );

      const introTween = gsap.fromTo(
        introRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: introRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const statTween = gsap.fromTo(
        statWrapRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: statWrapRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
            onEnter: () => {
              if (!statTriggeredRef.current && statRef.current) {
                statTriggeredRef.current = true;
                runScramble(statRef.current, STAT_TEXT);
              }
            },
          },
        },
      );

      const consolidatedTween = gsap.fromTo(
        consolidatedRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: consolidatedRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const logoTween = gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: logoRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const factoryTween = gsap.fromTo(
        factoryRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: factoryRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const factoryPhotoAppearTween = gsap.fromTo(
        factoryPhotoBoxRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: factoryPhotoBoxRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const factoryPhotoColorTween = gsap.fromTo(
        factoryPhotoRef.current,
        { filter: "grayscale(1)" },
        {
          filter: "grayscale(0)",
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: factoryPhotoBoxRef.current,
            start: "top 40%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const mapTween = gsap.fromTo(
        mapBoxRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mapBoxRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      return () => {
        headlineTween.scrollTrigger?.kill();
        introTween.scrollTrigger?.kill();
        statTween.scrollTrigger?.kill();
        consolidatedTween.scrollTrigger?.kill();
        logoTween.scrollTrigger?.kill();
        factoryTween.scrollTrigger?.kill();
        factoryPhotoAppearTween.scrollTrigger?.kill();
        factoryPhotoColorTween.scrollTrigger?.kill();
        mapTween.scrollTrigger?.kill();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [
    sectionRef,
    headlineRef,
    introRef,
    statWrapRef,
    statRef,
    consolidatedRef,
    logoRef,
    factoryRef,
    factoryPhotoBoxRef,
    factoryPhotoRef,
    mapBoxRef,
  ]);
}
