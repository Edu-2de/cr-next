"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Text } from "@/components/ui/Text";
import { useLenis } from "@/providers/LenisProvider";
import { PRODUCTS_REVEAL_FRACTION } from "@/components/sections/products/ProductsSection";
import { SERVICES_REVEAL_FRACTION } from "@/components/sections/services/ServicesSection";

// `revealFraction` (0-1, undefined = section's own top) is how far into a
// pinned section's scroll to land, so nav clicks don't land on a
// not-yet-revealed blank state.
type NavLink = { label: string; sectionId: string; revealFraction?: number };

const NAV_LINKS: NavLink[] = [
  { label: "Início", sectionId: "top" },
  { label: "Produtos", sectionId: "products", revealFraction: PRODUCTS_REVEAL_FRACTION },
  { label: "Serviços", sectionId: "services", revealFraction: SERVICES_REVEAL_FRACTION },
  { label: "Sobre", sectionId: "about" },
];

// Long enough that scrubbed per-section scroll effects stay smooth even on
// the longest pinned-scroll jumps.
const NAV_SCROLL_DURATION = 2.4;

export function Header() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [onDark, setOnDark] = useState(false);
  // Hidden only from the services list (id="services-list") through the
  // black zoom transition, until the About headline is visible — gating on
  // "headline top reached viewport" (not "intersecting") avoids it
  // flickering back on while the headline scrolls past.
  const [hideForServicesGap, setHideForServicesGap] = useState(false);

  const lenis = useLenis();

  useEffect(() => {
    function update() {
      const el = document.elementFromPoint(window.innerWidth / 2, 120);
      const themed = el?.closest("[data-theme]");
      // Looked up separately: nested cards carry their own data-theme inside
      // one top-level section id, so the nearest [data-theme] and nearest
      // [id] aren't always the same element.
      const id = el?.closest("[id]")?.id;
      const index = NAV_LINKS.findIndex((link) => link.sectionId === id);
      if (index !== -1) setActiveIndex(index);
      if (themed) setOnDark(themed.getAttribute("data-theme") === "dark");

      const servicesList = document.getElementById("services-list");
      const aboutHeadline = document.querySelector("#about h2");
      if (servicesList && aboutHeadline) {
        const listRect = servicesList.getBoundingClientRect();
        const headlineRect = aboutHeadline.getBoundingClientRect();
        const pastServicesStart = listRect.top < window.innerHeight;
        const aboutReached = headlineRect.top < window.innerHeight;
        setHideForServicesGap(pastServicesStart && !aboutReached);
      }
    }
    // Runs every frame (not just on 'scroll') so a transient overlay (e.g.
    // LoadingScreen) sitting at the sample point on mount can't stick.
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, []);

  function handleNavClick(event: React.MouseEvent<HTMLAnchorElement>, link: NavLink) {
    event.preventDefault();

    // Hero is `position: sticky; top: 0` for the whole page, so its own
    // getBoundingClientRect().top is always 0 — target position 0 directly
    // instead of the (permanently pinned) element.
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

    // Native scrollIntoView/scrollTo fight Lenis's own RAF-driven scroll
    // loop, so route through lenis.scrollTo when available.
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
      <div
        className={`flex w-full max-w-4xl items-center justify-between rounded-full border px-7 py-4 backdrop-blur-xl transition-colors duration-300 ${
          onDark
            ? "border-white/10 bg-white/[0.06] shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)]"
            : "border-ink-950/10 bg-white/55 shadow-[0_8px_32px_-16px_rgba(5,7,10,0.2)]"
        }`}
      >
        <a href="#top" onClick={(event) => handleNavClick(event, NAV_LINKS[0])}>
          <Text
            as="span"
            variant="wordmark"
            size="xs"
            weight="semibold"
            tracking="wide"
            className={`transition-colors duration-300 ${onDark ? "text-white" : "text-ink-950"}`}
          >
            CR MESQUITA
          </Text>
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
                        : "border-ink-950/10 bg-white/50 shadow-[0_8px_24px_-12px_rgba(5,7,10,0.25)]"
                    }`}
                  />
                )}
                <Text
                  as="span"
                  variant="navLink"
                  className={`relative transition-colors duration-300 ${
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
                </Text>
              </a>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
