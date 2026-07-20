"use client";

import { useEffect, useRef } from "react";
import { HeroContent } from "./HeroContent";

// Variant of components/hero/Hero.tsx using HeroContent/Aurora's
// full-screen blue effect instead of the original dark navy background —
// same sticky "overlap reveal" pin mechanic and activeRef pattern (pauses
// the Aurora shader once scrolled out of view). data-theme is "dark" (not
// "light") because the Aurora field now covers the whole screen in
// medium/dark blue tones — Header.tsx reads this to keep its own nav text
// white while it's over this section, matching "enquanto ele estiver na
// capa suas opções devem ter a cor branca".
export function Hero2() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    function updateActive() {
      activeRef.current = window.scrollY < window.innerHeight * 1.15;
    }
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, []);

  return (
    <section id="top" data-theme="dark" ref={sectionRef} className="sticky top-0 z-0 w-full">
      <HeroContent activeRef={activeRef} />
    </section>
  );
}
