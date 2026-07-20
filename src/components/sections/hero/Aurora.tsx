"use client";

import { useRef } from "react";
import { useAuroraShader } from "@/hooks/useAuroraShader";

export function Aurora({ activeRef }: { activeRef?: React.RefObject<boolean> } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useAuroraShader(canvasRef, activeRef);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="bg-grain pointer-events-none absolute inset-0" />
    </div>
  );
}
