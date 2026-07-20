"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { PAPER } from "@/lib/palette";
import { useTrailingScroll } from "@/hooks/useTrailingScroll";
import { useScrollShowcase } from "@/hooks/useScrollShowcase";
import { HeadlinePhrase } from "./HeadlinePhrase";

// Pinned phrase reveal, holds briefly (HOLD_VH) then releases into plain
// document flow — PixelDissolve.tsx right after carries the color handoff.
const CONTENT_VH = 260;
const HOLD_VH = 20;
const TOTAL_VH = CONTENT_VH + HOLD_VH;
export const CONTENT_END = CONTENT_VH / TOTAL_VH;

// So nav clicks land past the reveal, not on the section's blank top edge.
export const ENGINEERING_REVEAL_FRACTION = CONTENT_END;

const PAGE_BG_COLOR = PAPER;

export function ScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trailingScroll = useTrailingScroll();

  const progressRef = useScrollShowcase(sectionRef, rootRef, trailingScroll);

  return (
    <Container
      as="section"
      id="engineering"
      data-theme="light"
      ref={sectionRef}
      surface="paper"
      style={{ height: `${TOTAL_VH}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: PAGE_BG_COLOR }}>
        <div
          ref={rootRef}
          className="relative h-full w-full overflow-hidden"
          style={{ backgroundColor: PAGE_BG_COLOR }}
        >
          <HeadlinePhrase progressRef={progressRef} />
        </div>
      </div>
    </Container>
  );
}
