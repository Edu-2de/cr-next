"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

// Scroll-driven accordion catalog, sitting directly below the products
// carousel (no title above it — an earlier round had a "Nosso catálogo"
// heading here, dropped per explicit request). Reference was a supplied
// "The solution" FAQ-style screenshot: product names stacked one under
// another; as the section scrolls, they open one at a time (first item open
// on arrival, each further scroll segment opening the next), revealing that
// product's description.
//
// Content/behavior history:
//   - only 3 items now — caller passes a curated `CATALOG_PRODUCTS` list
//     (see ProductsSection.tsx), not the full carousel PRODUCTS array, with
//     noticeably longer/richer descriptions than the carousel's.
//   - no hairline above the FIRST item — only `border-t` from the 2nd item
//     on, plus one extra closing rule rendered after the whole list.
//   - expand/collapse is a GSAP height tween (measuring the real content
//     height via `scrollHeight`, animating a plain `height` in px,
//     `power2.inOut`, 0.7s) plus a description opacity crossfade — NOT a CSS
//     `grid-template-rows` transition, which read as too abrupt/mechanical.
//   - a whole-screen auto-cycling brand-logo custom cursor was tried here
//     and then explicitly removed entirely — "tire esse efeito do cursor
//     virar as marcas nas opções do menu" — no cursor/BRANDS code left.
//   - a real 4-face CSS 3D "cube" title-flip effect was tried, went through
//     six rounds of bug fixes (interruption artifacts, a GSAP force3D quirk
//     that broke backface-visibility at rest, then a Lenis-smoothing
//     re-trigger bug), and was ultimately dropped anyway — "tire esse efeito
//     3d nos títulos do menu, substitua por um mais simples, esse não está
//     funcionando bem." Replaced below with a single-element fade+slide
//     reveal, which structurally cannot show doubled/stuck text (there's
//     only ever one title element per row, no stacked faces, no 3D, no
//     backface-visibility to break).
type CatalogProduct = { id: string; title: string; description: string };

// How much scroll distance (in vh) each item transition gets, AFTER
// accounting for the fixed one-viewport "tax" that a sticky/scrub pin always
// costs (with `start: "top top"`/`end: "bottom bottom"`, the usable scrub
// range is `wrapperHeight - 100vh`, not the wrapper's own height — a
// repeated lesson on this project). Always compute wrapper height as
// `100vh (tax) + products.length * SCROLL_PER_ITEM_VH`, never as a flat
// multiple of item count.
const SCROLL_PER_ITEM_VH = 40;
const HEIGHT_DURATION = 0.7;
const HEIGHT_EASE = "power2.inOut";
const REVEAL_DURATION = 0.6;
const REVEAL_EASE = "power3.out";

const TITLE_CLASS = "font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-5xl";

