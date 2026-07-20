import { useEffect } from "react";
import type { MutableRefObject, RefObject } from "react";
import gsap from "gsap";
import { EASE_SETTLE, remap } from "./scrollUtils";

// Reveals one line at a time via scroll-scrubbed opacity, then holds until
// ScrollShowcase's pin releases into PixelDissolve.tsx.
export const HEADLINE_LINES = [
  ["Precisão", "e", "alta", "performance"],
  ["para", "motores", "elétricos", "industriais."],
  ["Cada", "projeto", "passa", "por", "um", "processo"],
  ["rigoroso", "de", "engenharia,", "do", "diagnóstico", "ao", "acabamento."],
];

const WORDS_REVEAL_START = 0;
const WORDS_REVEAL_END = 0.96;

export function useHeadlinePhrase(
  progressRef: RefObject<number>,
  lineRefs: MutableRefObject<(HTMLSpanElement | null)[]>,
) {
  useEffect(() => {
    function tick() {
      const progress = progressRef.current;

      const stepWidth = (WORDS_REVEAL_END - WORDS_REVEAL_START) / HEADLINE_LINES.length;
      HEADLINE_LINES.forEach((_, lineIndex) => {
        const lineStart = WORDS_REVEAL_START + lineIndex * stepWidth;
        const t = EASE_SETTLE(remap(progress, lineStart, lineStart + stepWidth, 0, 1));
        const el = lineRefs.current[lineIndex];
        if (el) el.style.opacity = String(t);
      });
    }

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [progressRef, lineRefs]);
}
