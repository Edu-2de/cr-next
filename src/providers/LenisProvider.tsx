"use client";

import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Exposes the live Lenis instance so components (e.g. Header) can drive
// scroll via lenis.scrollTo instead of native APIs, which fight Lenis's own
// RAF-driven scroll loop. Context carries the ref itself (a stable object,
// never reassigned) rather than the Lenis instance through useState —
// useLenis() is only ever read inside click handlers, never during render,
// so nothing needs to re-render when the instance appears; a ref sidesteps
// the setState-synchronously-in-an-effect render this component otherwise
// couldn't avoid (Lenis can only be constructed client-side, after mount).
const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

export function useLenis() {
  return useContext(LenisContext)?.current ?? null;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Quintic ease + longer duration for a heavier "catch-up" lag than
    // Lenis's stock preset.
    const instance = new Lenis({
      duration: 1.5,
      easing: (t: number) => 1 - Math.pow(1 - t, 5),
      wheelMultiplier: 0.85,
    });

    lenisRef.current = instance;

    instance.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      instance.raf(time * 1000); // gsap.ticker is in seconds, Lenis wants ms
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
