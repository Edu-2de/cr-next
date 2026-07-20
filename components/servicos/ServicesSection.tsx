"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import engenhariaImg from "@/app/assets/images/services.jpg";
import diagnosticoImg from "@/app/assets/images/services2.jpg";
import detalheImg from "@/app/assets/images/services3.jpg";
import instalacaoImg from "@/app/assets/images/services4.jpg";
import { remap } from "../engenharia/scrollUtils";

gsap.registerPlugin(ScrollTrigger);

// Own top-level pinned section (id="servicos"), #eaeaea background.
// Explicit request, current mechanism: no persistent title above the list
// anymore — instead, the ONLY thing on screen right as the section is
// scrolled into is the word "Serviços", centered and alone; it holds, then
// fades out by itself, and only then does the list-crossing effect begin
// ("na única coisa que vai ter na tela é a palavra serviços centralizada,
// ao descer mais o scroll essa palavra some com a opacidade, aí sim começa
// o efeito"). PixelDissolve.tsx (rendered just before this section) already
// carries the white → #eaeaea color handoff from "engenharia".
const SERVICOS_VH = 460;

const PAGE_BG_COLOR = "#eaeaea";

// Intro beat: "Serviços" fades in quickly, holds alone on screen — nothing
// else exists yet at this point, the list items are parked far off-screen
// (see ENTRANCE below) — then fades back out. A brief empty hold follows
// (ENTRANCE_START comes after INTRO_FADE_OUT_END with a gap) so the screen
// is genuinely blank for a beat between the word leaving and the list
// starting to arrive, per explicit request.
const INTRO_FADE_IN_END = 0.04;
const INTRO_HOLD_END = 0.13;
const INTRO_FADE_OUT_END = 0.22;

// Entrance + crossing, one continuous motion: images rise in from off-screen
// below, text descends in from off-screen above, and each image/title pair
// meets/crosses as they pass through the center — "a coluna das imagens vai
// subir vindo de lá de baixo da tela e a coluna de textos vai descer vindo
// lá de cima da tela, com elas se encontrando durante o scroll".
const ENTRANCE_START = 0.3;
const LIST_END = 0.92;

// Exported so Header.tsx can land the "Serviços" nav click once the list is
// underway, not at this pinned section's blank top edge.
export const SERVICOS_REVEAL_FRACTION = 0.55;

const ITEM_GAP_VH = 30;
// How far past the viewport each column starts/ends — large enough that at
// ENTRANCE_START (and again at LIST_END) every item, plus its own row
// spread, sits well outside the 100vh viewport, invisible. Explicit fix:
// this used to stop at a symmetric ON-SCREEN rest position once the columns
// had crossed — now each column keeps travelling in the SAME direction it
// entered from (images keep rising, text keeps descending) all the way
// through and off the far side, so both columns are fully gone by the time
// the section's pin releases into "marcas" ("deixe o usuário dar o scroll
// até tanto os textos quanto as imagens sumirem completamente da tela").
const ENTRANCE_TRAVEL_VH = 110;
const BASE_OFFSET_VH = ITEM_GAP_VH;
const START_IMG_Y = BASE_OFFSET_VH + ENTRANCE_TRAVEL_VH;
const END_IMG_Y = -START_IMG_Y;
const START_TEXT_Y = -BASE_OFFSET_VH - ENTRANCE_TRAVEL_VH;
const END_TEXT_Y = -START_TEXT_Y;

// Each item's horizontal position bulges along an arc based on its own
// current distance from the viewport's vertical center — maximum bulge
// exactly at center/focus, tapering back to the column's natural position
// further out. The two columns bulge in OPPOSITE directions — images bulge
// right (toward the text column), text bulges left (toward the images
// column) — combined with the vertical travel this reads as each item
// tracing a genuine curved/circular path through the center, not a straight
// vertical line. Explicit fix: at the previous, larger bulge (26vh, pulling
// both columns 52vh closer together combined) the in-focus pair actually
// overlapped rather than just reading as "closest together" — dialed back
// to 18vh and paired with a much wider static gap below so there's always a
// clear gap left over even at maximum bulge.
const ARC_RADIUS_VH = 40;
const ARC_MAX_ANGLE = Math.PI / 2;
const ARC_AMOUNT_VH = 18;

function arcXOffset(distanceFromCenterVh: number) {
  const angle = gsap.utils.clamp(-ARC_MAX_ANGLE, ARC_MAX_ANGLE, distanceFromCenterVh / ARC_RADIUS_VH);
  return ARC_AMOUNT_VH * Math.cos(angle);
}

// Each item's on-screen position trails its scroll-computed target instead
// of snapping straight to it every frame — "o efeito deve ser mais fluido...
// mais fluido com o comportamento do scroll" — same lerp-toward-target
// technique as useTrailingScroll elsewhere in this codebase, just applied
// per-item here instead of to the whole block.
const POSITION_LERP = 0.2;

function targetPoint(rowOffset: number, y: number, mirror: 1 | -1) {
  return { x: mirror * arcXOffset(rowOffset + y), y };
}

type Service = { id: string; src: typeof engenhariaImg; title: string; description: string };

