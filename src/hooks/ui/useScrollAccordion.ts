import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEIGHT_DURATION = 0.7;
const HEIGHT_EASE = "power2.inOut";
const REVEAL_DURATION = 0.6;
const REVEAL_EASE = "power3.out";

// One item open at a time (first item open on arrival). When `scrollDriven`
// is true, the section's own pinned scroll advances `activeIndex`
// (desktop); when false, nothing auto-advances — the caller drives it by
// calling `openItem` itself (a plain tap accordion, for small screens where
// scroll-jacking a whole section to reveal one item at a time is unusable).
export function useScrollAccordion(itemCount: number, scrollDriven: boolean) {
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

  const openItem = useCallback((i: number) => {
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
  }, []);

  // Resets to item 0 whenever the interaction mode itself flips (scroll-
  // driven <-> tap, e.g. a viewport crossing the desktop breakpoint) — done
  // during render, React's documented way to "adjust state when a prop
  // changes", instead of a setState called synchronously in an effect body.
  const prevScrollDrivenRef = useRef(scrollDriven);
  if (prevScrollDrivenRef.current !== scrollDriven) {
    prevScrollDrivenRef.current = scrollDriven;
    revealedIndexRef.current = 0;
    if (activeIndex !== 0) setActiveIndex(0);
  }

  useEffect(() => {
    if (!scrollDriven) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const range = ScrollTrigger.create({ trigger: wrapper, start: "top top", end: "bottom bottom" });

    const itemTriggers = Array.from({ length: itemCount }, (_, i) =>
      ScrollTrigger.create({
        start: () => range.start + (i / itemCount) * (range.end - range.start),
        end: () => range.start + ((i + 1) / itemCount) * (range.end - range.start),
        onEnter: () => openItem(i),
        onEnterBack: () => openItem(i),
      }),
    );

    return () => {
      range.kill();
      itemTriggers.forEach((t) => t.kill());
    };
  }, [itemCount, scrollDriven, openItem]);

  // Expand/collapse only — the title reveal itself is driven by openItem
  // above, decoupled from activeIndex.
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

  return { wrapperRef, activeIndex, rowHeightRefs, rowInnerRefs, titleWrapRefs, titleRefs, openItem };
}
