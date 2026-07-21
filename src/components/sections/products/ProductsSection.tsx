"use client";

import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";
import { CATALOG_PRODUCTS } from "@/lib/products-info";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { tv } from "tailwind-variants";
import { BrandsMarquee } from "../BrandsMarquee";
import { ProductCatalog } from "./ProductCatalog";
import { ProductsCarousel } from "./ProductsCarousel";

gsap.registerPlugin(ScrollTrigger);

export const PRODUCTS_REVEAL_FRACTION = 0;

const productsSectionStyles = tv({
  slots: {
    headerBlock: "mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 pb-6 pt-24 sm:min-h-[90vh] sm:px-12 sm:pb-8 sm:pt-32",
    heading: "text-5xl sm:text-7xl lg:text-nowrap",
    introParagraph: "mt-10 sm:mt-12 text-justify",
    followUpParagraph: "mt-6 sm:mt-8 text-justify",
    spacer: "h-[15vh] w-full sm:h-[20vh]",
  },
});

export function ProductsSection() {
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const { headerBlock, heading, introParagraph, followUpParagraph, spacer } = productsSectionStyles();

  return (
    <Container as="section" id="products" data-theme="light" surface="mist">
      <div ref={headerRef} className={headerBlock()}>
        <Text as="h2" variant="sectionHeading" color="ink" className={heading()}>
          Nossas Soluções
        </Text>
        <Text as="p" variant="bodyLg" color="inkMuted" className={introParagraph()}>
          Com sede em Porto Alegre/RS, a CR Mesquita oferece soluções completas em equipamentos elétricos industriais, garantindo um estoque amplo, pronta entrega e as melhores condições para o fornecimento de motores e componentes das marcas mais renomadas do mercado, como WEG, Hércules, Marathon, Nova e Mercosul.
        </Text>
        <Text as="p" variant="bodyLg" color="inkMuted" className={followUpParagraph()}>
          Além do fornecimento, oferecemos suporte técnico especializado que abrange desde o diagnóstico preciso e instalação até a manutenção preventiva e corretiva. Acompanhamos sua empresa do orçamento ao pós-venda, assegurando máxima performance e alta disponibilidade operacional para que sua produção nunca pare.
        </Text>
      </div>

      <ProductsCarousel />

      <ProductCatalog products={CATALOG_PRODUCTS} />

      <BrandsMarquee />

      <div className={spacer()} />
    </Container>
  );
}
