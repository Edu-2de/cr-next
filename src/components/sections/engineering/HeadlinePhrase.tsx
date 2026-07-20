"use client";

import { useRef } from "react";
import { Text } from "@/components/ui/Text";
import { HEADLINE_LINES, useHeadlinePhrase } from "@/hooks/useHeadlinePhrase";

export function HeadlinePhrase({ progressRef }: { progressRef: React.RefObject<number> }) {
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useHeadlinePhrase(progressRef, lineRefs);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
      <Text
        as="p"
        font="display"
        align="justify"
        weight="bold"
        tracking="tight"
        color="ink"
        className="max-w-6xl leading-[1.15]"
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
      </Text>
    </div>
  );
}
