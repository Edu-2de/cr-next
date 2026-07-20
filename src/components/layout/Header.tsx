"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import { HeaderNavLink } from "./HeaderNavLink";
import { NAV_LINKS, useHeaderController } from "./useHeaderController";

const headerStyles = tv({
  slots: {
    header: "fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6",
    wrap: "flex w-full max-w-4xl flex-col items-center",
    pill: "flex w-full items-center justify-between rounded-full border px-5 py-3 backdrop-blur-xl transition-colors duration-300 sm:px-7 sm:py-4",
    nav: "hidden items-center gap-1 sm:flex sm:gap-2",
    wordmark: "shrink-0 whitespace-nowrap transition-colors duration-300",
    menuButton: "relative flex size-8 shrink-0 flex-col items-center justify-center gap-[5px] sm:hidden",
    menuBar: "h-px w-5 rounded-full transition-colors duration-300",
    mobileNav: "mt-2 flex w-full flex-col overflow-hidden rounded-3xl border backdrop-blur-xl transition-colors duration-300 sm:hidden",
    mobileLink: "px-6 py-3.5 text-center transition-colors duration-300",
  },
});

export function Header() {
  const { activeIndex, onDark, hidden, handleNavClick } = useHeaderController();
  const { header, wrap, pill, nav, wordmark, menuButton, menuBar, mobileNav, mobileLink } = headerStyles();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <a href="#top" onClick={(event) => handleNavClick(event, NAV_LINKS[0])}>
            <Text
              as="span"
              variant="wordmark"
              size="xs"
              weight="semibold"
              tracking="wide"
              className={wordmark({ class: onDark ? "text-white" : "text-ink-950" })}
            >
              CR MESQUITA
            </Text>
          </a>

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
            <span
              className={menuBar({
                class: [
                  onDark ? "bg-white" : "bg-ink-950",
                  menuOpen ? "translate-y-[3px] rotate-45" : "",
                ],
              })}
            />
            <span
              className={menuBar({
                class: [onDark ? "bg-white" : "bg-ink-950", menuOpen ? "opacity-0" : ""],
              })}
            />
            <span
              className={menuBar({
                class: [
                  onDark ? "bg-white" : "bg-ink-950",
                  menuOpen ? "-translate-y-[3px] -rotate-45" : "",
                ],
              })}
            />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={mobileNav({
                class: onDark
                  ? "border-white/10 bg-ink-950/90 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)]"
                  : "border-ink-950/10 bg-white/90 shadow-[0_8px_32px_-16px_rgba(5,7,10,0.2)]",
              })}
            >
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.label}
                  href={`#${link.sectionId}`}
                  onClick={(event) => onMobileNavClick(event, link)}
                  className={mobileLink({
                    class:
                      i === activeIndex
                        ? onDark
                          ? "bg-white/8 text-white"
                          : "bg-ink-950/5 text-ink-950"
                        : onDark
                          ? "text-white/60"
                          : "text-ink-950/55",
                  })}
                >
                  <Text as="span" variant="navLink">
                    {link.label}
                  </Text>
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
