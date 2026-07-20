"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useTrailingScroll } from "../useTrailingScroll";
import { HeadlinePhrase } from "./HeadlinePhrase";
import { remap } from "./scrollUtils";

gsap.registerPlugin(ScrollTrigger);

// The "Engenharia" section: just the opening phrase reveal, pinned on its
// own, white background. It used to also split the phrase apart and grow a
// circle into the next section — both were removed per explicit request
// ("quando o texto acabar de aparecer na tela, ele não deve se abrir mais,
// mas sim ir para baixo com o efeito de pixelado acontecendo"): once the
// phrase is fully revealed, it just holds for a short beat (HOLD_VH) and
// the pin releases straight into plain document flow — PixelDissolve.tsx
// (rendered right after this section in app/page.tsx) carries the white →
// #eaeaea color change across that handoff.
const CONTENT_VH = 260;
const HOLD_VH = 20;
const TOTAL_VH = CONTENT_VH + HOLD_VH;
const CONTENT_END = CONTENT_VH / TOTAL_VH;

// Exported so Header.tsx can land the "Engenharia" nav click somewhere the
// phrase has actually finished revealing, not at this pinned section's
// blank top edge — see the same pattern in ServicesSection.tsx/
// BrandCarousel.tsx (SERVICOS_REVEAL_FRACTION/MARCAS_REVEAL_FRACTION).
export const ENGENHARIA_REVEAL_FRACTION = CONTENT_END;

const PAGE_BG_COLOR = "#ffffff";

export function ScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const trailingScroll = useTrailingScroll();

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = remap(self.progress, 0, CONTENT_END, 0, 1);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  useEffect(() => {
    // A small residual parallax nudge on the whole content block, driven by
    // scroll momentum (see useTrailingScroll) — fades out once the section
    // has properly settled into view.
    function tick() {
      const entranceInfluence = 1 - remap(progressRef.current, 0, 0.15, 0, 1);
      if (rootRef.current) {
        const offset = trailingScroll.current.delta * 0.7 * entranceInfluence;
        rootRef.current.style.transform = offset ? `translateY(${offset}px)` : "";
      }
    }
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [trailingScroll]);

  return (
    <section
      id="engenharia"
      data-theme="light"
      ref={sectionRef}
      className="relative z-10"
      style={{ height: `${TOTAL_VH}vh`, backgroundColor: PAGE_BG_COLOR }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: PAGE_BG_COLOR }}>
        <div
          ref={rootRef}
          className="relative h-full w-full overflow-hidden"
          style={{ backgroundColor: PAGE_BG_COLOR }}
        >
          <HeadlinePhrase progressRef={progressRef} />
        </div>
      </div>
    </section>
  );
}
