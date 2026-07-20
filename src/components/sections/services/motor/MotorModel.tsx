"use client";

import { useRef } from "react";
import { tv } from "tailwind-variants";
import { useMotorParticles } from "./useMotorParticles";

const motorModelStyles = tv({
  slots: {
    container: "relative h-full w-full",
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
