import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEIGHT_DURATION = 0.7;
const HEIGHT_EASE = "power2.inOut";
const REVEAL_DURATION = 0.6;
const REVEAL_EASE = "power3.out";

// Scroll-driven accordion: one item open at a time as the section scrolls
// (first item open on arrival). `itemCount` is all the animation math ever
// needed from the caller's product list — it never reads the product data
// itself, just its length and index.
export function useScrollAccordion(itemCount: number) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const rowHeightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  // Index the reveal has already fired for — guards against replaying it,
  // since Lenis's smoothing means a single scroll gesture can cross an
  // item's boundary more than once.
  const revealedIndexRef = useRef<number>(0);

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
        { y: 0, opacity: 1, duration: REVEAL_DURATION, ease: REVEAL_EASE, overwrite: "auto" },
      );
    }

    const itemTriggers = Array.from({ length: itemCount }, (_, i) =>
      ScrollTrigger.create({
        start: () => range.start + (i / itemCount) * (range.end - range.start),
        end: () => range.start + ((i + 1) / itemCount) * (range.end - range.start),
        onEnter: () => openItem(i),
        onEnterBack: () => openItem(i),
      }),
    );

    // First item starts open without a scroll crossing to fire its onEnter.
    setActiveIndex(0);
    revealedIndexRef.current = 0;

    return () => {
      range.kill();
      itemTriggers.forEach((t) => t.kill());
    };
  }, [itemCount]);

  // Expand/collapse only — the title reveal itself is driven by the onEnter
  // callbacks above, decoupled from activeIndex.
  useEffect(() => {
    for (let i = 0; i < itemCount; i++) {
      const row = rowHeightRefs.current[i];
      const inner = rowInnerRefs.current[i];
      const titleWrap = titleWrapRefs.current[i];
      if (!row || !inner) continue;
      const isActive = i === activeIndex;
      gsap.to(row, { height: isActive ? inner.scrollHeight : 0, duration: HEIGHT_DURATION, ease: HEIGHT_EASE });
      gsap.to(inner, { opacity: isActive ? 1 : 0, duration: HEIGHT_DURATION * 0.7, ease: "power1.out" });
      if (titleWrap) {
        gsap.to(titleWrap, { opacity: isActive ? 1 : 0.3, duration: HEIGHT_DURATION * 0.7, ease: "power1.out" });
      }
    }
  }, [activeIndex, itemCount]);

  return { wrapperRef, activeIndex, rowHeightRefs, rowInnerRefs, titleWrapRefs, titleRefs };
}
