"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

import crImg from "@/app/assets/images/CR.jpg";
import logoImg from "@/app/assets/images/Logo.png";
import { MAPS_PLACE_URL } from "@/lib/business-info";

gsap.registerPlugin(ScrollTrigger);

// Nineteenth pass (2026-07-19) — the eighteenth pass's fix (ScrollTrigger
// moved from the section to the headline, `start: "top 85%"`) was verified
// programmatically to fire at the right SCROLL POSITION, but that pass used
// `toggleActions: "play"` — a one-shot, real-TIME tween (1.2s of wall-clock
// time once triggered), not tied to scroll position after it starts. Any
// mismatch between how fast the animation plays and how fast the user is
// actually scrolling at that moment (a single strong wheel/trackpad flick,
// a stale ScrollTrigger start position after upstream pinned sections
// resize things, etc.) can let it finish resolving before the user's eyes
// actually reach the headline — reported as "já está lá, não vi acontecer".
// Fixed by making the reveal fully SCRUBBED instead: `scrub: 0.3` ties
// opacity/blur/scale directly to the headline's own scroll position between
// `start: "top bottom"` (headline's top edge just crossing into the
// viewport from below — animation at 0) and `end: "center center"`
// (headline centered in the viewport, its natural resting reading position
// — animation at 1). This makes the reveal a deterministic function of
// scroll position, not wall-clock time — it is now structurally impossible
// for it to complete before the headline is on screen, regardless of scroll
// speed, device, or timing quirks upstream.
//
// Twentieth pass (2026-07-19) — added a "Quem somos" title+paragraph block
// below the full-viewport headline, left-aligned (`max-w-xl`, no
// centering), normal body-copy size (not another oversized display
// treatment) — a plain scroll-fade (`opacity`+`y`, `start: "top 85%"`,
// `toggleActions: "play none none reverse"`), the same everyday reveal
// idiom every other section on this site already uses (see
// ServicesSection's `ServiceRow`), since this block isn't adjacent to a
// pinned/sticky predecessor the way the headline is — no scrub needed here.
// Required restructuring the section: the headline's `h-screen` +
// `overflow-hidden` (needed so the nowrap giant wordmark never causes
// horizontal scroll) moved from the outer `<section>` onto its own inner
// wrapper div, since the outer section now needs to size to BOTH the
// full-viewport hero AND this new block stacked below it, not be capped at
// one viewport height.
//
// Twenty-first pass (2026-07-19) — dropped the `prefers-reduced-motion`
// gating (the `gsap.matchMedia` branch that snapped both reveals straight
// to their end state) after the user kept reporting "no animation at all"
// even post-scrub-fix. This machine has a *confirmed* prior incident (see
// this project's `feedback_design_avoid_ai_generic` memory, from the
// Aurora.tsx background work) of Windows' "Show animations" being off
// system-wide, which Chromium maps straight to `prefers-reduced-motion:
// reduce` — independently re-confirmed here by emulating that media query
// and observing the exact same "already resolved, nothing visibly moves"
// symptom being reported. Rather than keep asking the user to go check an
// OS setting, these two reveals (a one-time opacity/blur/slide-in on
// content that only plays once, not a continuous/ambient effect) are now
// judged mild enough to just always run — same nuance this codebase's own
// Aurora.tsx already applies (it keeps direct-manipulation motion alive
// under reduced-motion and only freezes *autonomous* drift). If a future
// pass adds something more intense here (parallax, looping motion), gate
// THAT behind `prefers-reduced-motion` again — this exemption is
// specifically for small one-shot content reveals, not a blanket policy
// change for the file.
//
// Twenty-second pass (2026-07-19, SUPERSEDED — the highlighter part below
// was removed again in the twenty-third pass): grew the "Quem somos" copy
// to two paragraphs at a larger body size and briefly added a scroll-driven
// blue "highlighter" sweep on a few phrases. Kept here only as a note that
// it was tried and explicitly un-requested ("esqueça essa ideia do
// marcador azul") — do not re-add without being asked again.
//
// Twenty-third pass (2026-07-19) — three follow-ups: (1) dropped the
// highlighter entirely per explicit request, back to plain paragraph text,
// no `Highlight` component/mark refs/highlight timeline. (2) Slowed the
// headline's "aparição" scrub reveal — `scrub` raised `0.3 → 0.6` (heavier
// catch-up lag) and `end` moved from `"center center"` to `"center 35%"`
// (the headline's center now has to scroll further up the viewport before
// the reveal finishes, stretching it over more scroll distance) — both
// changes make the SAME scroll gesture reveal the headline more gradually,
// without reintroducing the earlier time-based-tween bug this section spent
// three passes fixing (still 100% scrub-driven, no wall-clock duration).
// (3) Shrank the hero's own wrapper from a full `h-screen` to `h-[75vh]`
// (`sm:h-[80vh]`) so there's less empty space between the (still centered)
// headline and the "Quem somos" block beneath it — brings them closer
// without un-centering the headline, which was itself an explicit earlier
// request ("mais centralizado") this pass doesn't reverse.
//
// Twenty-fourth pass (2026-07-19, ABANDONED mid-build, never shipped — the
// user redirected before it was verified) was a right-aligned "Como
// trabalhamos" block plus a thick blue SVG "reading path" ribbon modeled on
// a reference screenshot. Replaced outright by the twenty-fifth pass below
// before ever landing; no trace of the ribbon/SVG-path idea remains.
//
// Twenty-fifth pass (2026-07-19, SUPERSEDED by the twenty-sixth pass below)
// added a factory photo+text block below "Quem somos" with a boxed
// `lg:col-span-5` photo and a synced grayscale→color transition tied to the
// text's own reveal. Replaced outright — see the current pass for what's
// actually live now; kept only as history of the grayscale/class-vs-
// inline-style lessons, both of which still apply below.
//
// Twenty-sixth pass (2026-07-19) — reworked that block into three beats,
// explicit request: (1) a "50+" / "Fábrica própria" pairing where the photo
// used to be — `statRef` ("50+") on the left, same `lg:col-span-5` slot,
// styled at very low contrast (`text-white/10`, "cor dos números próxima a
// cor do fundo") and revealed with a classic scramble/decrypt effect
// (`runScramble()`, cycling random glyphs left-to-right before locking each
// one in — the exact technique a much earlier, since-fully-removed pass of
// this file used for a "50+ ANOS" moment; rebuilt from scratch here, not
// reused code, since nothing of that pass survived); (2) the SAME "Fábrica
// própria" title+paragraph, unchanged, now paired with "50+" instead of the
// photo; (3) the photo itself moved OUT of the `max-w-6xl` container
// entirely, as a direct child of the `<section>`, specifically so it can be
// genuinely full-viewport-width ("largura total da tela") rather than
// boxed — a max-w container with padding can only ever bleed to its own
// edge, not the true viewport edge, so removing it from that container is
// the correct fix, not a CSS breakout hack.
//
// The photo's grayscale→color beat is now explicitly TWO separate scroll
// thresholds on ONE trigger element (`factoryPhotoBoxRef`), not tied to any
// text reveal — literally "aparece a imagem... em preto e branco, no
// próximo scroll a imagem fica colorida": `start:"top 85%"` fades/slides
// the (still-grayscale) photo in, `start:"top 40%"` (reached only with
// further scrolling past that point) separately desaturates it to color.
// Both plain `toggleActions` tweens, matching every other non-headline
// reveal in this file — grayscale is still set via the tween's own "from"
// value, never a Tailwind class, for the same class-vs-inline-style reason
// noted in the superseded pass above.
const HEADLINE = "sobre nós";

