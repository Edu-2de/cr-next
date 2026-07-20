"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Exposes the live Lenis instance so any component (e.g. Header's nav links)
// can drive an animated scroll via `lenis.scrollTo(...)` instead of native
// `scrollIntoView`/`window.scrollTo` — the native APIs fight Lenis's own
// RAF-driven virtual scroll frame by frame (Lenis keeps resetting scroll
// position to its own interpolated value), which reads as the page not
// moving at all or snapping instantly instead of animating.
const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Longer duration + a gentler (quintic, not exponential) ease-out reads
    // closer to GSAP ScrollSmoother's signature heavier "catch-up" lag
    // (its default smooth factor is ~1.5) than Lenis's own stock preset,
    // which snaps to a stop quickly right after the exponential's steep
    // early drop-off.
    const instance = new Lenis({
      duration: 1.5,
      easing: (t: number) => 1 - Math.pow(1 - t, 5),
      wheelMultiplier: 0.85,
    });

    lenisRef.current = instance;
    setLenis(instance);

    instance.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      // gsap.ticker reports time in seconds; Lenis expects milliseconds.
      instance.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
