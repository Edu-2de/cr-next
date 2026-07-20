"use client";

import trifasicoImg from "@/app/assets/images/producot.jpg";
import monofasicoImg from "@/app/assets/images/producot2.jpg";
import altaEficienciaImg from "@/app/assets/images/producot3.jpg";
import novaImg from "@/app/assets/images/product4.jpg";
import marathonImg from "@/app/assets/images/product5.jpg";
import metrosulImg from "@/app/assets/images/product6.jpg";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { BrandsMarquee } from "../BrandsMarquee";
import { ProductCatalog } from "./ProductCatalog";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

// Own section (id="produtos"), sitting between "engenharia" and "servicos"
// — #eaeaea background (PixelDissolve.tsx right before it already carries
// the white → #eaeaea handoff from "engenharia", unchanged).
//
// Header (left-aligned title + description) stays as before, with a full-
// width hairline right under it — matching a supplied "BESTSELLERS" e-
// commerce reference: a bold heading, a rule underneath, then product
// columns divided by thin vertical lines (not boxed/rounded cards), each
// column a bold caps name up top and a large photo filling the rest. The
// whole strip is still the same infinite, slow, GSAP xPercent-tween
// carousel as before — the reference itself is a static grid, but "infinito
// e passando lentamente" was an explicit earlier requirement that stands.
// The carousel's visible window matches the header's own margin exactly
// (mx-auto max-w-6xl px-6/px-12) rather than a fixed narrower width —
// 320px cards (bigger, per explicit "está muito pequeno" feedback) don't
// divide evenly into that width, but that's fine: the fade at both ends is
// a real CSS mask-image (linear-gradient alpha mask on the whole
// overflow-hidden box, not a solid-color overlay div), so any partial card
// at the edge genuinely fades to transparent rather than looking cut —
// exact pixel alignment to a whole number of cards is no longer needed
// once the fade is real transparency instead of a color-matched overlay.
//
// A cantor8.io-inspired scroll-driven staggered-card effect was tried here
// (2026-07-18) and then explicitly reverted — "não, volte como estava
// antes, com o carrossel que pedi para você guardar." That attempt is kept
// as a commented-out block below, in case it's revisited later — see its
// own header comment for restore instructions and the round of tuning it
// went through.
const PAGE_BG_COLOR = "#eaeaea";

type Product = { id: string; title: string; description: string; src: typeof trifasicoImg };

const PRODUCTS: Product[] = [
  {
    id: "trifasico",
    title: "Motores trifásicos industriais",
    description: "Alta performance e torque constante para operações contínuas em ambientes exigentes.",
    src: trifasicoImg,
  },
  {
    id: "monofasico",
    title: "Motores monofásicos",
    description: "Solução compacta e eficiente para aplicações residenciais e comerciais de menor porte.",
    src: monofasicoImg,
  },
  {
    id: "alta-eficiencia",
    title: "Motores de alta eficiência",
    description: "Redução no consumo de energia sem abrir mão de desempenho e durabilidade.",
    src: altaEficienciaImg,
  },
  {
    id: "nova",
    title: "Motores de indução trifásicos",
    description: "Robustez e confiabilidade para cargas pesadas em linhas de produção.",
    src: novaImg,
  },
  {
    id: "marathon",
    title: "Motores blindados de alta resistência",
    description: "Proteção reforçada contra poeira, umidade e ambientes agressivos.",
    src: marathonImg,
  },
  {
    id: "metrosul",
    title: "Motores para uso geral",
    description: "Versatilidade para as mais diversas aplicações industriais do dia a dia.",
    src: metrosulImg,
  },
];

