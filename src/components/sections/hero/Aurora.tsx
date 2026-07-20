"use client";

import { useRef } from "react";
import { tv } from "tailwind-variants";
import { useAuroraShader } from "./useAuroraShader";

const auroraStyles = tv({
  slots: {
    root: "absolute inset-0 overflow-hidden",
    canvas: "absolute inset-0 h-full w-full",
    grain: "bg-grain pointer-events-none absolute inset-0",
  },
});

export function Aurora({ activeRef }: { activeRef?: React.RefObject<boolean> } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useAuroraShader(canvasRef, activeRef);

  const { root, canvas, grain } = auroraStyles();

  return (
    <div className={root()}>
      <canvas ref={canvasRef} className={canvas()} />
      <div className={grain()} />
    </div>
  );
}
