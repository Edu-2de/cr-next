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
import { MOTOR_INTRO_TOTAL_VH, MotorIntro } from "./MotorIntro";

gsap.registerPlugin(ScrollTrigger);

// Alternate take on the Serviços section, kept in its own folder so the
// original components/servicos/ServicesSection.tsx stays untouched. Three
// columns — images (left), titles (middle), descriptions (right). The
// titles column behaves like a scroll-driven picker/reel (reference:
// ycombinator.com's "During YC / Now" list): a continuous active index
// advances with scroll progress, the title list translates so the active
// title sits centered while neighbors fade toward the background, and the
// image/description columns crossfade in lockstep with that same index —
// "de acordo com o scroll, o texto selecionado muda... o conteúdo sobe ao
// dar o scroll".
//
// White now (was #eaeaea) — explicit request: the pixel-dissolve right
// before this section (see app/page.tsx) now hands off produtos' #eaeaea to
// pure white here, matching MotorIntro's own white backdrop for the
// sphere/motor sequence.
//
// MotorIntro (sphere → motor → slide+text) sits as its own separate pinned
// section right above this one — plain, un-hijacked document-flow scroll
// carries the page from the end of that section into this reel's own pin.
// A single merged pin with a crossfade/slide handoff was tried and
// explicitly rejected as "redirecionando" (reading as an artificial
// transition instead of the page just continuing to scroll down normally);
// two separate pins is correct here. Only each section's own internal hold
// length is trimmed (MotorIntro's HOLD_VH, this reel's REEL_HOLD_VH) to
// keep the plain scroll distance between them as short as it can be.
const PAGE_BG_COLOR = "#ffffff";

type Service = { id: string; src: typeof engenhariaImg; title: string; description: string };

// Same real photos/copy as the original Serviços section — this is still
// the site's one canonical set of services, just re-presented.
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

const ITEM_COUNT = SERVICES.length;

// One segment of pin scroll per transition between items, plus a hold at
// each end so the first and last service both get a beat fully centered
// before the reel starts/stops moving.
const SEGMENT_VH = 85;
const REEL_HOLD_VH = 8;
const SECTION_VH = REEL_HOLD_VH * 2 + SEGMENT_VH * (ITEM_COUNT - 1);
const PAD = REEL_HOLD_VH / SECTION_VH;

// Land Header's "Serviços" nav click past the whole MotorIntro sequence
// (sphere → motor → slide + text) and into the reel below, right at the
// reel's own hold-start (PAD) — not partway into the sphere/motor formation,
// which would read as "nothing happened" the same way landing at literal
// progress 0 would anywhere else on this page.
const OVERALL_VH = MOTOR_INTRO_TOTAL_VH + SECTION_VH;
export const SERVICOS_REVEAL_FRACTION = (MOTOR_INTRO_TOTAL_VH + PAD * SECTION_VH) / OVERALL_VH;

const ROW_HEIGHT_VH = 22;

export function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRefs = useRef<(HTMLParagraphElement | null)[]>([]);

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
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    function tick() {
      const progress = progressRef.current;
      const activeFloat = remap(progress, PAD, 1 - PAD, 0, ITEM_COUNT - 1);

      if (listRef.current) {
        const y = 50 - (activeFloat + 0.5) * ROW_HEIGHT_VH;
        gsap.set(listRef.current, { y: `${y}vh` });
      }

      SERVICES.forEach((_, i) => {
        const distance = Math.abs(i - activeFloat);
        const titleProximity = gsap.utils.clamp(0, 1, 1 - distance);
        // Images/descriptions are absolutely stacked (true crossfade, not a
        // reel like the titles) — a linear 1-unit falloff kept two of them
        // both highly opaque at once for too much of the scroll, reading as
        // an illegible double-exposure. Narrowing the fade to the last half
        // of the distance keeps one item crisp and fully opaque most of the
        // time, with only a brief, fast crossfade at the midpoint.
        const crossfadeProximity = 1 - remap(distance, 0.1, 0.5, 0, 1);

        const titleEl = titleRefs.current[i];
        if (titleEl) {
          titleEl.style.opacity = String(0.18 + titleProximity * 0.82);
          titleEl.style.transform = `scale(${0.92 + titleProximity * 0.08})`;
        }

        const imgEl = imageRefs.current[i];
        if (imgEl) imgEl.style.opacity = String(crossfadeProximity);

        const descEl = descRefs.current[i];
        if (descEl) descEl.style.opacity = String(crossfadeProximity);
      });
    }

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <section id="servicos" data-theme="light" className="relative z-10" style={{ backgroundColor: PAGE_BG_COLOR }}>
      <MotorIntro />

      <div
        ref={sectionRef}
        className="relative z-10"
        style={{ height: `${SECTION_VH}vh`, backgroundColor: PAGE_BG_COLOR }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: PAGE_BG_COLOR }}>
          <div className="mx-auto flex h-full w-full max-w-[90rem] items-center justify-center gap-4 px-4 sm:gap-10 sm:px-6">
          <div className="relative h-36 w-36 shrink-0 overflow-hidden sm:h-[28rem] sm:w-[28rem]">
            {SERVICES.map((service, i) => (
              <div
                key={service.id}
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
                className="absolute inset-0 shadow-[0_20px_40px_-16px_rgba(15,23,42,0.35)]"
                style={{ opacity: 0 }}
              >
                <Image src={service.src} alt={service.title} fill sizes="(min-width: 640px) 448px, 144px" className="object-cover" />
              </div>
            ))}
          </div>

          <div className="relative h-full w-48 shrink-0 overflow-hidden sm:w-[30rem]">
            <div ref={listRef} className="absolute inset-x-0 top-0">
              {SERVICES.map((service, i) => (
                <div
                  key={service.id}
                  ref={(el) => {
                    titleRefs.current[i] = el;
                  }}
                  className="flex items-center justify-center px-2 text-center"
                  style={{ height: `${ROW_HEIGHT_VH}vh` }}
                >
                  <h3 className="font-display text-lg font-bold leading-tight text-ink-950 sm:text-6xl">
                    {service.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden h-40 w-80 shrink-0 sm:block sm:h-40 sm:w-72">
            {SERVICES.map((service, i) => (
              <p
                key={service.id}
                ref={(el) => {
                  descRefs.current[i] = el;
                }}
                className="absolute inset-0 flex items-center text-lg leading-relaxed text-ink-950/60 sm:text-2xl"
                style={{ opacity: 0 }}
              >
                {service.description}
              </p>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
