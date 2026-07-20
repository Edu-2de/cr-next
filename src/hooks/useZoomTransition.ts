import { useEffect } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MAX_SCALE = 55;
const SCALE_EASE = gsap.parseEase("power2.in");
const WHITE_FADE_START = 0.55;
const WHITE_FADE_END = 0.85;
const WORD_FADE_START = 0.85;
const WORD_FADE_END = 1;

// Fraction of the Q's bounding box the zoom anchors on — inside the
// right-hand stroke, close to but not inside the counter, so mid-zoom shows
// the counter with black ink framing it, and full zoom is solid ink.
const Q_ANCHOR_X = 0.72;
const Q_ANCHOR_Y = 0.45;

export type ZoomTransitionRefs = {
  wrapperRef: RefObject<HTMLDivElement | null>;
  wordRef: RefObject<HTMLDivElement | null>;
  qRef: RefObject<HTMLSpanElement | null>;
  whiteRef: RefObject<HTMLDivElement | null>;
};

export function useZoomTransition({ wrapperRef, wordRef, qRef, whiteRef }: ZoomTransitionRefs) {
  // Measured (not a guessed percentage) so it stays accurate at any viewport/font size.
  useEffect(() => {
    function measure() {
      const word = wordRef.current;
      const q = qRef.current;
      if (!word || !q) return;
      const wordRect = word.getBoundingClientRect();
      const qRect = q.getBoundingClientRect();
      const anchorX = qRect.left + qRect.width * Q_ANCHOR_X;
      const anchorY = qRect.top + qRect.height * Q_ANCHOR_Y;
      const originX = ((anchorX - wordRect.left) / wordRect.width) * 100;
      const originY = ((anchorY - wordRect.top) / wordRect.height) * 100;
      word.style.transformOrigin = `${originX}% ${originY}%`;
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [wordRef, qRef]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const word = wordRef.current;
    const white = whiteRef.current;
    if (!wrapper || !word || !white) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const scale = 1 + (MAX_SCALE - 1) * SCALE_EASE(progress);
        word.style.transform = `scale(${scale})`;

        const whiteFadeT = Math.min(
          1,
          Math.max(0, (progress - WHITE_FADE_START) / (WHITE_FADE_END - WHITE_FADE_START)),
        );
        white.style.opacity = String(1 - whiteFadeT);

        const wordFadeT = Math.min(
          1,
          Math.max(0, (progress - WORD_FADE_START) / (WORD_FADE_END - WORD_FADE_START)),
        );
        word.style.opacity = String(1 - wordFadeT);
      },
    });

    return () => trigger.kill();
  }, [wrapperRef, wordRef, whiteRef]);
}
