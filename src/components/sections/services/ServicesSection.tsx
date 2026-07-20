"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";
import { PAPER } from "@/lib/palette";
import { SERVICES, type Service } from "@/lib/services-info";
import { MOTOR_INTRO_TOTAL_VH, MotorIntro } from "./motor/MotorIntro";

gsap.registerPlugin(ScrollTrigger);

// Opens with MotorIntro's pinned sequence, then continues in plain scroll
// into this editorial services list — no scroll-hijacking past that point.
const PAGE_BG_COLOR = PAPER;

// Approximation — the list's real height depends on runtime text wrapping,
// unlike MotorIntro's fixed TOTAL_VH. Lands nav jumps at the list's first row.
const ASSUMED_LIST_VH = 140;
export const SERVICES_REVEAL_FRACTION = MOTOR_INTRO_TOTAL_VH / (MOTOR_INTRO_TOTAL_VH + ASSUMED_LIST_VH);

function ServiceRow({ service }: { service: Service }) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (rowRef.current) {
        gsap.fromTo(
          rowRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, rowRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rowRef} className="border-t border-ink-950/15 py-10 sm:py-14">
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-x-16 sm:gap-y-10">
        <Text as="h3" variant="rowHeading" color="ink">
          {service.title}
        </Text>
        <Text as="p" size="lg" leading="relaxed" color="inkMuted" className="sm:text-xl">
          {service.description}
        </Text>
        <div className="relative">
          <div className="relative h-52 w-full overflow-hidden rounded-md sm:h-60">
            <Image
              src={service.src}
              alt={service.title}
              fill
              sizes="(min-width: 640px) 400px, 100vw"
              className="object-cover"
            />
          </div>
          <Text as="span" variant="badge" color="white" className="absolute bottom-3 left-3 rounded-sm bg-ink-950 px-3 py-1.5">
            Ver serviço ↗
          </Text>
        </div>
      </div>
    </div>
  );
}

export function ServicesSection() {
  return (
    <Container as="section" id="services" data-theme="light">
      <MotorIntro />
      {/* id read by Header.tsx's scroll-spy to hide the fixed header while
          this list is in view. */}
      <div id="services-list" className="relative w-full" style={{ backgroundColor: PAGE_BG_COLOR }}>
        <div className="mx-auto max-w-[90rem] px-6 pb-24 sm:px-12">
          {SERVICES.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </div>
      </div>
    </Container>
  );
}
