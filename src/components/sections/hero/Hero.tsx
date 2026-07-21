"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Container } from "@/components/ui/Container";
import { HeroContent } from "./HeroContent";

// data-theme="dark": the Aurora field is medium/dark blue, so Header.tsx
// keeps its nav text white while over this section.
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    // Polled every frame (not just on 'scroll') — a discrete scroll listener
    // can miss the moment scrollY drops back under the threshold once a
    // fast/eased (Lenis) scroll gesture settles without firing another
    // event, leaving the Aurora canvas frozen on whatever frame it stopped
    // drawing on.
    //
    // Pause as soon as the reveal transition starts (not at 1.15 viewport
    // heights) — the shader draw + pointer interactivity kept running for
    // most of the transition scroll distance, competing with Chrome's
    // sticky/compositing work for that same stretch and reading as jank.
    // Freezing immediately leaves Aurora static (last frame + hidden, so it
    // stops receiving pointer events too) through the whole transition and
    // after. Hysteresis (pause later than resume) avoids flicker from
    // Lenis's fractional settling right at the boundary.
    const PAUSE_AT = 16;
    const RESUME_AT = 4;
    function updateActive() {
      const y = window.scrollY;
      if (activeRef.current && y > PAUSE_AT) activeRef.current = false;
      else if (!activeRef.current && y < RESUME_AT) activeRef.current = true;
    }
    updateActive();
    gsap.ticker.add(updateActive);
    return () => gsap.ticker.remove(updateActive);
  }, []);

  return (
    <Container as="section" id="top" data-theme="dark" ref={sectionRef} position="sticky" z="base" width="full">
      <HeroContent activeRef={activeRef} />
    </Container>
  );
}
