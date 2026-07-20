"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";
import { CATALOG_PRODUCTS } from "@/lib/products-info";
import { BrandsMarquee } from "../BrandsMarquee";
import { ProductCatalog } from "./ProductCatalog";
import { ProductsCarousel } from "./ProductsCarousel";

gsap.registerPlugin(ScrollTrigger);

export const PRODUCTS_REVEAL_FRACTION = 0;

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

  return (
    <Container as="section" id="products" data-theme="light" surface="mist">
      <div
        ref={headerRef}
        className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 pb-6 pt-24 sm:min-h-[90vh] sm:px-12 sm:pb-8 sm:pt-32"
      >
        <Text as="h2" variant="sectionHeading" color="ink" className="text-5xl sm:text-7xl sm:text-nowrap">
          Com o que trabalhamos
        </Text>
        <Text as="p" variant="bodyLg" color="inkMuted" className="mt-10 sm:mt-12">
          Somos uma empresa de Porto Alegre, Rio Grande do Sul, especializada no fornecimento de
          motores elétricos industriais de alta performance para os mais diversos segmentos —
          carcaças reforçadas, torque constante e eficiência energética pensados para operações
          contínuas, sem paradas inesperadas.
        </Text>
        <Text as="p" variant="bodyLg" color="inkMuted" className="mt-6 sm:mt-8">
          Além da venda, oferecemos manutenção preventiva e corretiva, diagnóstico técnico
          especializado e instalação completa, acompanhando sua indústria do primeiro contato ao
          suporte pós-venda — para que a operação nunca precise parar.
        </Text>
      </div>

      <ProductsCarousel />

      <ProductCatalog products={CATALOG_PRODUCTS} />

      <BrandsMarquee />

      <div className="h-[15vh] w-full sm:h-[20vh]" />
    </Container>
  );
}
