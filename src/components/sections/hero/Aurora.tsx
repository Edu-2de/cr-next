"use client";

import { useRef } from "react";
import { tv } from "tailwind-variants";
import { useAuroraShader } from "./useAuroraShader";

const auroraStyles = tv({
  slots: {
    // fixed, not absolute: Chrome mis-composites a scaled WebGL canvas whose
    // positioned ancestor is `position: sticky` (the hero section pins at
    // top:0), producing a grey band drifting with scroll offset. A
    // viewport-fixed root sidesteps that ancestor entirely. It stays
    // visually correct because the hero's sticky box always occupies the
    // full viewport while "stuck", and once scrolled past, opaque z-10
    // sections cover it (see useAuroraShader's visibility toggle for why it
    // doesn't keep costing paint time after that).
    root: "fixed inset-0 overflow-hidden",
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
