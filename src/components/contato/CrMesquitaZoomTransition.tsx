"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// Transition from Serviços into Contato — explicit request, replacing an
// earlier "small rectangle expands to cover the screen" idea that was
// itself a replacement for a "Contato slides up over a sticky base"
// mechanic (before that, a PixelDissolve handoff — see app/page.tsx's own
// history for the full chain): "aparece no meio da tela... as palavras CR
// MESQUITA em preto, aí no buraco da letra 'q' acontece um efeito que
// deixa a tela preta, o efeito é trazer a palavra para frente, focando na
// letra q até o buraco chegar bem próximo da tela, e usar o buraco... para
// deixar a tela preta... aproxime isso para deixar a tela toda preta e aí
// aparecer o conteúdo da seção de contato."
//
// Mechanism: "CR MESQUITA" renders black-on-white, centered, with the "Q"
// wrapped in its own ref so its real rendered position can be measured
// (same "measure a real DOM rect" idiom used elsewhere on this site,
// e.g. MotorIntro's old centerOffsetRef) — this is what lets the zoom
// target land precisely on the Q regardless of viewport size or exact font
// metrics, rather than a guessed fixed percentage. `transform-origin` on
// the whole word is set to a point INSIDE the Q's own stroke, just next to
// its counter/hole (not the hole's own center, and not dead-center of the
// glyph's bounding box) — `Q_ANCHOR_FRACTION` picks that point as a
// fraction of the Q glyph's own box. Scaling a WHOLE image up around a
// fixed point makes that point's own neighborhood dominate the frame as
// scale grows: early on you see the whole word; at a middle scale you're
// looking at the Q up close, with its white counter (the "buraco") visible
// nearby, framed by the black stroke around/beyond it ("as bordas e em
// cima e embaixo vai estar preto"); at extreme scale, since the anchor
// point sits solidly inside the stroke (not the counter), the counter has
// been pushed entirely out of frame and every pixel on screen is deep
// inside solid black ink.
//
// The site went through an extended detour where the reveal underneath the
// white cover was a WebGL Aurora effect (shared with ContatoSection) rather
// than flat black — reverted per explicit request: "ao invés de na seção
// de quem somos ter o efeito aurora, deixe a tela toda preta mesmo". So
// this is back to the original model: a plain black backdrop sits behind
// the white cover; the cover fades out (opacity 1→0), and the word itself
// also fades out afterward (in a later, narrower window) purely as a
// robustness measure — relying on the word's own ink to "cover" the frame
// at extreme scale alone was measured as unreliable (the scaled stroke
// doesn't reach every edge of the viewport at all aspect ratios), so both
// layers explicitly fade to nothing by progress=1, guaranteeing a clean,
// complete black screen right as the pin releases into ContatoSection.
const PIN_VH = 160;
const MAX_SCALE = 55;
const SCALE_EASE = gsap.parseEase("power2.in");
// White fades out first...
const WHITE_FADE_START = 0.55;
const WHITE_FADE_END = 0.85;
// ...then, once it's gone, the word itself fades out too, finishing
// exactly as the pin ends.
const WORD_FADE_START = 0.85;
const WORD_FADE_END = 1;

// Fraction of the Q glyph's own bounding box the zoom anchors on — X/Y
// picked to land inside the right-hand vertical stroke, close to (but not
// inside) the counter: past the counter's own right edge, short of the
// glyph's own right edge or the descender tail at the bottom.
const Q_ANCHOR_X = 0.72;
const Q_ANCHOR_Y = 0.45;

export function CrMesquitaZoomTransition() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);
  const qRef = useRef<HTMLSpanElement | null>(null);
  const whiteRef = useRef<HTMLDivElement | null>(null);

  // Position the zoom's transform-origin at a measured point inside the Q
  // glyph's own stroke — re-measured on resize so it stays accurate at any
  // viewport/font size, not baked in as a guessed percentage.
  useEffect(() => {
    function measure() {
      const word = wordRef.current;
      const q = qRef.current;
      if (!word || !q) return;
      const wordRect = word.getBoundingClientRect();
      const qRect = q.getBoundingClientRect();
      const anchorX = qRect.left + qRect.width * Q_ANCHOR_X;
      const anchorY = qRect.top + qRect.height * Q_ANCHOR_Y;
      const originX = ((anchorX - wordRect.left) / wordRect.width) * 100;
      const originY = ((anchorY - wordRect.top) / wordRect.height) * 100;
      word.style.transformOrigin = `${originX}% ${originY}%`;
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const word = wordRef.current;
    const white = whiteRef.current;
    if (!wrapper || !word || !white) return;

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const scale = 1 + (MAX_SCALE - 1) * SCALE_EASE(progress);
        word.style.transform = `scale(${scale})`;

        const whiteFadeT = Math.min(
          1,
          Math.max(0, (progress - WHITE_FADE_START) / (WHITE_FADE_END - WHITE_FADE_START)),
        );
        white.style.opacity = String(1 - whiteFadeT);

        const wordFadeT = Math.min(
          1,
          Math.max(0, (progress - WORD_FADE_START) / (WORD_FADE_END - WORD_FADE_START)),
        );
        word.style.opacity = String(1 - wordFadeT);
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div ref={wrapperRef} className="relative z-10" style={{ height: `${PIN_VH}vh` }}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-black">
        <div ref={whiteRef} className="pointer-events-none absolute inset-0 bg-white" />
        <div ref={wordRef} className="relative will-change-transform">
          <span className="font-display text-6xl font-bold tracking-tight text-ink-950 sm:text-8xl">
            CR MES
            <span ref={qRef}>Q</span>
            UITA
          </span>
        </div>
      </div>
    </div>
  );
}
