"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import engenhariaImg from "@/app/assets/images/services.jpg";
import diagnosticoImg from "@/app/assets/images/services2.jpg";
import detalheImg from "@/app/assets/images/services3.jpg";
import instalacaoImg from "@/app/assets/images/services4.jpg";
import { MOTOR_INTRO_TOTAL_VH, MotorIntro } from "../servicos2/MotorIntro";

gsap.registerPlugin(ScrollTrigger);

// Experimental Serviços variant — kept in its own folder so servicos2 stays
// untouched/comparable. MotorIntro (sphere → motor-as-particles → slide
// next to text) is reused UNCHANGED from servicos2, imported directly
// rather than forked — explicit follow-up request dropped the whole
// grow/move-left/particles-to-solid sequence this file used to have on top
// of it ("esqueça essa ideia do motor ir pra esquerda... ao texto do motor
// aparecer quero que apenas desça a tela mostrando os serviços"). Once
// MotorIntro's own pin finishes (text visible next to the motor), the page
// just continues in plain normal scroll into this services list below —
// no second pinned sequence, no scroll-hijacking of any kind past that
// point.
//
// The list itself: reference is a supplied screenshot of futurethree.studio
// (an editorial services list — small uppercase "kicker" label top-left,
// then rows of: bold oversized category title, description paragraph, and
// a photo with a dark label pill overlapping its bottom-left corner, thin
// hairlines between rows). Each row plays its own small scroll-triggered
// entrance (fade + slide up) the first time it scrolls into view —
// "quando descer o scroll e estiver na hora de aparecer o serviço, ele
// aparece com uma animaçãozinha" — same toggling-ScrollTrigger idiom this
// codebase already uses for its own section headers elsewhere, not a
// pinned/scrubbed sequence.
const PAGE_BG_COLOR = "#ffffff";

// Approximation, not exact — the list is plain normal-flow content, whose
// real rendered height depends on runtime text wrapping, not a fixed vh
// like MotorIntro's own TOTAL_VH. Lands the nav jump right at the list's
// first row, immediately past MotorIntro's own pin.
const ASSUMED_LIST_VH = 140;
export const SERVICOS_REVEAL_FRACTION = MOTOR_INTRO_TOTAL_VH / (MOTOR_INTRO_TOTAL_VH + ASSUMED_LIST_VH);

type Service = { id: string; src: typeof engenhariaImg; title: string; description: string };

// Descriptions deliberately longer/more detailed now, paired with a
// smaller title — explicit request: "coloque uma descrição maior para cada
// serviço (de texto, conteúdo) e um título menor (de texto)."
const SERVICES: Service[] = [
  {
    id: "manutencao",
    src: engenhariaImg,
    title: "Manutenção e reforma",
    description:
      "Desmontagem completa para inspeção, reparo e reforma de motores de grande porte, com laudo técnico detalhado de cada etapa. Substituição de rolamentos, bobinas e componentes desgastados por peças originais ou equivalentes homologadas, sempre respeitando as especificações do fabricante. Testes finais de vibração, temperatura e isolamento garantem que o motor volte a operar com a mesma confiabilidade de um equipamento novo.",
  },
  {
    id: "diagnostico",
    src: diagnosticoImg,
    title: "Testes e diagnóstico",
    description:
      "Equipamentos de teste elétrico de última geração para identificar falhas com precisão, antes que se tornem uma parada não programada. Análise de resistência de isolamento, corrente de fuga e resposta em frequência revelam problemas internos invisíveis a uma inspeção visual. Cada diagnóstico gera um relatório claro, com recomendação objetiva de reparo, reforma ou substituição.",
  },
  {
    id: "engenharia",
    src: detalheImg,
    title: "Engenharia de detalhe",
    description:
      "Conhecimento técnico aprofundado de cada componente interno do motor, do enrolamento ao sistema de refrigeração, aplicado em projetos de retrofit e otimização de eficiência energética. Nossa equipe avalia o histórico operacional do equipamento e propõe ajustes de engenharia sob medida, sem depender de soluções genéricas de catálogo. O resultado é um motor mais eficiente, mais silencioso e com vida útil estendida.",
  },
  {
    id: "instalacao",
    src: instalacaoImg,
    title: "Instalação e comissionamento",
    description:
      "Montagem, alinhamento a laser e comissionamento completo de motores e bombas em plantas industriais, seguindo rigorosamente as normas técnicas vigentes. Acompanhamento presencial da partida inicial, com registro de todos os parâmetros elétricos e mecânicos relevantes para a operação segura do equipamento. Suporte contínuo nas primeiras horas de funcionamento, garantindo uma transição tranquila até a operação plena.",
  },
];

function ServiceRow({ service }: { service: Service }) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (rowRef.current) {
        gsap.fromTo(
          rowRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, rowRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rowRef} className="border-t border-ink-950/15 py-10 sm:py-14">
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-x-16 sm:gap-y-10">
        <h3 className="font-display text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">{service.title}</h3>
        <p className="text-lg leading-relaxed text-ink-950/60 sm:text-xl">{service.description}</p>
        <div className="relative">
          <div className="relative h-52 w-full overflow-hidden rounded-md sm:h-60">
            <Image
              src={service.src}
              alt={service.title}
              fill
              sizes="(min-width: 640px) 400px, 100vw"
              className="object-cover"
            />
          </div>
          <span className="absolute bottom-3 left-3 rounded-sm bg-ink-950 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Ver serviço ↗
          </span>
        </div>
      </div>
    </div>
  );
}

export function ServicesSection() {
  return (
    <section id="servicos" data-theme="light" className="relative z-10">
      <MotorIntro />
      {/* MotorIntro's own content (motor+text) sits vertically CENTERED
          inside a full h-screen sticky box (untouched, imported as-is) —
          so even at zero top padding here, there's real empty space between
          the visible bottom of that text/motor and where this wrapper
          starts. Explicit request to close some of that gap: "esse texto
          com o motor são tipo o título da seção, e os serviços o conteúdo."
          Churn on this value: 0 → -22vh (way too aggressive — pulled the
          first row up so far it read as already-scrolled-past/cut off
          before it could settle) → -9vh (still reported as cut off) → 0
          (back to no pull at all, since two rounds of negative margin both
          overshot into clipping the first row). If asked to close this gap
          again, look at MotorIntro's OWN vertical-centering layout
          (imported unchanged from servicos2) rather than reaching for
          another negative-margin guess on this wrapper — that's the actual
          source of the dead space, and this wrapper's own margin has
          already proven unreliable for compensating it without clipping. */}
      {/* id targeted by Header.tsx's scroll-spy to hide the fixed header
          for as long as this list is anywhere in view — explicit request:
          "durante a parte dos serviços, onde eles aparecem em linha, retire
          o header durante aquela parte." Only this list, not MotorIntro
          above it. */}
      <div id="servicos-lista" className="relative w-full" style={{ backgroundColor: PAGE_BG_COLOR }}>
        <div className="mx-auto max-w-[90rem] px-6 pb-24 sm:px-12">
          {SERVICES.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
