"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useLenis } from "./LenisProvider";
import { PRODUTOS_REVEAL_FRACTION } from "./produtos/ProductsSection";
import { SERVICOS_REVEAL_FRACTION } from "./servicos3/ServicesSection";

// Each of these is a real, independent, top-level DOM section id — "Serviços"
// and "Marcas" used to be phases sharing "engenharia"'s own pinned scroll
// timeline (no id of their own), which meant the scroll-spy below could only
// ever highlight "Engenharia" no matter which of the three you'd scrolled
// into, and nav links couldn't target them individually at all. Now that
// ScrollShowcase (engenharia), ServicesSection (servicos), and BrandCarousel
// (marcas) are each their own pinned section with their own id/data-theme,
// this list is just a plain list of real anchors again.
//
// `revealFraction` (0-1, undefined = land at the section's very top) is how
// far into that section's own pinned scroll to land — landing at literal
// progress 0 puts the user in front of a blank/not-yet-revealed screen
// (circle at radius 0, cards still at opacity 0, etc.), which reads as
// "nothing happened" even though the scroll itself worked. Each section
// exports its own "content has visibly appeared" milestone for this reason.
type NavLink = { label: string; sectionId: string; revealFraction?: number };

const NAV_LINKS: NavLink[] = [
  { label: "Início", sectionId: "top" },
  // "Engenharia" link removed per explicit request — the section itself
  // (ScrollShowcase, id="engenharia") stays exactly as-is in app/page.tsx,
  // it's just no longer reachable from the header nav or scroll-spy list.
  { label: "Produtos", sectionId: "produtos", revealFraction: PRODUTOS_REVEAL_FRACTION },
  { label: "Serviços", sectionId: "servicos", revealFraction: SERVICOS_REVEAL_FRACTION },
  // No revealFraction — unlike the pinned/scroll-jacked sections above,
  // ContatoSection isn't scroll-jacked, so landing at its literal top never
  // shows a blank pre-reveal state the way progress-0 would on those.
  { label: "Sobre", sectionId: "sobre" },
];

// Nav-triggered jumps can cover many screens of pinned scroll in one go
// (e.g. top → marcas is ~10000px) — Lenis's default wheel-scroll duration
// (1.5s, tuned for small increments) covers that distance in large per-frame
// steps, which was visibly janky/prone to stalling on the GSAP-driven pinned
// sections. A longer duration here keeps each frame's scroll delta small
// regardless of distance, so the scrubbed clip-path/opacity/transform work
// each section does on scroll stays smooth throughout the jump.
const NAV_SCROLL_DURATION = 2.4;