const SCRAMBLE_CHARS = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ+#";

// Locks each character in left-to-right over its own short window inside
// the overall duration, so the reveal reads as a cascading "decryption"
// rather than every glyph settling at once.
function runScramble(el: HTMLElement, finalText: string, durationMs = 1100) {
  const start = performance.now();
  let rafId = 0;

  function frame(now: number) {
    const overallT = Math.min(1, (now - start) / durationMs);
    let out = "";
    for (let i = 0; i < finalText.length; i++) {
      const ch = finalText[i];
      const lockT = Math.min(1, Math.max(0, (overallT - i * 0.12) / 0.55));
      out += lockT >= 1 ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
    if (overallT < 1) {
      rafId = requestAnimationFrame(frame);
    }
  }
  rafId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(rafId);
}

const STAT_TEXT = "50+";

// Twenty-seventh pass (2026-07-19) — three follow-ups on the twenty-sixth
// pass's layout: (1) more scroll distance before the "50+" row appears —
// its wrapper's top margin grew `mt-24/32 → mt-40/56` (bumped from the
// stat row itself since that's literally what gates when its own
// ScrollTrigger's "top 85%" can fire — more distance to travel = more
// scroll needed, no trigger-value change required). (2) The text paired
// with "50+" changed from "Fábrica própria" to new copy about being an
// established 50-year company (`consolidatedRef`/"Uma empresa
// consolidada") — a numeral + a stat-flavored sentence read as a matched
// pair, whereas factory-specific copy didn't. (3) "Fábrica própria" wasn't
// deleted — it moved to a NEW standalone, left-aligned block (`factoryRef`,
// same `max-w-2xl` treatment as "Quem somos") between the stat row and the
// full-width photo, so the photo that follows is now introduced by text
// that's actually about it.
const CONSOLIDATED_TITLE = "Uma empresa consolidada";
const FACTORY_TITLE = "Fábrica própria";

// Twenty-eighth pass (2026-07-19) — added a Google Maps embed right beside
// the factory photo, explicit request: "junto dela coloque um mapa do
// google maps mostrando o endereço". The full-bleed row (previously just
// the photo, `w-full` outside the `max-w-6xl` container so it could reach
// the true viewport edge — see the twenty-sixth pass) became a two-column
// grid instead: photo left, map right, stacked on mobile, both sharing a
// fixed row height (`h-[380px] sm:h-[480px]`) rather than each carrying its
// own `aspect-*` — an aspect ratio tuned for a FULL-width single image
// would make either half far too tall once split into two columns, a
// plain shared height avoids that without new math. The map is Google's
// no-API-key `output=embed` iframe URL, centered on the exact coordinates
// from the place link the user supplied (`@...,-30.0060128,-51.2041833`,
// the `!3d!4d` pin coordinates — more precise than the `@lat,lng` viewport
// center earlier in that same URL). A small link below/over it opens the
// user's own original full Google Maps place URL (reviews, business
// listing, directions) for anyone who wants more than the embed offers —
// `MAPS_PLACE_URL` now lives in `lib/business-info.ts` (shared with the
// Footer's own map link), only the embed-specific `MAPS_EMBED_SRC` stays
// local to this file since nothing else needs it.
const MAPS_EMBED_SRC = "https://maps.google.com/maps?q=-30.0060128,-51.2041833&z=17&output=embed";

// Twenty-ninth pass (2026-07-19) — added the real `Logo.png` between "Uma
// empresa consolidada" and "Fábrica própria", explicit request: same width
// as the surrounding text column, brief description underneath. `Logo.png`
// is genuinely opaque white (`RGBA` but alpha=255 everywhere, confirmed via
// a direct pixel read — NOT a transparent-background mark), so it's placed
// inside a plain white `rounded-2xl` card rather than directly on the
// section's black background, where it would otherwise render as a
// jarring, unintentional-looking white rectangle. This is the file's first
// use of a card/plate treatment for an image specifically because the
// asset itself structurally requires a light backing to read at all — not
// a reintroduction of the generic-badge patterns this project's design
// memory warns against elsewhere. The logo also incidentally confirms an
// exact founding year (a laurel "50 ANOS · 1975" seal baked into the
// artwork) that every prior pass's copy in this file only ever stated
// vaguely as "mais de 50 anos" — used directly in the new caption below it.
// No title added above it — only a logo + brief description was requested,
// unlike every other block in this file which pairs a heading with copy.
//
// Thirtieth pass (2026-07-19) — bumped every title/paragraph in this
// section up a size (titles `text-2xl/3xl → text-3xl/4xl`, body copy
// `text-lg/xl → text-xl/2xl` with `leading-relaxed → leading-loose`) and
// widened the title→paragraph and inter-paragraph gaps (`mt-4/5 → mt-6/7`,
// "Quem somos"'s own paragraph-to-paragraph `gap-5/6 → gap-7/8`) — explicit
// "deixe os textos... maiores e mais espaçados". Column widths (`max-w-2xl`
// on every text block, including the logo card) deliberately left
// untouched — only asked to resize the type itself, not widen the reading
// column, and the logo card needs to keep matching whatever that column
// width is regardless ("a largura total dos textos... não da tela inteira,
// mas da seção, dos textos" — already true since `logoRef` shares the same
// `max-w-2xl` wrapper as every other text block, re-confirmed still correct
// after this resize since none of it touched column width).
//
// Thirty-first pass (2026-07-19, immediately revised — see the pass right
// below) centered `logoRef` (`mx-auto` on the wrapper, `text-center` on
// the caption) — explicit request to move the logo+caption to the middle
// of the section instead of sitting flush left like every other text block
// here.
//
// Thirty-second pass (2026-07-19) — the caption's own alignment changed
// from `text-center` to `text-justify` ("deixe a descrição do logo
// justificada"), its gap from the logo grew `mt-6/7 → mt-10/14` ("um pouco
// mais para baixo"), and the copy grew a second sentence ("um pouco mais de
// texto nela") so justify has enough wrapped lines to actually read as
// justified rather than just one centered-looking line. The wrapper
// (`logoRef`) KEEPS `mx-auto` — the logo card and the text column as a
// whole still sit centered in the section, per the still-standing 31st-pass
// request; only the paragraph's own internal text-align changed from
// center to justify, which is why `text-center` moved off the shared
// wrapper and onto nothing (removed) — justify and center can't both apply
// to the same element, and centering was never wanted on the image itself
// (a block-level `<Image>` doesn't respond to text-align regardless).

export function ContatoSection() {
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
  const statTriggeredRef = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const headlineTween = gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 30, scale: 0.92, filter: "blur(18px)" },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: headlineRef.current,
            start: "top bottom",
            end: "center 35%",
            scrub: 0.6,
          },
        },
      );

      const introTween = gsap.fromTo(
        introRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: introRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const statTween = gsap.fromTo(
        statWrapRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: statWrapRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
            onEnter: () => {
              if (!statTriggeredRef.current && statRef.current) {
                statTriggeredRef.current = true;
                runScramble(statRef.current, STAT_TEXT);
              }
            },
          },
        },
      );

      const consolidatedTween = gsap.fromTo(
        consolidatedRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: consolidatedRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const logoTween = gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: logoRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const factoryTween = gsap.fromTo(
        factoryRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: factoryRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const factoryPhotoAppearTween = gsap.fromTo(
        factoryPhotoBoxRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: factoryPhotoBoxRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const factoryPhotoColorTween = gsap.fromTo(
        factoryPhotoRef.current,
        { filter: "grayscale(1)" },
        {
          filter: "grayscale(0)",
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: factoryPhotoBoxRef.current,
            start: "top 40%",
            toggleActions: "play none none reverse",
          },
        },
      );

      const mapTween = gsap.fromTo(
        mapBoxRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mapBoxRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      return () => {
        headlineTween.scrollTrigger?.kill();
        introTween.scrollTrigger?.kill();
        statTween.scrollTrigger?.kill();
        consolidatedTween.scrollTrigger?.kill();
        logoTween.scrollTrigger?.kill();
        factoryTween.scrollTrigger?.kill();
        factoryPhotoAppearTween.scrollTrigger?.kill();
        factoryPhotoColorTween.scrollTrigger?.kill();
        mapTween.scrollTrigger?.kill();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="sobre" data-theme="dark" ref={sectionRef} className="relative z-10 w-full bg-black">
      <div className="flex h-[75vh] w-full flex-col overflow-hidden sm:h-[80vh]">
        <div className="flex flex-1 items-center justify-center px-4">
          <h2
            ref={headlineRef}
            className="text-center leading-[0.9] font-display font-bold tracking-tight whitespace-nowrap text-white select-none opacity-0"
            style={{ fontSize: "clamp(4.5rem, 21vw, 17rem)" }}
          >
            {HEADLINE}
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-12">
        <div ref={introRef} className="max-w-2xl opacity-0">
          <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">Quem somos</h3>
          <div className="mt-7 flex flex-col gap-7 sm:mt-8 sm:gap-8">
            <p className="text-xl leading-loose text-white/70 sm:text-2xl">
              Somos a CR Mesquita, uma empresa de Porto Alegre, RS, dedicada à reforma e
              manutenção de motores e bombas elétricas industriais. Há mais de 50 anos
              acompanhamos a indústria gaúcha, unindo experiência prática e rigor técnico em cada
              equipamento que passa pelas nossas mãos.
            </p>
            <p className="text-xl leading-loose text-white/70 sm:text-2xl">
              Do diagnóstico técnico completo ao comissionamento final, cuidamos de cada etapa com
              a mesma atenção — testes, reforma, alinhamento e acompanhamento de partida. O
              objetivo é sempre o mesmo: garantir que a operação do cliente nunca precise parar.
            </p>
          </div>
        </div>

        <div className="mt-40 grid grid-cols-1 items-center gap-10 sm:mt-56 sm:gap-12 lg:grid-cols-12">
          <div ref={statWrapRef} className="opacity-0 lg:col-span-5">
            <span
              ref={statRef}
              className="block font-mono leading-none font-bold text-white/10 select-none"
              style={{ fontSize: "clamp(6rem, 12vw, 11rem)" }}
            >
              {"".padStart(STAT_TEXT.length, " ")}
            </span>
          </div>

          <div ref={consolidatedRef} className="opacity-0 lg:col-span-7">
            <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">{CONSOLIDATED_TITLE}</h3>
            <p className="mt-6 text-xl leading-loose text-white/70 sm:mt-7 sm:text-2xl">
              Somos uma empresa consolidada há mais de 50 anos no mercado, com uma reputação
              construída junto à indústria gaúcha através da qualidade técnica e da confiança de
              quem já trabalhou com a gente.
            </p>
          </div>
        </div>

        <div ref={logoRef} className="mx-auto mt-40 max-w-2xl opacity-0 sm:mt-56">
          <div className="rounded-2xl bg-white p-6 sm:p-8">
            <Image src={logoImg} alt="CR Mesquita Motores Elétricos" className="h-auto w-full" sizes="(min-width: 1024px) 42rem, 100vw" />
          </div>
          <p className="mt-10 text-justify text-xl leading-loose text-white/70 sm:mt-14 sm:text-2xl">
            Fundada em 1975, a CR Mesquita carrega até hoje o selo de mais de 50 anos de história na
            indústria gaúcha.
          </p>
        </div>

        <div ref={factoryRef} className="mt-40 max-w-2xl opacity-0 sm:mt-56">
          <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">{FACTORY_TITLE}</h3>
          <p className="mt-6 text-xl leading-loose text-white/70 sm:mt-7 sm:text-2xl">
            Temos uma fábrica própria em Porto Alegre, equipada com maquinário e equipe
            especializada para reformar, testar e comissionar motores e bombas elétricas de
            qualquer porte — sem depender de terceiros em nenhuma etapa do processo.
          </p>
        </div>
      </div>

      <div className="mt-24 grid w-full grid-cols-1 sm:mt-32 sm:grid-cols-2">
        <div ref={factoryPhotoBoxRef} className="relative h-[380px] opacity-0 sm:h-[480px]">
          <div ref={factoryPhotoRef} className="absolute inset-0">
            <Image
              src={crImg}
              alt="Fachada da fábrica da CR Mesquita, em Porto Alegre"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div ref={mapBoxRef} className="relative h-[380px] opacity-0 sm:h-[480px]">
          <iframe
            src={MAPS_EMBED_SRC}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização da CR Mesquita no Google Maps"
          />
          <a
            href={MAPS_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/85"
          >
            Ver no Google Maps
          </a>
        </div>
      </div>

      <div className="h-28 sm:h-36" />
    </section>
  );
}
