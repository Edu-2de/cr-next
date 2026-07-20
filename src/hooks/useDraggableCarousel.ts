import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

// Infinite auto-crawl that's also mouse-draggable. `repeatCount` must match
// how many times the caller repeated its track items (drives the wrap
// width); `durationS` is the auto-crawl's seconds-per-loop.
export function useDraggableCarousel(repeatCount: number, durationS: number) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Auto-crawl + drag: Draggable writes `x` directly during a drag/throw,
  // bypassing the tween's own wrap modifier, so the same wrap() is applied
  // by hand in onDrag/onThrowUpdate too.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const oneSetWidth = track.scrollWidth / repeatCount;
    const wrap = gsap.utils.wrap(-oneSetWidth, 0);

    const tween = gsap.to(track, {
      x: `-=${oneSetWidth}`,
      duration: durationS,
      ease: "none",
      repeat: -1,
      modifiers: { x: gsap.utils.unitize(wrap) },
    });
    tweenRef.current = tween;

    const [draggable] = Draggable.create(track, {
      type: "x",
      inertia: true,
      onDragStart: () => tween.pause(),
      onDrag: function () {
        gsap.set(track, { x: wrap(this.x) });
      },
      onThrowUpdate: function () {
        gsap.set(track, { x: wrap(this.x) });
      },
      onThrowComplete: () => tween.play(),
      onDragEnd: function () {
        if (!this.isThrowing) tween.play();
      },
    });

    return () => {
      tween.kill();
      draggable.kill();
    };
  }, [repeatCount, durationS]);

  function onMouseEnter() {
    tweenRef.current?.pause();
  }

  function onMouseLeave() {
    tweenRef.current?.play();
  }

  return { trackRef, onMouseEnter, onMouseLeave };
}