export function Header() {
  // Persistent glass bar, per explicit follow-up request — supersedes an
  // earlier round's fully-transparent-bar direction ("sem fundo"). The bar
  // itself (see the inner `<div>` below) now always carries a theme-adaptive
  // translucent background + backdrop-blur, rather than only the active nav
  // item getting a glass badge against an otherwise invisible strip. Text
  // color still tracks whichever section is painted underneath (`onDark`),
  // same `elementFromPoint` + `closest("[data-theme]")` scroll-spy this
  // component has used since the very first round.
  const [activeIndex, setActiveIndex] = useState(0);
  const [onDark, setOnDark] = useState(false);
  // Hides the fixed header from the moment servicos3's editorial services
  // list (id="servicos-lista", NOT the MotorIntro sphere/motor/text part
  // above it) is reached, all the way through the black CrMesquitaZoomTransition
  // pin that follows it, until "sobre nós"'s own headline becomes visible —
  // explicit requests, in two rounds: first "durante a parte dos serviços,
  // onde eles aparecem em linha, retire o header durante aquela parte",
  // then a follow-up that the header was reappearing too early (as soon as
  // the services list itself scrolled out, mid-way through the still-blank
  // zoom transition) — "ele só deve voltar a aparecer quando o título sobre
  // nós estiver visível na tela". `pastServicesStart` alone would immediately
  // flip back to hidden=false the instant servicos-lista's bottom left the
  // viewport; gating it with `!sobreReached` keeps it hidden for the entire
  // gap in between, recomputed every frame (not a one-way latch), so it's
  // correct scrolling in either direction. This is the ONLY thing that still
  // hides the header at all — the separate "hide while scrolling up"
  // animation (and the hero-specific exemption it needed) was removed
  // outright per an explicit follow-up: "ao invés dessa animação de ao
  // subir ele desaparecer... ele sempre ter um fundo" — the header no
  // longer disappears on scroll-up anywhere, full stop.
  const [hideForServicesGap, setHideForServicesGap] = useState(false);

  const lenis = useLenis();

  useEffect(() => {
    function update() {
      const el = document.elementFromPoint(window.innerWidth / 2, 120);
      const themed = el?.closest("[data-theme]");
      // Looked up separately from `themed` — servicos3's stacked cards each
      // carry their own `data-theme` (dark/light per card) nested inside
      // the single top-level `<section id="servicos">`, so the nearest
      // `[data-theme]` and the nearest `[id]` are no longer always the same
      // element. Walking up for `[id]` independently finds the right
      // top-level section id regardless of how many themed layers are
      // nested inside it.
      const id = el?.closest("[id]")?.id;
      const index = NAV_LINKS.findIndex((link) => link.sectionId === id);
      if (index !== -1) setActiveIndex(index);
      if (themed) setOnDark(themed.getAttribute("data-theme") === "dark");

      const servicesList = document.getElementById("servicos-lista");
      const sobreHeadline = document.querySelector("#sobre h2");
      if (servicesList && sobreHeadline) {
        const listRect = servicesList.getBoundingClientRect();
        const headlineRect = sobreHeadline.getBoundingClientRect();
        const pastServicesStart = listRect.top < window.innerHeight;
        // Deliberately NOT "is the headline currently intersecting" —
        // that flipped back to hidden the moment the (one-viewport-tall)
        // headline scrolled fully past on the way further into "Quem
        // somos", a real bug caught in testing (header reappeared briefly
        // then vanished again while still scrolling forward). "top has
        // reached/passed the viewport" is a threshold that, once crossed
        // going down, stays crossed for all further forward scroll —
        // still correctly flips back off if the user scrolls back up past
        // the headline into the gap again.
        const sobreReached = headlineRect.top < window.innerHeight;
        setHideForServicesGap(pastServicesStart && !sobreReached);
      }
    }
    // Real bug this fixed: with only a 'scroll' listener, if some other
    // full-viewport overlay with no data-theme of its own (e.g.
    // LoadingScreen's fixed dark cover, which is only around for its first
    // ~1s) happened to be sitting at the sample point the one time `update`
    // ran synchronously on mount, `onDark` got stuck at that wrong reading
    // forever — nothing re-ran `update` again until the user's first
    // scroll. Driving this off gsap.ticker (same continuous-per-frame
    // pattern already used throughout this codebase's scroll-linked
    // sections) makes it self-correcting regardless of what's transiently
    // covering the sample point, not just resilient to this one overlay.
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, []);

  function handleNavClick(event: React.MouseEvent<HTMLAnchorElement>, link: NavLink) {
    event.preventDefault();

    // Hero's own <section id="top"> is `position: sticky; top: 0` and stays
    // pinned to the viewport top for the ENTIRE page (that's what lets the
    // next section slide up and visually cover it — see Hero.tsx) — so its
    // getBoundingClientRect().top is always 0, no matter the real scroll
    // position. Resolving "Início" as a target *element* therefore always
    // computes "scroll to wherever we already are", a silent no-op. Since
    // "Início" always means the very top of the document anyway, target the
    // absolute position 0 directly instead of the (permanently pinned) node.
    let target: number | HTMLElement;
    if (link.sectionId === "top") {
      target = 0;
    } else {
      const section = document.getElementById(link.sectionId);
      if (!section) return;
      target = link.revealFraction
        ? section.offsetTop + link.revealFraction * (section.offsetHeight - window.innerHeight)
        : section;
    }

    // lenis.scrollTo animates through Lenis's own virtual-scroll RAF loop —
    // native scrollIntoView/window.scrollTo fight that loop frame by frame
    // (Lenis keeps re-asserting its own interpolated position), which is
    // why nav clicks used to look like an instant jump/redirect.
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: NAV_SCROLL_DURATION });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  const hidden = hideForServicesGap;

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? -32 : 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6 ${
        hidden ? "pointer-events-none" : ""
      }`}
    >
      {/* Persistent glass pill bar — the whole header now always carries a
          theme-adaptive translucent background + blur (not just the active
          nav item, which keeps its own slightly stronger glass badge on top
          of this so it still reads as distinct). */}
      <div
        className={`flex w-full max-w-4xl items-center justify-between rounded-full border px-7 py-4 backdrop-blur-xl transition-colors duration-300 ${
          onDark
            ? "border-white/10 bg-white/[0.06] shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)]"
            : "border-ink-950/10 bg-white/55 shadow-[0_8px_32px_-16px_rgba(15,23,42,0.2)]"
        }`}
      >
        <a
          href="#top"
          onClick={(event) => handleNavClick(event, NAV_LINKS[0])}
          className={`font-display text-xs font-semibold tracking-wide transition-colors duration-300 ${
            onDark ? "text-white" : "text-ink-950"
          }`}
        >
          CR MESQUITA
        </a>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link, i) => {
            const active = i === activeIndex;
            return (
              <a
                key={link.label}
                href={`#${link.sectionId}`}
                onClick={(event) => handleNavClick(event, link)}
                className="relative flex items-center px-4 py-2"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-glass"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className={`absolute inset-0 rounded-full border backdrop-blur-md transition-colors duration-300 ${
                      onDark
                        ? "border-white/15 bg-white/[0.08] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]"
                        : "border-ink-950/10 bg-white/50 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)]"
                    }`}
                  />
                )}
                <span
                  className={`relative text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
                    onDark
                      ? active
                        ? "text-white"
                        : "text-white/55 hover:text-white/85"
                      : active
                        ? "text-ink-950"
                        : "text-ink-950/45 hover:text-ink-950/75"
                  }`}
                >
                  {link.label}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
