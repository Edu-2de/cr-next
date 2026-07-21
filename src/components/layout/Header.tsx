"use client";

import { Text } from "@/components/ui/Text";
import { WHATSAPP_HREF, WHATSAPP_NUMBER } from "@/lib/business-info";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { tv } from "tailwind-variants";
import { HeaderNavLink } from "./HeaderNavLink";
import { NAV_LINKS, useHeaderController } from "./useHeaderController";

const headerStyles = tv({
  slots: {
    header: "fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6",
    wrap: "relative z-10 flex w-full max-w-4xl flex-col items-center",
    pill: "flex w-full items-center justify-center rounded-full border px-5 py-3 backdrop-blur-xl transition-colors duration-300 sm:px-7 sm:py-4",
    nav: "hidden items-center gap-1 sm:flex sm:gap-2",
    wordmark: "shrink-0 whitespace-nowrap transition-colors duration-300",
    menuButton: "relative z-10 flex size-8 shrink-0 items-center justify-center sm:hidden",
    // Full-screen editorial takeover — large numbered links instead of a
    // small dropdown pill, matching the display-type scale used elsewhere
    // on the page (Hero headline, section watermarks) rather than reading
    // as a generic mobile-nav-component-library dropdown.
    //
    // Plain CSS opacity transition on an always-mounted element (display:
    // none when fully closed) rather than framer-motion's AnimatePresence —
    // AnimatePresence here intermittently left this panel's DOM node stuck
    // fully opaque and un-dismissable (same failure LoadingScreen.tsx hit).
    mobilePanel:
      "fixed inset-0 z-0 flex flex-col justify-center overflow-hidden bg-ink-950 px-8 pt-36 pb-10 transition-opacity duration-300 ease-out sm:hidden",
    mobilePanelGrain: "bg-grain pointer-events-none absolute inset-0",
    mobileNav: "relative flex flex-col",
    mobileLinkRow:
      "flex items-baseline gap-4 border-b border-white/10 py-4 opacity-0 transition-[opacity,transform] duration-400 ease-out first:pt-0",
    mobileLinkIndex: "font-mono text-sm text-white/30 tabular-nums",
    mobileLinkLabel: "font-display text-4xl font-bold tracking-tight",
    mobileFooter:
      "relative mt-auto flex items-baseline justify-between pt-10 opacity-0 transition-opacity duration-400 ease-out",
  },
});

const LINK_STAGGER_MS = 50;
const LINK_BASE_DELAY_MS = 120;

export function Header() {
  const { activeIndex, onDark, hidden, handleNavClick } = useHeaderController();
  const {
    header,
    wrap,
    pill,
    nav,
    menuButton,
    mobilePanel,
    mobilePanelGrain,
    mobileNav,
    mobileLinkRow,
    mobileLinkIndex,
    mobileLinkLabel,
    mobileFooter,
  } = headerStyles();
  const [menuOpen, setMenuOpen] = useState(false);
  // Locks background scroll while the full-screen mobile panel is open.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function onMobileNavClick(event: React.MouseEvent<HTMLAnchorElement>, link: (typeof NAV_LINKS)[number]) {
    setMenuOpen(false);
    handleNavClick(event, link);
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? -32 : 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={header({ class: hidden ? "pointer-events-none" : "" })}
    >
      <div className={wrap()}>
        <div
          className={pill({
            class: onDark
              ? "border-white/10 bg-white/6 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)]"
              : "border-ink-950/10 bg-white/55 shadow-[0_8px_32px_-16px_rgba(5,7,10,0.2)]",
          })}
        >

          <nav className={nav()}>
            {NAV_LINKS.map((link, i) => (
              <HeaderNavLink
                key={link.label}
                link={link}
                active={i === activeIndex}
                onDark={onDark}
                onClick={(event) => handleNavClick(event, link)}
              />
            ))}
          </nav>

          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className={menuButton()}
          >
            {menuOpen ? (
              <FiX size={20} className={onDark ? "text-white" : "text-ink-950"} />
            ) : (
              <FiMenu size={20} className={onDark ? "text-white" : "text-ink-950"} />
            )}
          </button>
        </div>

      </div>

      <div
        className={mobilePanel({ class: menuOpen ? "opacity-100" : "pointer-events-none opacity-0" })}
        aria-hidden={!menuOpen}
      >
        <div className={mobilePanelGrain()} />

        <nav className={mobileNav()}>
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={`#${link.sectionId}`}
              onClick={(event) => onMobileNavClick(event, link)}
              tabIndex={menuOpen ? 0 : -1}
              className={mobileLinkRow({ class: menuOpen ? "translate-y-0 opacity-100" : "translate-y-5" })}
              style={{ transitionDelay: menuOpen ? `${LINK_BASE_DELAY_MS + i * LINK_STAGGER_MS}ms` : "0ms" }}
            >
              <Text as="span" className={mobileLinkIndex()}>
                0{i + 1}
              </Text>
              <Text as="span" className={mobileLinkLabel({ class: i === activeIndex ? "text-white" : "text-white/45" })}>
                {link.label}
              </Text>
            </a>
          ))}
        </nav>

        <div
          className={mobileFooter({ class: menuOpen ? "opacity-100" : "" })}
          style={{ transitionDelay: menuOpen ? `${LINK_BASE_DELAY_MS + NAV_LINKS.length * LINK_STAGGER_MS}ms` : "0ms" }}
        >
          <Text as="span" variant="wordmark" size="xs" weight="semibold" tracking="wide" color="whiteFaint">
            CR MESQUITA
          </Text>
          <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
            <Text as="span" variant="eyebrow" color="whiteMuted">
              {WHATSAPP_NUMBER}
            </Text>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