// Curated 3-item list for the catalog accordion below the carousel — a
// deliberately different, shorter list than the 6-item carousel above, with
// longer/richer descriptions per explicit request ("deixe so tres opcoes no
// menu... o menu deve ter descricoes com mais texto em seus itens").
const CATALOG_PRODUCTS = [
  {
    id: "trifasico",
    title: "Motores trifásicos industriais",
    description:
      "Desenvolvidos para operação contínua em ambientes industriais exigentes, nossos motores trifásicos entregam torque constante e alta performance mesmo sob cargas pesadas. Contam com carcaças reforçadas e componentes internos rigorosamente testados, garantindo confiabilidade em linhas de produção que não podem parar. Cada unidade passa por diagnóstico técnico completo antes da entrega, assegurando o desempenho esperado desde o primeiro dia de operação.",
  },
  {
    id: "alta-eficiencia",
    title: "Motores de alta eficiência",
    description:
      "Pensados para reduzir o consumo de energia sem abrir mão de potência, nossos motores de alta eficiência utilizam materiais e processos que minimizam perdas térmicas e mecânicas. Essa combinação resulta em economia real na conta de energia ao longo de toda a vida útil do equipamento, sem comprometer a durabilidade. Uma escolha certeira para indústrias que buscam reduzir custos operacionais mantendo a mesma capacidade produtiva.",
  },
  {
    id: "marathon",
    title: "Motores blindados de alta resistência",
    description:
      "Construídos para enfrentar poeira, umidade e ambientes agressivos, os motores blindados da nossa linha oferecem proteção reforçada contra os principais fatores que comprometem a vida útil de um motor elétrico. Vedações especiais e carcaças de alta resistência garantem operação segura mesmo nas condições mais adversas. Uma escolha certeira para plantas industriais expostas a intempéries ou processos corrosivos.",
  },
];

// Same near-wrap-gap reasoning as BrandsMarquee: enough repeats that at
// least a couple full copies of the track are always ahead of the visible
// window, on any viewport width, so the loop never runs dry mid-crawl.
const REPEAT_COUNT = 3;
const TRACK_ITEMS = Array.from({ length: REPEAT_COUNT }, () => PRODUCTS).flat();

// Slow, deliberate crawl — same spirit as BrandsMarquee's rows, tuned down
// further since these columns are much wider than a brand pill.
const ROW_DURATION_S = 90;

// Exported so Header.tsx can land the "Produtos" nav click on this section.
export const PRODUTOS_REVEAL_FRACTION = 0;

