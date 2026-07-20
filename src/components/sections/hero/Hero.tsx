"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { HeroContent } from "./HeroContent";

// data-theme="dark": the Aurora field is medium/dark blue, so Header.tsx
// keeps its nav text white while over this section.
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
    <Container as="section" id="top" data-theme="dark" ref={sectionRef} position="sticky" z="base" width="full">
      <HeroContent activeRef={activeRef} />
    </Container>
  );
}
