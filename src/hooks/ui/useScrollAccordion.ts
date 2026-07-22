import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HEIGHT_DURATION = 0.7;
// Gentler than power2 — a pronounced ease-out tail on `height` alone,
// with nothing else visibly still changing at that point, is what read as
// "stalls right before it finishes opening": the content's own opacity
// tween used to finish well before the box did (see the mismatched
// duration note below), so for the last ~30% of the reveal the only thing
// happening on screen was the box's own deceleration curve — plainly
// visible and easy to mistake for a hitch even though no frame was
// actually dropped.
const HEIGHT_EASE = "power1.inOut";
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
  // driven <-> tap, e.g. a viewport crossing the desktop breakpoint).
  // React's documented "adjust state when a prop changes" pattern — setState
  // called during render, guarded by comparing against a *state* mirror of
  // the previous prop — not a ref: refs can't be read or written during
  // render (only in effects/handlers), so the comparison itself has to live
  // in state for this to run here instead of in an effect body.
  const [prevScrollDriven, setPrevScrollDriven] = useState(scrollDriven);
  if (prevScrollDriven !== scrollDriven) {
    setPrevScrollDriven(scrollDriven);
    if (activeIndex !== 0) setActiveIndex(0);
  }

  // revealedIndexRef is a ref (not state) purely to guard replaying the
  // title-reveal animation — mutating it belongs in an effect, not render.
  useEffect(() => {
    revealedIndexRef.current = 0;
  }, [scrollDriven]);

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
  //
  // Only the row that closed and the row that opened actually change —
  // animate just those two instead of looping every item. Looping all of
  // them re-read `inner.scrollHeight` and started a (no-op, but not free)
  // height tween on every already-settled row on every single activation;
  // each `height` write forces a layout recalc, and on Chrome that reflow
  // cost stacked with whatever else is running (e.g. Header's own per-frame
  // layout reads) read as the accordion opening in one jump instead of
  // animating.
  const prevActiveIndexRef = useRef(activeIndex);
  useEffect(() => {
    const prevActive = prevActiveIndexRef.current;
    prevActiveIndexRef.current = activeIndex;
    if (prevActive === activeIndex) return;

    for (const i of [prevActive, activeIndex]) {
      const row = rowHeightRefs.current[i];
      const inner = rowInnerRefs.current[i];
      const titleWrap = titleWrapRefs.current[i];
      if (!row || !inner) continue;
      const isActive = i === activeIndex;
      gsap.to(row, { height: isActive ? inner.scrollHeight : 0, duration: HEIGHT_DURATION, ease: HEIGHT_EASE });
      // Opening: kept in sync with the height tween's own full duration —
      // finishing the fade early (the old `* 0.7`) left the box's own
      // ease-out tail as the only thing still visibly moving, reading as a
      // stall. Closing keeps the shorter fade since the content is already
      // invisible well before the box finishes collapsing anyway.
      gsap.to(inner, {
        opacity: isActive ? 1 : 0,
        duration: isActive ? HEIGHT_DURATION : HEIGHT_DURATION * 0.7,
        ease: "power1.out",
      });
      if (titleWrap) {
        gsap.to(titleWrap, { opacity: isActive ? 1 : 0.3, duration: HEIGHT_DURATION * 0.7, ease: "power1.out" });
      }
    }
  }, [activeIndex]);

  return { wrapperRef, activeIndex, rowHeightRefs, rowInnerRefs, titleWrapRefs, titleRefs, openItem };
}
