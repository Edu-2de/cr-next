"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export type TrailingScroll = { raw: number; smooth: number; delta: number };

// The one handoff mechanism reused at every section boundary (see
// docs — mapped seams, single proposed mechanism). `smooth` is a second,
// independent lag on top of Lenis's own already-smoothed native scrollY —
// not a duplicate of it. Lenis makes the page's scroll itself continuous;
// this makes individual elements feel like they carry their own mass
// slightly behind that scroll, so nothing arrives or gets covered glued
// 1:1 to scroll position. `delta` (raw - smooth) is the residual any
// section can read to offset its own content — it's near 0 at rest and
// grows only while scroll is actively accelerating/decelerating, so it
// naturally self-gates to moments of real motion instead of being a
// constant idle jitter.
export function useTrailingScroll(damp = 0.08) {
  const ref = useRef<TrailingScroll>({ raw: 0, smooth: 0, delta: 0 });

  useEffect(() => {
    ref.current.raw = window.scrollY;
    ref.current.smooth = window.scrollY;
    ref.current.delta = 0;

    function tick() {
      const raw = window.scrollY;
      const state = ref.current;
      state.raw = raw;
      state.smooth += (raw - state.smooth) * damp;
      state.delta = raw - state.smooth;
    }

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [damp]);

  return ref;
}
