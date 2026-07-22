import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const GRID_COLS = 18;
export const GRID_ROWS = 7;

// Each cell hard-flips (no blend) at its own row+jitter threshold, so the
// boundary reads as noisy/blocky. The bottom row (touching the already-
// toColor section below) must flip first and the top row last — otherwise
// leftover unflipped cells strand near the bottom, reading as the wrong
// color appearing inside the wrong section.
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

export function usePixelDissolve(
  bandRef: RefObject<HTMLDivElement | null>,
  cellRefs: RefObject<(HTMLDivElement | null)[]>,
  fromColor: string,
  toColor: string,
) {
  const progressRef = useRef(0);
  // Lazy useState initializer (not a ref lazily set during render) — thresholds
  // are computed once and never change, and reading/writing ref.current during
  // render trips react-hooks/refs (the component used to do exactly that).
  const [thresholds] = useState(buildThresholds);

  useEffect(() => {
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
  }, [bandRef]);

  useEffect(() => {
    // Guarded two ways, both required — this ran unconditionally on every
    // tick forever (even scrolled far away, even idle), rewriting every
    // cell's background-color every single frame:
    // 1. Skip the whole pass when scroll progress hasn't changed (idle,
    //    off-trigger) — `onUpdate` only fires progressRef to a new value
    //    while actually scrolling within this band's range.
    // 2. Per-cell, compare against a plain JS-tracked last-applied color,
    //    not `el.style.backgroundColor` read back — that getter normalizes
    //    to `"rgb(...)"`, never equal to the hex it was set to, so the old
    //    `!==` guard here never matched and rewrote all ~126 cells anyway.
    let lastProgress = -1;
    const appliedColors: (string | undefined)[] = [];
    function tick() {
      const progress = progressRef.current;
      if (progress === lastProgress) return;
      lastProgress = progress;
      cellRefs.current.forEach((el, i) => {
        if (!el) return;
        const color = progress >= thresholds[i] ? toColor : fromColor;
        if (appliedColors[i] !== color) {
          appliedColors[i] = color;
          el.style.backgroundColor = color;
        }
      });
    }
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [cellRefs, thresholds, fromColor, toColor]);
}
