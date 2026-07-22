import { useEffect, useState } from "react";
import gsap from "gsap";
import { useLenis } from "@/providers/LenisProvider";
import { PRODUCTS_REVEAL_FRACTION } from "@/components/sections/products/ProductsSection";
import { SERVICES_REVEAL_FRACTION } from "@/components/sections/services/ServicesSection";

// `revealFraction` (0-1, undefined = section's own top) is how far into a
// pinned section's scroll to land, so nav clicks don't land on a
// not-yet-revealed blank state.
export type NavLink = { label: string; sectionId: string; revealFraction?: number };

export const NAV_LINKS: NavLink[] = [
  { label: "Início", sectionId: "top" },
  { label: "Produtos", sectionId: "products", revealFraction: PRODUCTS_REVEAL_FRACTION },
  { label: "Serviços", sectionId: "services", revealFraction: SERVICES_REVEAL_FRACTION },
  { label: "Sobre", sectionId: "about" },
];

// Long enough that scrubbed per-section scroll effects stay smooth even on
// the longest pinned-scroll jumps.
const NAV_SCROLL_DURATION = 2.4;

export function useHeaderController() {
  const [activeIndex, setActiveIndex] = useState(0);
  // The page always mounts scrolled to top, over Hero (dark) — defaulting to
  // true instead of false avoids a one-frame flash of the light pill style
  // before the ticker below runs its first sample.
  const [onDark, setOnDark] = useState(true);
  // Hidden only from the services list (id="services-list") through the
  // black zoom transition, until the About headline is visible — gating on
  // "headline top reached viewport" (not "intersecting") avoids it
  // flickering back on while the headline scrolls past.
  const [hideForServicesGap, setHideForServicesGap] = useState(false);

  const lenis = useLenis();

  useEffect(() => {
    // Throttled to ~12Hz (every 5th tick): `elementFromPoint` and the two
    // `getBoundingClientRect` calls below each force a synchronous layout
    // recalc. Header is always mounted, so at 60fps this ran globally on
    // every single frame — competing with any other section's own
    // layout-writing animation (e.g. the products accordion's `height`
    // tween) for a forced-layout slot, which Chrome charges far more for
    // than Firefox. The nav highlight/theme doesn't need per-frame
    // precision, so sampling it this much less often removes that
    // contention with no visible cost.
    let tick = 0;
    function update() {
      tick++;
      if (tick % 5 !== 0) return;
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
      const about = document.getElementById("about");
      if (servicesList && about) {
        const listRect = servicesList.getBoundingClientRect();
        const aboutRect = about.getBoundingClientRect();
        const pastServicesStart = listRect.top < window.innerHeight;
        // Reappears as soon as the About section itself starts entering —
        // waiting for its (vertically centered, in a ~75-80vh band)
        // headline specifically meant staying hidden well past where About's
        // own dark background already covers the viewport.
        const aboutReached = aboutRect.top < window.innerHeight;
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

  return { activeIndex, onDark, hidden: hideForServicesGap, handleNavClick };
}
