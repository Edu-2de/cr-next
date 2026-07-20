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
    function updateActive() {
      activeRef.current = window.scrollY < window.innerHeight * 1.15;
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
