"use client";

import { Container } from "@/components/ui/Container";
import { PAPER } from "@/lib/palette";
import { SERVICES } from "@/lib/services-info";
import { MOTOR_INTRO_TOTAL_VH, MotorIntro } from "./motor/MotorIntro";
import { ServiceRow } from "./ServiceRow";

// Opens with MotorIntro's pinned sequence, then continues in plain scroll
// into this editorial services list — no scroll-hijacking past that point.
const PAGE_BG_COLOR = PAPER;

// Approximation — the list's real height depends on runtime text wrapping,
// unlike MotorIntro's fixed TOTAL_VH. Lands nav jumps at the list's first row.
const ASSUMED_LIST_VH = 140;
export const SERVICES_REVEAL_FRACTION = MOTOR_INTRO_TOTAL_VH / (MOTOR_INTRO_TOTAL_VH + ASSUMED_LIST_VH);

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
