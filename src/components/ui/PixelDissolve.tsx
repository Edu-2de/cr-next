"use client";

import { useRef } from "react";
import { tv } from "tailwind-variants";
import { GRID_COLS, GRID_ROWS, usePixelDissolve } from "@/hooks/ui/usePixelDissolve";
import { MIST, PAPER } from "@/lib/palette";

const pixelDissolveStyles = tv({
  slots: {
    band: "relative z-10 grid w-full",
  },
});

// Blocky pixelation dissolve between two background colors, reused at every
// section color seam via fromColor/toColor. Normal-flow (not pinned) — it
// scrolls past like any other content.
const BAND_VH = 46;

const DEFAULT_FROM_COLOR = PAPER;
const DEFAULT_TO_COLOR = MIST;

const CELL_COUNT = GRID_COLS * GRID_ROWS;

export function PixelDissolve({
  fromColor = DEFAULT_FROM_COLOR,
  toColor = DEFAULT_TO_COLOR,
}: {
  fromColor?: string;
  toColor?: string;
} = {}) {
  const bandRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  usePixelDissolve(bandRef, cellRefs, fromColor, toColor);

  const { band } = pixelDissolveStyles();

  return (
    <div
      ref={bandRef}
      data-theme="light"
      className={band()}
      style={{
        height: `${BAND_VH}vh`,
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
      }}
    >
      {Array.from({ length: CELL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            cellRefs.current[i] = el;
          }}
          style={{ backgroundColor: fromColor }}
        />
      ))}
    </div>
  );
}
