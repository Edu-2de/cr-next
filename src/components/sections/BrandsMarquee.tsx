"use client";

import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import { useIsDesktop } from "@/hooks/ui/useIsDesktop";
import abbImg from "@/assets/images/brand-abb-logo.png";
import sewImg from "@/assets/images/brand-sew-eurodrive-logo.png";
import kohlbachImg from "@/assets/images/brand-kohlbach-logo.jpg";
import mercosulImg from "@/assets/images/brand-mercosul-logo.png";
import wegImg from "@/assets/images/brand-weg-logo.jpg";

gsap.registerPlugin(Draggable, InertiaPlugin);

// Two infinite-crawl rows (top drifting right, bottom left), GSAP-driven
// rather than CSS @keyframes since globals.css forces CSS animation
// durations to ~0 under prefers-reduced-motion. Rendered in both Products
// and Services, so it lives here rather than in either section's folder.
export type Brand = { id: string; name: string; src: typeof abbImg };

export const BRANDS: Brand[] = [
  { id: "abb", name: "ABB", src: abbImg },
  { id: "sew", name: "SEW Eurodrive", src: sewImg },
  { id: "kohlbach", name: "Kohlbach", src: kohlbachImg },
  { id: "mercosul", name: "Mercosul", src: mercosulImg },
  { id: "weg", name: "WEG", src: wegImg },
];

// 4 repeats (not 2) so a full repeat's width always exceeds the viewport —
// otherwise the crawl runs dry near the wrap point on wide screens.
const REPEAT_COUNT = 4;
const TRACK_ITEMS = Array.from({ length: REPEAT_COUNT }, () => BRANDS).flat();

const ROW_DURATION_S = 50;
const CURSOR_SIZE_PX = 128;
const CURSOR_EDGE_PADDING_PX = 12;

const brandsMarqueeStyles = tv({
  slots: {
    rowTrack: "flex w-max cursor-grab gap-4 active:cursor-grabbing",
    badge: "shrink-0 cursor-none rounded-full border border-ink-950/15 px-8 py-4 sm:px-10 sm:py-5",
    root: "relative overflow-hidden py-16",
    rows: "flex flex-col gap-4",
    fadeLeft: "pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-mist to-transparent sm:w-32",
    fadeRight: "pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-mist to-transparent sm:w-32",
    cursor:
      "pointer-events-none fixed left-0 top-0 z-60 overflow-hidden rounded-full shadow-[0_20px_40px_-16px_rgba(5,7,10,0.45)] transition-opacity duration-200",
    cursorImage: "object-cover",
  },
});

