"use client";

import { motion } from "framer-motion";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import { HeaderNavLink } from "./HeaderNavLink";
import { NAV_LINKS, useHeaderController } from "./useHeaderController";

const headerStyles = tv({
  slots: {
    header: "fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6",
    pill: "flex w-full max-w-4xl items-center justify-between rounded-full border px-7 py-4 backdrop-blur-xl transition-colors duration-300",
    nav: "flex items-center gap-1 sm:gap-2",
    wordmark: "transition-colors duration-300",
  },
});

export function Header() {
  const { activeIndex, onDark, hidden, handleNavClick } = useHeaderController();
  const { header, pill, nav, wordmark } = headerStyles();

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? -32 : 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={header({ class: hidden ? "pointer-events-none" : "" })}
    >
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
      </div>
    </motion.header>
  );
}