export function ProductCatalog({ products }: { products: CatalogProduct[] }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const rowHeightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  // Which item the reveal has already fired for — separate from
  // `activeIndex` (React state, drives the accordion open/close visuals) so
  // this can be read/written synchronously inside the scroll callbacks
  // below without stale-closure issues.
  const revealedIndexRef = useRef<number>(0);

  // Each item's "open" moment is a discrete, edge-triggered GSAP event
  // (onEnter/onEnterBack) — explicit correction from an earlier round: "por
  // conta de o efeito estar associado à porcentagem do scroll, quando era
  // para estar associado somente à opção abrir." A single `range` trigger
  // (no scrub, no animation — just used to read its own resolved
  // `start`/`end` scroll positions in px) supplies the pinned section's
  // total scrollable extent; one separate ScrollTrigger per item covers
  // exactly its own 1/N slice, firing onEnter/onEnterBack when scroll
  // crosses into it, from either direction.
  //
  // The reveal itself must NOT react to scroll beyond that single "this
  // option just opened" moment — explicit correction, again: "o efeito NAO
  // DEVE REAGIR AO SCROLL, deve ser automático: a opção abre, o efeito
  // acontece e para." This site scrolls through Lenis (see
  // components/LenisProvider.tsx), tuned with a deliberately heavy 1.5s
  // quintic smoothing, so the scroll position ScrollTrigger reads keeps
  // drifting well over a second after real input stops — a single ordinary
  // scroll gesture can cross an item's own boundary more than once as Lenis
  // gets retargeted mid-flight. `openItem` only ever plays the reveal for a
  // given index ONCE per genuine transition INTO it (guarded by
  // `revealedIndexRef`, which only changes when a *different* index opens)
  // and, once started, that tween is left alone — nothing here interrupts
  // or restarts it early. No onLeave/onLeaveBack handling is needed at all:
  // only one item is ever "active" at a time by construction, so opening
  // any item already implies every other item is closed.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const range = ScrollTrigger.create({ trigger: wrapper, start: "top top", end: "bottom bottom" });

    function openItem(i: number) {
      setActiveIndex(i);
      if (revealedIndexRef.current === i) return;
      revealedIndexRef.current = i;
      const title = titleRefs.current[i];
      if (!title) return;
      gsap.fromTo(
        title,
        { y: 16, opacity: 0.35 },
        { y: 0, opacity: 1, duration: REVEAL_DURATION, ease: REVEAL_EASE, overwrite: "auto" }
      );
    }

    const itemTriggers = products.map((_, i) =>
      ScrollTrigger.create({
        start: () => range.start + (i / products.length) * (range.end - range.start),
        end: () => range.start + ((i + 1) / products.length) * (range.end - range.start),
        onEnter: () => openItem(i),
        onEnterBack: () => openItem(i),
      })
    );

    // The very first item starts already "open" on load/arrival (no scroll
    // crossing has happened yet to fire its onEnter) — match that resting
    // state without playing a reveal for it.
    setActiveIndex(0);
    revealedIndexRef.current = 0;

    return () => {
      range.kill();
      itemTriggers.forEach((t) => t.kill());
    };
  }, [products.length]);

  // Smooth expand/collapse: measure the real content height and tween a
  // plain `height` in px (not a CSS grid-template-rows transition), plus a
  // title opacity crossfade between the active/inactive look. The reveal
  // tween itself is NOT triggered here — it's driven directly by the
  // discrete onEnter callbacks above, entirely decoupled from this
  // `activeIndex` state (which still legitimately drives which row is
  // visually "open," just not the reveal animation's timing).
  useEffect(() => {
    products.forEach((_, i) => {
      const row = rowHeightRefs.current[i];
      const inner = rowInnerRefs.current[i];
      const titleWrap = titleWrapRefs.current[i];
      if (!row || !inner) return;
      const isActive = i === activeIndex;
      gsap.to(row, { height: isActive ? inner.scrollHeight : 0, duration: HEIGHT_DURATION, ease: HEIGHT_EASE });
      gsap.to(inner, { opacity: isActive ? 1 : 0, duration: HEIGHT_DURATION * 0.7, ease: "power1.out" });
      if (titleWrap) {
        gsap.to(titleWrap, { opacity: isActive ? 1 : 0.3, duration: HEIGHT_DURATION * 0.7, ease: "power1.out" });
      }
    });
  }, [activeIndex, products]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `${100 + products.length * SCROLL_PER_ITEM_VH}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-12">
          {products.map((product, i) => (
            <div key={product.id} className={i === 0 ? undefined : "border-t border-ink-950/15"}>
              <div className="py-10 sm:py-16">
                <div
                  ref={(el) => {
                    titleWrapRefs.current[i] = el;
                  }}
                  style={{ opacity: i === activeIndex ? 1 : 0.3 }}
                >
                  <h3
                    ref={(el) => {
                      titleRefs.current[i] = el;
                    }}
                    className={TITLE_CLASS}
                  >
                    {product.title}
                  </h3>
                </div>
                <div
                  ref={(el) => {
                    rowHeightRefs.current[i] = el;
                  }}
                  className="overflow-hidden"
                  style={{ height: i === 0 ? undefined : 0 }}
                >
                  <div
                    ref={(el) => {
                      rowInnerRefs.current[i] = el;
                    }}
                    className="pt-4"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    <p className="max-w-2xl text-base leading-relaxed text-ink-950/60 sm:text-lg">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="border-t border-ink-950/15" />
        </div>
      </div>
    </div>
  );
}
