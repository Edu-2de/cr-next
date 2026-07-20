"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { EASE_SETTLE, remap } from "./scrollUtils";

// The opening phrase: reveals one line at a time via plain scroll-scrubbed
// opacity. Used to also split apart into two halves once fully revealed
// (to open space for a growing circle) — that whole split mechanic was
// removed per explicit request ("quando o texto acabar de aparecer na
// tela, ele não deve se abrir mais"): once revealed, the phrase just holds
// in place until the section's pin releases into PixelDissolve.tsx.
//
// Expanded from 2 to 4 lines per explicit request for more introductory
// copy ("pense que vai ser um conteúdo introdutório") — ScrollShowcase.tsx's
// CONTENT_VH was increased alongside this so each line still gets a
// similar amount of scroll distance to reveal in.
const HEADLINE_LINES = [
  ["Precisão", "e", "alta", "performance"],
  ["para", "motores", "elétricos", "industriais."],
  ["Cada", "projeto", "passa", "por", "um", "processo"],
  ["rigoroso", "de", "engenharia,", "do", "diagnóstico", "ao", "acabamento."],
];

const WORDS_REVEAL_START = 0;
const WORDS_REVEAL_END = 0.96;

export function HeadlinePhrase({ progressRef }: { progressRef: React.RefObject<number> }) {
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    function tick() {
      const progress = progressRef.current;

      // Phrase reveal: one line at a time (each line is a fixed group of
      // words, not the individually-wrapped words themselves).
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
  }, [progressRef]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
      <p
        className="max-w-6xl text-justify font-display font-bold leading-[1.15] tracking-tight text-ink-950"
        style={{ fontSize: "clamp(1.75rem, 4.5vw, 4.5rem)" }}
      >
        {HEADLINE_LINES.map((line, lineIndex) => (
          <span
            key={lineIndex}
            ref={(el) => {
              lineRefs.current[lineIndex] = el;
            }}
            className="opacity-0"
          >
            {line.join(" ")}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}