function MarqueeRow({
  reverse,
  isDesktop,
  hoveredId,
  onBrandHover,
  onBrandTap,
}: {
  reverse: boolean;
  isDesktop: boolean;
  hoveredId: string | null;
  onBrandHover: (brand: Brand | null) => void;
  onBrandTap: (brand: Brand, event: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // x in pixels (not xPercent) so the auto-crawl and Draggable — which
    // only understands x/y in px — can drive the same tween/wrap instead of
    // fighting over two different coordinate systems.
    const oneSetWidth = track.scrollWidth / REPEAT_COUNT;
    const wrap = gsap.utils.wrap(-oneSetWidth, 0);
    gsap.set(track, { x: reverse ? 0 : -oneSetWidth });

    // Moving right = FROM -oneSetWidth TO 0. Moving left = the reverse.
    const tween = gsap.to(track, {
      x: reverse ? `-=${oneSetWidth}` : `+=${oneSetWidth}`,
      duration: ROW_DURATION_S,
      ease: "none",
      repeat: -1,
      modifiers: { x: gsap.utils.unitize(wrap) },
    });
    tweenRef.current = tween;

    // Auto-crawl + drag on every input type: Draggable writes `x` directly
    // during a drag/throw, bypassing the tween's own wrap modifier, so the
    // same wrap() is applied by hand in onDrag/onThrowUpdate too.
    const [draggable] = Draggable.create(track, {
      type: "x",
      inertia: true,
      onDragStart: () => tween.pause(),
      onDrag: function (this: Draggable) {
        gsap.set(track, { x: wrap(this.x) });
      },
      onThrowUpdate: function (this: Draggable) {
        gsap.set(track, { x: wrap(this.x) });
      },
      onThrowComplete: () => tween.play(),
      onDragEnd: function (this: Draggable) {
        if (!this.isThrowing) tween.play();
      },
    });

    return () => {
      tween.kill();
      draggable.kill();
    };
  }, [reverse]);

  useEffect(() => {
    if (isDesktop) return;
    // Below desktop, a selected brand's popup stays put — pause the row
    // it belongs to instead of driving pause/play off hover.
    if (hoveredId) tweenRef.current?.pause();
    else tweenRef.current?.play();
  }, [isDesktop, hoveredId]);

  const { rowTrack, badge } = brandsMarqueeStyles();

  return (
    <div
      ref={trackRef}
      className={rowTrack()}
      onMouseEnter={isDesktop ? () => tweenRef.current?.pause() : undefined}
      onMouseLeave={isDesktop ? () => tweenRef.current?.play() : undefined}
    >
      {TRACK_ITEMS.map((brand, i) => (
        <div
          key={`${brand.id}-${i}`}
          onMouseEnter={isDesktop ? () => onBrandHover(brand) : undefined}
          onMouseLeave={isDesktop ? () => onBrandHover(null) : undefined}
          onClick={
            isDesktop
              ? undefined
              : (event) => {
                  event.stopPropagation();
                  onBrandTap(brand, event);
                }
          }
          className={badge()}
        >
          <Text as="span" variant="brandPill" color="inkMuted">
            {brand.name}
          </Text>
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
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    quickX.current = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
    quickY.current = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });
  }, []);

  // Dismiss the tapped-open popup on any tap elsewhere on the page — badges
  // themselves stopPropagation so this only fires for outside taps.
  useEffect(() => {
    if (isDesktop || !hovered) return;
    function dismiss() {
      setHovered(null);
    }
    window.addEventListener("click", dismiss);
    return () => window.removeEventListener("click", dismiss);
  }, [isDesktop, hovered]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!isDesktop) return;
    quickX.current?.(event.clientX);
    quickY.current?.(event.clientY);
  }

  function handleBrandTap(brand: Brand, event: React.MouseEvent<HTMLDivElement>) {
    // Centered on the tapped badge's own rect, not event.clientX/clientY —
    // some mobile browsers report a synthetic click's coordinates as 0,0
    // (or otherwise unreliable) when it's dispatched from a touchend rather
    // than a real pointer move, which pinned the popup near the top-left
    // corner regardless of which badge was tapped. Still clamped inside the
    // viewport (the popup is centered on this point via negative margins)
    // since a badge near a narrow mobile screen's edge would otherwise
    // center it half off-screen.
    const rect = event.currentTarget.getBoundingClientRect();
    const half = CURSOR_SIZE_PX / 2 + CURSOR_EDGE_PADDING_PX;
    const x = gsap.utils.clamp(half, window.innerWidth - half, rect.left + rect.width / 2);
    const y = gsap.utils.clamp(half, window.innerHeight - half, rect.top + rect.height / 2);
    gsap.set(cursorRef.current, { x, y });
    setHovered((current) => (current?.id === brand.id ? null : brand));
  }

  const { root, rows, fadeLeft, fadeRight, cursor, cursorImage } = brandsMarqueeStyles();

  return (
    <div className={root()} onMouseMove={handleMouseMove}>
      <div className={rows()}>
        <MarqueeRow
          reverse={false}
          isDesktop={isDesktop}
          hoveredId={hovered?.id ?? null}
          onBrandHover={setHovered}
          onBrandTap={handleBrandTap}
        />
        <MarqueeRow
          reverse
          isDesktop={isDesktop}
          hoveredId={hovered?.id ?? null}
          onBrandHover={setHovered}
          onBrandTap={handleBrandTap}
        />
      </div>

      <div className={fadeLeft()} />
      <div className={fadeRight()} />

      <div
        ref={cursorRef}
        className={cursor()}
        style={{
          width: CURSOR_SIZE_PX,
          height: CURSOR_SIZE_PX,
          marginLeft: -CURSOR_SIZE_PX / 2,
          marginTop: -CURSOR_SIZE_PX / 2,
          opacity: hovered ? 1 : 0,
        }}
      >
        {hovered && (
          <Image src={hovered.src} alt={hovered.name} fill sizes={`${CURSOR_SIZE_PX}px`} className={cursorImage()} />
        )}
      </div>
    </div>
  );
}
