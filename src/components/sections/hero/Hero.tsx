"use client";

import { useEffect, useRef } from "react";
import { HeroContent } from "./HeroContent";

// An earlier dark-theme hero variant (different Aurora treatment) existed
// alongside this one and was deleted as unused — this is now simply "the"
// hero, folder renamed from hero2/ → hero/ and this component from Hero2 →
// Hero to match, no functional change. data-theme is "dark" because the
// Aurora field covers the whole screen in medium/dark blue tones —
// Header.tsx reads this to keep its own nav text white while it's over
// this section, matching "enquanto ele estiver na capa suas opções devem
// ter a cor branca".
export function Hero() {
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
