"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import abbImg from "@/app/assets/images/abb-logo-png_seeklogo-1844.png";
import sewImg from "@/app/assets/images/sew-eurodrive-logo-png_seeklogo-236154.png";
import kohlbachImg from "@/app/assets/images/images.jpg";
import mercosulImg from "@/app/assets/images/images.png";
import wegImg from "@/app/assets/images/img-standard-share.jpg";

// Replaces the old standalone "Marcas" section (components/engenharia/
// BrandCarousel.tsx, no longer rendered) — brands are no longer their own
// pinned/scrolled section or a Header nav destination. Shared (not scoped to
// one section's folder) because it's now rendered twice: once inside
// Produtos (after the product cards) and once inside Serviços (right below
// the intro title/motor, before the reel), "para ficar em cima e embaixo
// esses carrosséis de marcas infinitos". Two rows, each an independent
// infinite crawl — top row drifting right, bottom row drifting left —
// driven by GSAP tweens rather than a CSS @keyframes animation: the first
// version used a CSS animation and read as completely static, because
// globals.css's site-wide `prefers-reduced-motion: reduce` block forces
// every CSS animation's duration to ~0. GSAP tweens aren't CSS animations,
// so they're unaffected — same reason every other scroll-driven effect in
// this codebase is already GSAP-driven instead. Hovering a badge swaps the
// OS cursor for that brand's logo image (following the pointer) and pauses
// just that row.
// Exported so ProductCatalog.tsx (the scroll-accordion catalog below the
// products carousel) can reuse the same 5 logos for its own hover-cursor,
// without a second copy of these image imports.
export type Brand = { id: string; name: string; src: typeof abbImg };

export const BRANDS: Brand[] = [
  { id: "abb", name: "ABB", src: abbImg },
  { id: "sew", name: "SEW Eurodrive", src: sewImg },
  { id: "kohlbach", name: "Kohlbach", src: kohlbachImg },
  { id: "mercosul", name: "Mercosul", src: mercosulImg },
  { id: "weg", name: "WEG", src: wegImg },
];

// Each row repeats the list 4x and the tween only ever shifts by one
// repeat's width (25% of the track). Explicit fix: with just 2 copies, one
// repeat's width was often narrower than the viewport (5 badges don't fill
// a wide desktop row) — near the wrap point the visible window ran past the
// end of the track into nothing, reading as a blank gap in the middle of
// the crawl. Four copies keeps 3 full repeats' worth of content always
// ahead of the window no matter the viewport width, so it never runs dry.
const REPEAT_COUNT = 4;
const TRACK_ITEMS = Array.from({ length: REPEAT_COUNT }, () => BRANDS).flat();
const LOOP_SHIFT_PERCENT = 100 / REPEAT_COUNT;

// Slow, deliberate crawl — same physical speed as a 2-copy/50%-shift track
// would have, since the shift percentage was cut in the same proportion the
// track got longer (duration is a distance-per-loop, not a total-track-width
// fraction).
const ROW_DURATION_S = 50;
const CURSOR_SIZE_PX = 128;

function MarqueeRow({
  reverse,
  onBrandHover,
}: {
  reverse: boolean;
  onBrandHover: (brand: Brand | null) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Moving right = animate FROM -shift% TO 0% (xPercent increasing).
    // Moving left = animate FROM 0% TO -shift% (xPercent decreasing).
    tweenRef.current = gsap.fromTo(
      track,
      { xPercent: reverse ? 0 : -LOOP_SHIFT_PERCENT },
      { xPercent: reverse ? -LOOP_SHIFT_PERCENT : 0, duration: ROW_DURATION_S, ease: "none", repeat: -1 },
    );
    return () => {
      tweenRef.current?.kill();
    };
  }, [reverse]);

  return (
    <div
      ref={trackRef}
      className="flex w-max gap-4"
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.play()}
    >
      {TRACK_ITEMS.map((brand, i) => (
        <div
          key={`${brand.id}-${i}`}
          onMouseEnter={() => onBrandHover(brand)}
          onMouseLeave={() => onBrandHover(null)}
          className="shrink-0 cursor-none rounded-full border border-ink-950/15 px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink-950/70 sm:px-10 sm:py-5 sm:text-base"
        >
          {brand.name}
        </div>
      ))}
    </div>
  );
}

export function BrandsMarquee() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const quickX = useRef<((value: number) => void) | null>(null);
  const quickY = useRef<((value: number) => void) | null>(null);
  const [hovered, setHovered] = useState<Brand | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    quickX.current = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
    quickY.current = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
  }, []);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    quickX.current?.(event.clientX);
    quickY.current?.(event.clientY);
  }

  return (
    <div className="relative overflow-hidden py-16" onMouseMove={handleMouseMove}>
      <div className="flex flex-col gap-4">
        <MarqueeRow reverse={false} onBrandHover={setHovered} />
        <MarqueeRow reverse onBrandHover={setHovered} />
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#eaeaea] to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#eaeaea] to-transparent sm:w-32" />

      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[60] overflow-hidden rounded-full shadow-[0_20px_40px_-16px_rgba(15,23,42,0.45)] transition-opacity duration-200"
        style={{
          width: CURSOR_SIZE_PX,
          height: CURSOR_SIZE_PX,
          marginLeft: -CURSOR_SIZE_PX / 2,
          marginTop: -CURSOR_SIZE_PX / 2,
          opacity: hovered ? 1 : 0,
        }}
      >
        {hovered && (
          <Image src={hovered.src} alt={hovered.name} fill sizes={`${CURSOR_SIZE_PX}px`} className="object-cover" />
        )}
      </div>
    </div>
  );
}
