"use client";

import { useRef } from "react";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import { HEADLINE_LINES, useHeadlinePhrase } from "./useHeadlinePhrase";

const headlinePhraseStyles = tv({
  slots: {
    root: "pointer-events-none absolute inset-0 flex items-center justify-center px-6",
    phrase: "max-w-6xl leading-[1.15]",
    line: "opacity-0",
  },
});

export function HeadlinePhrase({ progressRef }: { progressRef: React.RefObject<number> }) {
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useHeadlinePhrase(progressRef, lineRefs);

  const { root, phrase, line } = headlinePhraseStyles();

  return (
    <div className={root()}>
      <Text
        as="p"
        font="display"
        align="justify"
        weight="bold"
        tracking="tight"
        color="ink"
        className={phrase()}
        style={{ fontSize: "clamp(1.75rem, 4.5vw, 4.5rem)" }}
      >
        {HEADLINE_LINES.map((lineWords, lineIndex) => (
          <span
            key={lineIndex}
            ref={(el) => {
              lineRefs.current[lineIndex] = el;
            }}
            className={line()}
          >
            {lineWords.join(" ")}{" "}
          </span>
        ))}
      </Text>
    </div>
  );
}
