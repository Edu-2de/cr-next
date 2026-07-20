"use client";

import { useRef } from "react";
import { useMotorParticles } from "@/hooks/useMotorParticles";

export function MotorModel({
  formProgressRef, // 0 = loose cube, 1 = fully formed motor
}: {
  formProgressRef?: React.RefObject<number>;
} = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);

  useMotorParticles(containerRef, canvasWrapRef, formProgressRef);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div ref={canvasWrapRef} className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
    </div>
  );
}
