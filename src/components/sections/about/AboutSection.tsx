"use client";

import Image from "next/image";
import { useRef } from "react";
import { tv } from "tailwind-variants";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";
import { STAT_TEXT, useAboutAnimations } from "./useAboutAnimations";
import { FactoryLocation } from "./FactoryLocation";

import logoImg from "@/assets/images/logo.png";

const HEADLINE = "sobre nós";

const CONSOLIDATED_TITLE = "Uma empresa consolidada";
const FACTORY_TITLE = "Fábrica própria";

const aboutSectionStyles = tv({
  slots: {
    headlineBand: "flex h-[75vh] w-full flex-col overflow-hidden sm:h-[80vh]",
    headlineCenterer: "flex flex-1 items-center justify-center px-4",
    headlineText: "leading-[0.9] whitespace-nowrap select-none opacity-0",
    content: "mx-auto max-w-6xl px-6 sm:px-12",
    introBlock: "max-w-2xl opacity-0",
    introParagraphs: "mt-7 flex flex-col gap-7 sm:mt-8 sm:gap-8",
    statConsolidatedGrid: "mt-40 grid grid-cols-1 items-center gap-10 sm:mt-56 sm:gap-12 lg:grid-cols-12",
    statWrap: "opacity-0 lg:col-span-5",
    statText: "block select-none",
    consolidatedBlock: "opacity-0 lg:col-span-7",
    consolidatedParagraph: "mt-6 sm:mt-7",
    logoBlock: "mx-auto mt-40 max-w-2xl opacity-0 sm:mt-56",
    logoCard: "rounded-2xl bg-white p-6 sm:p-8",
    logoImage: "h-auto w-full",
    logoCaption: "mt-10 sm:mt-14",
    factoryBlock: "mt-40 max-w-2xl opacity-0 sm:mt-56",
    factoryParagraph: "mt-6 sm:mt-7",
    bottomSpacer: "h-28 sm:h-36",
  },
});

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const statWrapRef = useRef<HTMLDivElement | null>(null);
  const statRef = useRef<HTMLSpanElement | null>(null);
  const consolidatedRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const factoryRef = useRef<HTMLDivElement | null>(null);
  const factoryPhotoBoxRef = useRef<HTMLDivElement | null>(null);
  const factoryPhotoRef = useRef<HTMLDivElement | null>(null);
  const mapBoxRef = useRef<HTMLDivElement | null>(null);

  useAboutAnimations({
    sectionRef,
    headlineRef,
    introRef,
    statWrapRef,
    statRef,
    consolidatedRef,
    logoRef,
    factoryRef,
    factoryPhotoBoxRef,
    factoryPhotoRef,
    mapBoxRef,
  });

  const {
    headlineBand,
    headlineCenterer,
    headlineText,
    content,
    introBlock,
    introParagraphs,
    statConsolidatedGrid,
    statWrap,
    statText,
    consolidatedBlock,
    consolidatedParagraph,
    logoBlock,
    logoCard,
    logoImage,
    logoCaption,
    factoryBlock,
    factoryParagraph,
    bottomSpacer,
  } = aboutSectionStyles();

  return (
    <Container as="section" id="about" data-theme="dark" ref={sectionRef} width="full" surface="ink">
      <div className={headlineBand()}>
        <div className={headlineCenterer()}>
          <Text
            as="h2"
            ref={headlineRef}
            font="display"
            weight="bold"
            tracking="tight"
            align="center"
            color="white"
            className={headlineText()}
            style={{ fontSize: "clamp(4.5rem, 21vw, 17rem)" }}
          >
            {HEADLINE}
          </Text>
        </div>
      </div>

      <div className={content()}>
        <div ref={introRef} className={introBlock()}>
          <Text as="h3" variant="cardHeading" color="white">
            Quem somos
          </Text>
          <div className={introParagraphs()}>
            <Text as="p" variant="lead" color="whiteMuted">
              Somos a CR Mesquita, uma empresa de Porto Alegre, RS, dedicada à reforma e
              manutenção de motores e bombas elétricas industriais. Há mais de 50 anos
              acompanhamos a indústria gaúcha, unindo experiência prática e rigor técnico em cada
              equipamento que passa pelas nossas mãos.
            </Text>
            <Text as="p" variant="lead" color="whiteMuted">
              Do diagnóstico técnico completo ao comissionamento final, cuidamos de cada etapa com
              a mesma atenção — testes, reforma, alinhamento e acompanhamento de partida. O
              objetivo é sempre o mesmo: garantir que a operação do cliente nunca precise parar.
            </Text>
          </div>
        </div>

        <div className={statConsolidatedGrid()}>
          <div ref={statWrapRef} className={statWrap()}>
            <Text
              as="span"
              ref={statRef}
              font="mono"
              weight="bold"
              leading="none"
              color="whiteGhost"
              className={statText()}
              style={{ fontSize: "clamp(6rem, 12vw, 11rem)" }}
            >
              {"".padStart(STAT_TEXT.length, " ")}
            </Text>
          </div>

          <div ref={consolidatedRef} className={consolidatedBlock()}>
            <Text as="h3" variant="cardHeading" color="white">
              {CONSOLIDATED_TITLE}
            </Text>
            <Text as="p" variant="lead" color="whiteMuted" className={consolidatedParagraph()}>
              Somos uma empresa consolidada há mais de 50 anos no mercado, com uma reputação
              construída junto à indústria gaúcha através da qualidade técnica e da confiança de
              quem já trabalhou com a gente.
            </Text>
          </div>
        </div>

        <div ref={logoRef} className={logoBlock()}>
          {/* Logo is opaque white — needs a light backing, not the section's black bg. */}
          <div className={logoCard()}>
            <Image
              src={logoImg}
              alt="CR Mesquita Motores Elétricos"
              className={logoImage()}
              sizes="(min-width: 1024px) 42rem, 100vw"
            />
          </div>
          <Text as="p" variant="lead" align="justify" color="whiteMuted" className={logoCaption()}>
            Fundada em 1975, a CR Mesquita carrega até hoje o selo de mais de 50 anos de história na
            indústria gaúcha.
          </Text>
        </div>

        <div ref={factoryRef} className={factoryBlock()}>
          <Text as="h3" variant="cardHeading" color="white">
            {FACTORY_TITLE}
          </Text>
          <Text as="p" variant="lead" color="whiteMuted" className={factoryParagraph()}>
            Temos uma fábrica própria em Porto Alegre, equipada com maquinário e equipe
            especializada para reformar, testar e comissionar motores e bombas elétricas de
            qualquer porte — sem depender de terceiros em nenhuma etapa do processo.
          </Text>
        </div>
      </div>

      <FactoryLocation factoryPhotoBoxRef={factoryPhotoBoxRef} factoryPhotoRef={factoryPhotoRef} mapBoxRef={mapBoxRef} />

      <div className={bottomSpacer()} />
    </Container>
  );
}
