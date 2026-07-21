"use client";

import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";
import Image from "next/image";
import { useRef } from "react";
import { tv } from "tailwind-variants";
import { FactoryLocation } from "./FactoryLocation";
import { STAT_TEXT, useAboutAnimations } from "./useAboutAnimations";

import logoImg from "@/assets/images/logo.png";

const HEADLINE = "sobre nós";

const CONSOLIDATED_TITLE = "Uma empresa consolidada";
const FACTORY_TITLE = "Oficina própria";

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
              Sediada em Porto Alegre/RS, a CR Mesquita é referência na venda de motores elétricos, peças de reposição, assistência técnica Mercosul e na recuperação e rebobinagem de motores e geradores de todas as potências.


            </Text>
            <Text as="p" variant="lead" color="whiteMuted">
              Nossa jornada começou em abril de 1975, focada na prestação de serviços especializados de rebobinagem. Com o crescimento e a confiança do mercado, em 2010 ampliamos nossa atuação para a venda direta de equipamentos e peças, estruturando um dos estoques mais completos da região para pronto atendimento.
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
              Somos uma empresa com mais de meio século de atuação, construindo uma sólida reputação na indústria gaúcha baseada em rigor técnico, excelência em serviços e na confiança de quem conhece o nosso trabalho.
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
            Tradição e excelência técnica desde 1975 a serviço da indústria gaúcha.
          </Text>
        </div>

        <div ref={factoryRef} className={factoryBlock()}>
          <Text as="h3" variant="cardHeading" color="white">
            {FACTORY_TITLE}
          </Text>
          <Text as="p" variant="lead" color="whiteMuted" className={factoryParagraph()}>
            Nossa estrutura conta com oficina própria e infraestrutura completa em Porto Alegre. Realizamos testes rigorosos e reformas em motores de todos os portes com equipe 100% dedicada, assegurando agilidade e precisão em todo o processo. Venha conhecer nossa estrutura e ver de perto o padrão do nosso trabalho!
            <br/>
            Endereço: Av. Maranhão, 48 - São Geraldo, Porto Alegre - RS | CEP 90230-040
            <br/>
            Segunda a Quinta-feira: 07h30 às 12h00 | 13h05 às 17h30
            Sexta-feira: 07h30 às 12h00 | 13h05 às 16h55
          </Text>
        </div>
      </div>

      <FactoryLocation factoryPhotoBoxRef={factoryPhotoBoxRef} factoryPhotoRef={factoryPhotoRef} mapBoxRef={mapBoxRef} />

      <div className={bottomSpacer()} />
    </Container>
  );
}