// Same real photos previously used by the (now-deleted)
// ServicePhotoGallery.tsx — this is the site's one and only presentation of
// the company's services.
const SERVICES: Service[] = [
  {
    id: "manutencao",
    src: engenhariaImg,
    title: "Manutenção e reforma",
    description: "Desmontagem completa para inspeção, reparo e reforma de motores de grande porte.",
  },
  {
    id: "diagnostico",
    src: diagnosticoImg,
    title: "Testes e diagnóstico",
    description: "Equipamentos de teste elétrico para identificar falhas com precisão.",
  },
  {
    id: "engenharia",
    src: detalheImg,
    title: "Engenharia de detalhe",
    description: "Conhecimento técnico de cada componente interno do motor.",
  },
  {
    id: "instalacao",
    src: instalacaoImg,
    title: "Instalação e comissionamento",
    description: "Montagem, alinhamento e comissionamento de motores e bombas em plantas industriais.",
  },
];

type Point = { x: number; y: number };

const ITEM_COUNT = SERVICES.length;

function rowOffsetFor(i: number) {
  return (i - (ITEM_COUNT - 1) / 2) * ITEM_GAP_VH;
}

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const introRef = useRef<HTMLDivElement | null>(null);
  const leftItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Lazily seeded to each item's real off-screen starting point (not {0,0},
  // which sits at dead center) — otherwise the lerp would visibly animate
  // FROM the center TO off-screen the instant this mounts, flashing every
  // item across the middle of the screen before the section is even
  // scrolled into view.
  const leftCurrentRef = useRef<Point[]>(SERVICES.map((_, i) => targetPoint(rowOffsetFor(i), START_IMG_Y, 1)));
  const rightCurrentRef = useRef<Point[]>(SERVICES.map((_, i) => targetPoint(rowOffsetFor(i), START_TEXT_Y, -1)));

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  useEffect(() => {
    function tick() {
      const progress = progressRef.current;

      const introT =
        remap(progress, 0, INTRO_FADE_IN_END, 0, 1) - remap(progress, INTRO_HOLD_END, INTRO_FADE_OUT_END, 0, 1);
      if (introRef.current) {
        introRef.current.style.opacity = String(introT);
      }

      // Entrance + crossing: images rise in from off-screen below, text
      // descends in from off-screen above, meeting/crossing near the
      // center as they pass — one continuous lerp target per item, from its
      // own START_* to END_*.
      const listT = remap(progress, ENTRANCE_START, LIST_END, 0, 1);
      const imgY = gsap.utils.interpolate(START_IMG_Y, END_IMG_Y, listT);
      const textY = gsap.utils.interpolate(START_TEXT_Y, END_TEXT_Y, listT);

      SERVICES.forEach((_, i) => {
        const rowOffset = rowOffsetFor(i);

        const leftEl = leftItemRefs.current[i];
        if (leftEl) {
          const target = targetPoint(rowOffset, imgY, 1);
          const current = leftCurrentRef.current[i];
          current.x += (target.x - current.x) * POSITION_LERP;
          current.y += (target.y - current.y) * POSITION_LERP;
          gsap.set(leftEl, { x: `${current.x}vh`, y: `${current.y}vh` });
        }

        const rightEl = rightItemRefs.current[i];
        if (rightEl) {
          const target = targetPoint(rowOffset, textY, -1);
          const current = rightCurrentRef.current[i];
          current.x += (target.x - current.x) * POSITION_LERP;
          current.y += (target.y - current.y) * POSITION_LERP;
          gsap.set(rightEl, { x: `${current.x}vh`, y: `${current.y}vh` });
        }
      });
    }

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <section
      id="servicos"
      data-theme="light"
      ref={sectionRef}
      className="relative z-10"
      style={{ height: `${SERVICOS_VH}vh`, backgroundColor: PAGE_BG_COLOR }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: PAGE_BG_COLOR }}>
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="relative flex items-center justify-center gap-16 px-6 sm:gap-112 sm:px-12">
            <div className="flex flex-col">
              {SERVICES.map((service, i) => (
                <div
                  key={service.id}
                  ref={(el) => {
                    leftItemRefs.current[i] = el;
                  }}
                  className="flex shrink-0 items-center justify-center"
                  style={{ height: `${ITEM_GAP_VH}vh` }}
                >
                  <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-[0_20px_40px_-16px_rgba(15,23,42,0.35)] sm:h-64 sm:w-64">
                    <Image src={service.src} alt={service.title} fill sizes="256px" className="object-cover" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              {SERVICES.map((service, i) => (
                <div
                  key={service.id}
                  ref={(el) => {
                    rightItemRefs.current[i] = el;
                  }}
                  className="flex shrink-0 flex-col justify-center"
                  style={{ height: `${ITEM_GAP_VH}vh` }}
                >
                  <h3 className="font-display text-2xl font-semibold text-ink-950 sm:text-4xl">{service.title}</h3>
                  <p className="mt-3 max-w-[360px] text-base leading-relaxed text-ink-950/55 sm:text-lg">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The section's sole intro beat — "Serviços" alone on screen,
            fades in, holds, fades out. Rendered after the list so it paints
            in front while visible; once opacity hits 0 it's inert
            (pointer-events-none throughout, never blocks the list below). */}
        <div
          ref={introRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0"
        >
          <h2 className="font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight text-ink-950 sm:text-9xl">
            Serviços
          </h2>
        </div>
      </div>
    </section>
  );
}
