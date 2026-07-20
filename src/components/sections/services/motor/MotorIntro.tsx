"use client";

import { Text } from "@/components/ui/Text";
import { PAPER } from "@/lib/palette";
import { useMotorIntroAnimation } from "@/hooks/useMotorIntroAnimation";
import { MotorModel } from "./MotorModel";

// Pinned sequence: a cube of particles forms into the motor, then slides
// into its side slot as the text fades in beside it — centered as one unit.
// Releases into normal scroll (ServicesSection.tsx) once done; same
// sticky-wrapper pin pattern as every other pinned section on this page.
const FORM_VH = 130;
const SLIDE_VH = 65;
const HOLD_VH = 2;
const TOTAL_VH = FORM_VH + SLIDE_VH + HOLD_VH;

const FORM_END = FORM_VH / TOTAL_VH;
const SLIDE_END = (FORM_VH + SLIDE_VH) / TOTAL_VH;

// Folded into ServicesSection's SERVICES_REVEAL_FRACTION so nav clicks land
// past this formation, not partway into it.
export const MOTOR_INTRO_TOTAL_VH = TOTAL_VH;

const PAGE_BG_COLOR = PAPER;

export function MotorIntro() {
  const { outerRef, motorBoxRef, textRef, formProgressRef } = useMotorIntroAnimation(FORM_END, SLIDE_END);

  return (
    <div ref={outerRef} className="relative z-10" style={{ height: `${TOTAL_VH}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: PAGE_BG_COLOR }}>
        {/* Watermark stays in its own layer, outside motorBoxRef, so it
            doesn't move when the box translates during the slide phase. */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-start justify-center pt-36 sm:pt-44">
          <Text as="span" variant="watermark" size="8xl" className="text-ink-950/[0.06] sm:text-[11rem]">
            Serviços
          </Text>
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-8 px-6 pt-36 sm:flex-row sm:gap-12 sm:pt-52">
          <div
            ref={textRef}
            className="flex max-w-md flex-col items-center text-center opacity-0 sm:items-start sm:text-left"
          >
            <Text as="p" variant="bodyLg" color="inkMuted">
              Da manutenção à instalação, cuidamos de cada etapa para que seus motores elétricos continuem operando
              com confiabilidade e performance máxima.
            </Text>
          </div>

          <div ref={motorBoxRef} className="relative h-72 w-72 shrink-0 sm:h-[28rem] sm:w-[28rem]">
            <MotorModel formProgressRef={formProgressRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
