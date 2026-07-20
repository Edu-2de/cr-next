"use client";

import { useRef } from "react";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import { useZoomTransition } from "@/hooks/ui/useZoomTransition";

// "CR MESQUITA" zooms in around a point inside the Q's stroke until the
// screen is solid black ink, then releases into AboutSection. Both the
// white cover and the word itself explicitly fade to 0 by progress=1 —
// relying on scaled ink alone to cover every edge isn't reliable across
// aspect ratios.
const PIN_VH = 160;

const zoomTransitionStyles = tv({
  slots: {
    base: "relative z-10",
    stickyStage: "sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-ink-950",
    whiteOverlay: "pointer-events-none absolute inset-0 bg-white",
    wordWrapper: "relative will-change-transform",
    wordText: "sm:text-8xl",
  },
});

export function CrMesquitaZoomTransition() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);
  const qRef = useRef<HTMLSpanElement | null>(null);
  const whiteRef = useRef<HTMLDivElement | null>(null);

  useZoomTransition({ wrapperRef, wordRef, qRef, whiteRef });

  const { base, stickyStage, whiteOverlay, wordWrapper, wordText } = zoomTransitionStyles();

  return (
    <div ref={wrapperRef} className={base()} style={{ height: `${PIN_VH}vh` }}>
      <div className={stickyStage()}>
        <div ref={whiteRef} className={whiteOverlay()} />
        <div ref={wordRef} className={wordWrapper()}>
          <Text as="span" font="display" weight="bold" tracking="tight" size="6xl" color="ink" className={wordText()}>
            CR MES
            <span ref={qRef}>Q</span>
            UITA
          </Text>
        </div>
      </div>
    </div>
  );
}
