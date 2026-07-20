"use client";

import { useEffect, useRef } from "react";
import { HeroContent } from "./HeroContent";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    // Hero is pinned (sticky) and gets covered by the next section sliding up
    // over it, rather than scrolling away — its geometric position never
    // leaves the viewport, so IntersectionObserver can't tell us when it's
    // actually hidden underneath. A simple scroll-position heuristic instead:
    // once we're well past one viewport height, the next section has covered
    // it, so pause the shader.
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
