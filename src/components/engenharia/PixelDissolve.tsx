"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// A section-to-section color seam — a blocky pixelation dissolve between
// two background colors instead of a plain hard cut, modeled on
// https://www.cantor8.io (a mosaic/pixel-block wipe confined to a short
// band right at the section boundary, not a full-screen takeover). Reused
// across every color handoff on the page (engenharia white → produtos
// #eaeaea, later servicos #eaeaea → quem-somos white, etc.) via the
// fromColor/toColor props instead of duplicating this whole grid/threshold
// mechanism per seam. Explicit correction from an earlier version: this is
// NOT its own pinned/scroll-jacked section with a dedicated scroll budget —
// it's a normal-flow element, modestly tall, sitting exactly at the bottom
// edge of the section before it so it scrolls past naturally like any
// other content ("a parte de baixo da seção deve ser o efeito... não deve
// cobrir a tela toda, somente a breve transição entre as seções").
const BAND_VH = 46;

const DEFAULT_FROM_COLOR = "#ffffff";
const DEFAULT_TO_COLOR = "#eaeaea";

const GRID_COLS = 18;
const GRID_ROWS = 7;

// Each cell flips (hard cut, not a blend — the two colors are close enough
// that a blend would barely read, and a flat instant flip is what actually
// looks "pixelado" rather than a soft gradient) at its own threshold. The
// threshold is mostly driven by row plus a wide per-cell random jitter, so
// the boundary between the two colors is noisy/blocky like the reference
// instead of a clean straight line.
//
// Row order matters for which color reads as "appearing" — explicit fix:
// the BOTTOM row (touching "servicos", already #eaeaea) must flip to
// TO_COLOR first, and the TOP row (touching "engenharia", still white) must
// hold FROM_COLOR longest. Got this backwards once already: with row 0 (top)
// flipping first, the leftover un-flipped (white) cells end up stranded near
// the bottom late in the scroll — right where everything around them (the
// already-flipped band above, and "servicos" right below) already reads as
// #eaeaea, so it looks like white pixels appearing IN the #eaeaea section.
// Flipping the row direction keeps the lingering un-flipped cells up near
// the top instead, where the surroundings are still white — so what's
// visibly "appearing" is always #eaeaea pixels showing up within white
// territory, never the other way around.
const JITTER = 0.5;

function buildThresholds() {
  const thresholds: number[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowFrac = 1 - row / Math.max(GRID_ROWS - 1, 1);
    for (let col = 0; col < GRID_COLS; col++) {
      thresholds.push(rowFrac * (1 - JITTER) + Math.random() * JITTER);
    }
  }
  return thresholds;
}

// fromColor/toColor default to the original engenharia (white) → produtos
// (#eaeaea) handoff — made into props so this same band can be reused for
// other section-to-section color seams (e.g. servicos → quem-somos)
// instead of duplicating the whole grid/threshold mechanism.
export function PixelDissolve({
  fromColor = DEFAULT_FROM_COLOR,
  toColor = DEFAULT_TO_COLOR,
}: {
  fromColor?: string;
  toColor?: string;
} = {}) {
  const bandRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thresholdsRef = useRef<number[] | null>(null);
  if (!thresholdsRef.current) thresholdsRef.current = buildThresholds();

  useEffect(() => {
    // No `pin` — this band scrolls through the viewport like any other
    // element. Progress 0 → the band's top just entering the viewport from
    // below, 1 → its bottom has just left the viewport at the top, so the
    // whole dissolve plays out exactly over the scroll distance the band
    // itself occupies, not an artificially extended/pinned one.
    const trigger = ScrollTrigger.create({
      trigger: bandRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  useEffect(() => {
    const thresholds = thresholdsRef.current!;
    function tick() {
      const progress = progressRef.current;
      cellRefs.current.forEach((el, i) => {
        if (!el) return;
        const color = progress >= thresholds[i] ? toColor : fromColor;
        if (el.style.backgroundColor !== color) el.style.backgroundColor = color;
      });
    }
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [fromColor, toColor]);

  return (
    <div
      ref={bandRef}
      data-theme="light"
      className="relative z-10 grid w-full"
      style={{
        height: `${BAND_VH}vh`,
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
      }}
    >
      {thresholdsRef.current.map((_, i) => (
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
