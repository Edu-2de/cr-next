"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export type TrailingScroll = { raw: number; smooth: number; delta: number };

// `smooth` is a second lag on top of Lenis's own smoothed scrollY, so
// elements can feel like they carry their own mass slightly behind scroll.
// `delta` (raw - smooth) is near 0 at rest and grows only while scroll is
// accelerating/decelerating.
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
