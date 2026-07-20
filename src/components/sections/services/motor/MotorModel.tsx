"use client";

import { useRef } from "react";
import { tv } from "tailwind-variants";
import { useMotorParticles } from "./useMotorParticles";

const motorModelStyles = tv({
  slots: {
    // touch-none: without it, a touch drag over the canvas just scrolls the
    // page (pointermove fires but the gesture is consumed as a scroll) —
    // this is a small, self-contained widget, so trading page-scroll here
    // for the same disperse-on-drag interaction mouse users get is the
    // right call rather than the touch experience never really working.
    container: "relative h-full w-full touch-none",
    canvasWrap: "absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full",
  },
});

export function MotorModel({
  formProgressRef, // 0 = loose cube, 1 = fully formed motor
}: {
  formProgressRef?: React.RefObject<number>;
} = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);

  useMotorParticles(containerRef, canvasWrapRef, formProgressRef);

  const { container, canvasWrap } = motorModelStyles();

  return (
    <div ref={containerRef} className={container()}>
      <div ref={canvasWrapRef} className={canvasWrap()} />
    </div>
  );
}
