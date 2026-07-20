"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { remap } from "../engenharia/scrollUtils";
import { MotorModel } from "./MotorModel";

gsap.registerPlugin(ScrollTrigger);

// Opens Serviços with its own pinned scroll sequence instead of a static
// title+motor block — explicit request: land on nothing but a sphere of
// blue particles centered on screen, the NEXT scroll turns it into the
// motor, THEN the motor slides over to its side slot and the title/
// paragraph fade in next to it — with the motor+text pair together always
// centered as one unit in the middle of the screen, not the motor alone
// centered while text hangs off to one side of a much wider box. Once this
// finishes, the pin releases into NORMAL document-flow scrolling straight
// into the reel effect right below (ServicesSection.tsx) — explicit
// correction after trying a merged single-pin crossfade/slide handoff,
// which read as "redirecionando" (an artificial transition) rather than
// the page just continuing to scroll down normally. Two separate
// pinned sections is the right structure here; only each one's own
// internal hold length should be trimmed to keep the plain scroll distance
// between them short.
//
// A "particles as spread background + big static title behind them" layout
// rework was tried after this and explicitly reverted — "não, volte como
// estava antes com a esfera" — back to this sphere-in-a-box design. THEN,
// on top of the restored design: "ao invés de uma esfera, faça um cubo, e
// meio que atrás do cubo, com uma cor próxima à cor de fundo coloque o
// título Serviços, assim, quando o cubo virar o motor, ele vai pra direita
// e mostra o texto da descrição." Two changes from that: (1) MotorModel's
// own starting shape is now a cube, not a sphere (see its own CUBE_HALF
// comment); (2) a "Serviços" watermark, low-opacity so it barely reads
// against the white background — the OLD "Serviços especializados" heading
// that used to fade in next to the motor is gone; only the description
// paragraph appears in the text column now, since the title's role moved to
// this background watermark instead. Follow-up correction: "ela não deve se
// mover, deve permanecer no meio" — the watermark now lives in its own
// fixed layer at the OUTER sticky container level (see JSX below), NOT
// inside motorBoxRef, so it stays put regardless of the cube/motor sliding
// right underneath it.
//
// Same sticky-wrapper pin pattern as every other pinned section on this
// page (tall wrapper + inner `sticky top-0 h-screen`, ScrollTrigger's
// progress read off `top top`/`bottom bottom`, NOT gsap's own pin:true).
// FORM_VH/SLIDE_VH bumped up (110→130, 40→65) and both eases switched from
// power2 to sine — explicit request: the sphere→motor formation and the
// text's arrival both read as "muito brusco" (too abrupt). `power2.out` in
// particular front-loads its rise (steep at the very start, easing off
// toward the end) — fine for a physical slide, but reads as a sudden "pop"
// when driving OPACITY directly (see `textOpacity` below, which is
// literally `slideT` with no separate curve of its own). `sine.inOut` is a
// proper S-curve (slow at both ends, no sudden jump anywhere in between),
// and the extra vh gives the whole sequence more scroll distance to unfold
// across — both aimed at "mais fluido", not just re-timed.
const FORM_VH = 130;
const SLIDE_VH = 65;
// Trimmed as far as it can go without being literally 0 — keeps the plain
// (unpinned) scroll distance to the reel right after this as short as
// possible.
const HOLD_VH = 2;
const TOTAL_VH = FORM_VH + SLIDE_VH + HOLD_VH;

const FORM_END = FORM_VH / TOTAL_VH;
const SLIDE_END = (FORM_VH + SLIDE_VH) / TOTAL_VH;

// Exported so ServicesSection.tsx can fold this sequence's own scroll
// distance into SERVICOS_REVEAL_FRACTION — without it, Header.tsx's nav
// click would land partway into the sphere/motor formation instead of past
// it, inside the reel where content is actually visible.
export const MOTOR_INTRO_TOTAL_VH = TOTAL_VH;

const FORM_EASE = gsap.parseEase("sine.inOut");
const SLIDE_EASE = gsap.parseEase("sine.inOut");

const PAGE_BG_COLOR = "#ffffff";

export function MotorIntro() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const motorBoxRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const formProgressRef = useRef(0);
  const centerOffsetRef = useRef(0);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: outerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    return () => trigger.kill();
  }, []);

  // How far (px) the motor box currently sits from true viewport-center,
  // ignoring whatever transform is already applied to it — measured with
  // the transform momentarily cleared so a resize mid-slide doesn't bake
  // in a stale offset.
  useEffect(() => {
    function measure() {
      const box = motorBoxRef.current;
      if (!box) return;
      const prevTransform = box.style.transform;
      box.style.transform = "";
      const rect = box.getBoundingClientRect();
      box.style.transform = prevTransform;
      centerOffsetRef.current = window.innerWidth / 2 - (rect.left + rect.width / 2);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    function tick() {
      const progress = progressRef.current;
      const formT = FORM_EASE(remap(progress, 0, FORM_END, 0, 1));
      const slideT = SLIDE_EASE(remap(progress, FORM_END, SLIDE_END, 0, 1));

      formProgressRef.current = formT;

      if (motorBoxRef.current) {
        const offset = centerOffsetRef.current * (1 - slideT);
        motorBoxRef.current.style.transform = offset ? `translateX(${offset}px)` : "";
      }

      if (textRef.current) {
        textRef.current.style.opacity = String(slideT);
        textRef.current.style.transform = `translateY(${(1 - slideT) * 16}px)`;
      }
    }
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div ref={outerRef} className="relative z-10" style={{ height: `${TOTAL_VH}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: PAGE_BG_COLOR }}>
        {/* "Serviços" watermark — explicit correction: "ela não deve se
            mover, deve permanecer no meio." Pulled OUT of motorBoxRef (which
            translates right during the SLIDE phase) into its own layer at
            the OUTER sticky container level instead, absolutely centered
            over the whole box independent of the cube/motor's own position,
            so it never moves regardless of where the box slides to. */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-start justify-center pt-36 sm:pt-44">
          <span className="font-display text-8xl font-bold italic uppercase tracking-tight text-ink-950/[0.06] sm:text-[11rem]">
            Serviços
          </span>
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-8 px-6 pt-36 sm:flex-row sm:gap-12 sm:pt-52">
          <div
            ref={textRef}
            className="flex max-w-md flex-col items-center text-center opacity-0 sm:items-start sm:text-left"
          >
            <p className="text-lg leading-relaxed text-ink-950/60 sm:text-2xl">
              Da manutenção à instalação, cuidamos de cada etapa para que seus motores elétricos continuem operando
              com confiabilidade e performance máxima.
            </p>
          </div>

          <div ref={motorBoxRef} className="relative h-72 w-72 shrink-0 sm:h-[28rem] sm:w-[28rem]">
            <MotorModel formProgressRef={formProgressRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
