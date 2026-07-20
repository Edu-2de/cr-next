"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Exposes the live Lenis instance so components (e.g. Header) can drive
// scroll via lenis.scrollTo instead of native APIs, which fight Lenis's own
// RAF-driven scroll loop.
const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Quintic ease + longer duration for a heavier "catch-up" lag than
    // Lenis's stock preset.
    const instance = new Lenis({
      duration: 1.5,
      easing: (t: number) => 1 - Math.pow(1 - t, 5),
      wheelMultiplier: 0.85,
    });

    lenisRef.current = instance;
    setLenis(instance);

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
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