export function ProductsSection() {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

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
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // Infinite auto-crawl that's also mouse-draggable. Draggable moves the
  // track in real pixels, so the base tween animates `x` (not xPercent)
  // across exactly one repeat's width, wrapped with a modifier
  // (gsap.utils.wrap) so it loops seamlessly — same wrap function is
  // applied by hand inside Draggable's onDrag/onThrowUpdate, since
  // Draggable writes the transform itself and bypasses the tween's
  // modifier while a drag/throw is in progress.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const oneSetWidth = track.scrollWidth / REPEAT_COUNT;
    const wrap = gsap.utils.wrap(-oneSetWidth, 0);

    const tween = gsap.to(track, {
      x: `-=${oneSetWidth}`,
      duration: ROW_DURATION_S,
      ease: "none",
      repeat: -1,
      modifiers: { x: gsap.utils.unitize(wrap) },
    });
    tweenRef.current = tween;

    const [draggable] = Draggable.create(track, {
      type: "x",
      inertia: true,
      onDragStart: () => tween.pause(),
      onDrag: function () {
        gsap.set(track, { x: wrap(this.x) });
      },
      onThrowUpdate: function () {
        gsap.set(track, { x: wrap(this.x) });
      },
      onThrowComplete: () => tween.play(),
      onDragEnd: function () {
        if (!this.isThrowing) tween.play();
      },
    });

    return () => {
      tween.kill();
      draggable.kill();
    };
  }, []);

  return (
    <section id="produtos" data-theme="light" className="relative z-10" style={{ backgroundColor: PAGE_BG_COLOR }}>
      <div
        ref={headerRef}
        className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 pb-6 pt-24 sm:min-h-[90vh] sm:px-12 sm:pb-8 sm:pt-32"
      >
        <h2 className="font-display text-5xl font-bold tracking-tight text-ink-950 sm:text-7xl sm:text-nowrap">
          Com o que trabalhamos
        </h2>
        <p className="mt-10 text-lg leading-relaxed text-ink-950/60 sm:mt-12 sm:text-2xl">
          Somos uma empresa de Porto Alegre, Rio Grande do Sul, especializada no fornecimento de
          motores elétricos industriais de alta performance para os mais diversos segmentos —
          carcaças reforçadas, torque constante e eficiência energética pensados para operações
          contínuas, sem paradas inesperadas.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-ink-950/60 sm:mt-8 sm:text-2xl">
          Além da venda, oferecemos manutenção preventiva e corretiva, diagnóstico técnico
          especializado e instalação completa, acompanhando sua indústria do primeiro contato ao
          suporte pós-venda — para que a operação nunca precise parar.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-6 sm:px-12 sm:pt-10">
        <div
          className="relative overflow-hidden bg-white"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
          onMouseEnter={() => tweenRef.current?.pause()}
          onMouseLeave={() => tweenRef.current?.play()}
        >
          <div ref={trackRef} className="flex w-max">
            {TRACK_ITEMS.map((product, i) => (
              <div
                key={`${product.id}-${i}`}
                className="flex w-80 shrink-0 flex-col gap-6 border-l border-ink-950/15 px-8 py-8 sm:py-10"
              >
                <h3 className="text-sm font-bold uppercase tracking-wide text-ink-950 sm:text-base">
                  {product.title}
                </h3>
                <div className="relative h-80 w-full">
                  <Image
                    src={product.src}
                    alt={product.title}
                    fill
                    sizes="320px"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll-driven accordion catalog, no title above it (dropped per
          explicit request — see ProductCatalog.tsx's own header comment for
          the full back-and-forth: carousel → 2-column grid → this). */}
      <ProductCatalog products={CATALOG_PRODUCTS} />

      <BrandsMarquee />

      <div className="h-[15vh] w-full sm:h-[20vh]" />
    </section>
  );
}

// ============================================================================
// SAVED — the cantor8.io-inspired scroll-driven staggered-card effect, tried
// 2026-07-18 and explicitly reverted ("volte como estava antes"). Kept here,
// not deleted, in case it's revisited. Went through several rounds of tuning
// before being reverted:
//   - PIN_VH 240→150 ("a tela está descendo mais que o necessário")
//   - vertical motion: started as a per-card animated sine-wave bob, then
//     corrected to a STATIC per-card offset (CARD_OFFSETS) once it was
//     clarified the cards should be born at different heights, not move
//     up/down over time
//   - container alignment flip-flopped between items-center ("no meio da
//     tela") and items-start+padding ("mais perto do texto") a few times —
//     if reviving this, re-clarify which is actually wanted rather than
//     assuming either prior state
//   - card image: object-cover (cropped) → object-contain (whole photo
//     visible, no cropping) after explicit "não quero as imagens cortadas"
//   - card size grew across several rounds (width w-80→w-104→w-136, padding
//     up to p-20) chasing "cards maiores" — check with the user for a
//     concrete target size rather than incrementally guessing again
// To restore: swap this back in as the default export's implementation
// (needs its own PRODUCTS type with a `description` field, not in the
// current live PRODUCTS above), remove Draggable/InertiaPlugin if no longer
// needed elsewhere in this file.
// ============================================================================
//
// type ProductWithDescription = { id: string; title: string; description: string; src: typeof trifasicoImg };
//
// const PRODUCTS_WITH_DESCRIPTION: ProductWithDescription[] = [
//   {
//     id: "trifasico",
//     title: "Motores trifásicos industriais",
//     description: "Alta performance e torque constante para operações contínuas em ambientes exigentes.",
//     src: trifasicoImg,
//   },
//   {
//     id: "monofasico",
//     title: "Motores monofásicos",
//     description: "Solução compacta e eficiente para aplicações residenciais e comerciais de menor porte.",
//     src: monofasicoImg,
//   },
//   {
//     id: "alta-eficiencia",
//     title: "Motores de alta eficiência",
//     description: "Redução no consumo de energia sem abrir mão de desempenho e durabilidade.",
//     src: altaEficienciaImg,
//   },
//   {
//     id: "nova",
//     title: "Motores de indução trifásicos",
//     description: "Robustez e confiabilidade para cargas pesadas em linhas de produção.",
//     src: novaImg,
//   },
//   {
//     id: "marathon",
//     title: "Motores blindados de alta resistência",
//     description: "Proteção reforçada contra poeira, umidade e ambientes agressivos.",
//     src: marathonImg,
//   },
//   {
//     id: "metrosul",
//     title: "Motores para uso geral",
//     description: "Versatilidade para as mais diversas aplicações industriais do dia a dia.",
//     src: metrosulImg,
//   },
// ];
//
// const CANTOR8_PIN_VH = 150;
// const CANTOR8_CARD_OFFSETS = [0, 60, -30, 80, 15, 45];
//
// export function ProductsSectionCantor8() {
//   const headerRef = useRef<HTMLDivElement | null>(null);
//   const headerTextRef = useRef<HTMLHeadingElement | null>(null);
//   const pinWrapperRef = useRef<HTMLDivElement | null>(null);
//   const trackRef = useRef<HTMLDivElement | null>(null);
//
//   useEffect(() => {
//     function measure() {
//       if (headerTextRef.current && trackRef.current) {
//         const left = headerTextRef.current.getBoundingClientRect().left;
//         trackRef.current.style.paddingLeft = `${left}px`;
//       }
//     }
//     measure();
//     window.addEventListener("resize", measure);
//     return () => window.removeEventListener("resize", measure);
//   }, []);
//
//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       if (headerRef.current) {
//         gsap.fromTo(
//           headerRef.current,
//           { opacity: 0, y: 32 },
//           {
//             opacity: 1,
//             y: 0,
//             duration: 0.9,
//             ease: "power3.out",
//             scrollTrigger: {
//               trigger: headerRef.current,
//               start: "top 80%",
//               toggleActions: "play none none reverse",
//             },
//           }
//         );
//       }
//     });
//     return () => ctx.revert();
//   }, []);
//
//   useEffect(() => {
//     const wrapper = pinWrapperRef.current;
//     const track = trackRef.current;
//     if (!wrapper || !track) return;
//
//     function applyFrame(progress: number) {
//       const maxX = Math.max(track!.scrollWidth - window.innerWidth, 0);
//       track!.style.transform = `translateX(${-maxX * progress}px)`;
//     }
//
//     applyFrame(0);
//
//     const trigger = ScrollTrigger.create({
//       trigger: wrapper,
//       start: "top top",
//       end: "bottom bottom",
//       scrub: true,
//       onUpdate: (self) => applyFrame(self.progress),
//     });
//
//     return () => {
//       trigger.kill();
//     };
//   }, []);
//
//   return (
//     <section id="produtos" data-theme="light" className="relative z-10" style={{ backgroundColor: PAGE_BG_COLOR }}>
//       <div
//         ref={headerRef}
//         className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 pb-6 pt-24 sm:min-h-[90vh] sm:px-12 sm:pb-8 sm:pt-32"
//       >
//         <h2
//           ref={headerTextRef}
//           className="font-display text-5xl font-bold tracking-tight text-ink-950 sm:text-7xl sm:text-nowrap"
//         >
//           Com o que trabalhamos
//         </h2>
//         <p className="mt-10 text-lg leading-relaxed text-ink-950/60 sm:mt-12 sm:text-2xl">
//           Somos uma empresa de Porto Alegre, Rio Grande do Sul, especializada no fornecimento de
//           motores elétricos industriais de alta performance para os mais diversos segmentos —
//           carcaças reforçadas, torque constante e eficiência energética pensados para operações
//           contínuas, sem paradas inesperadas.
//         </p>
//         <p className="mt-6 text-lg leading-relaxed text-ink-950/60 sm:mt-8 sm:text-2xl">
//           Além da venda, oferecemos manutenção preventiva e corretiva, diagnóstico técnico
//           especializado e instalação completa, acompanhando sua indústria do primeiro contato ao
//           suporte pós-venda — para que a operação nunca precise parar.
//         </p>
//       </div>
//
//       <div ref={pinWrapperRef} className="relative" style={{ height: `${CANTOR8_PIN_VH}vh` }}>
//         <div className="sticky top-0 flex h-screen w-full items-start overflow-hidden pt-16 sm:pt-20">
//           <div ref={trackRef} className="flex gap-20 will-change-transform">
//             {PRODUCTS_WITH_DESCRIPTION.map((product, i) => (
//               <div
//                 key={product.id}
//                 style={{ transform: `translateY(${CANTOR8_CARD_OFFSETS[i % CANTOR8_CARD_OFFSETS.length]}px)` }}
//                 className="flex w-136 shrink-0 flex-col overflow-hidden rounded-2xl bg-white p-20 shadow-[0_24px_50px_-24px_rgba(15,23,42,0.3)]"
//               >
//                 <div className="relative h-64 w-full overflow-hidden rounded-xl bg-ink-950/3">
//                   <Image
//                     src={product.src}
//                     alt={product.title}
//                     fill
//                     sizes="544px"
//                     className="object-contain"
//                   />
//                 </div>
//                 <div className="flex flex-col gap-3 pt-8">
//                   <h3 className="text-xl font-bold text-ink-950">{product.title}</h3>
//                   <p className="text-base leading-relaxed text-ink-950/60">{product.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//
//       <div className="h-[15vh] w-full sm:h-[20vh]" />
//     </section>
//   );
// }
