"use client";

import { motion } from "framer-motion";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import type { NavLink } from "./useHeaderController";

// Static classes only — the onDark/active-driven colors stay as plain
// ternaries passed into each slot's own `class` option, since they're a
// genuine runtime truth table, not a fixed style choice.
const headerNavLinkStyles = tv({
  slots: {
    navLinkWrap: "relative flex items-center px-4 py-2",
    activeGlass: "absolute inset-0 rounded-full border backdrop-blur-md transition-colors duration-300",
    linkLabel: "relative transition-colors duration-300",
  },
});

export function HeaderNavLink({
  link,
  active,
  onDark,
  onClick,
}: {
  link: NavLink;
  active: boolean;
  onDark: boolean;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { navLinkWrap, activeGlass, linkLabel } = headerNavLinkStyles();

  return (
    <a href={`#${link.sectionId}`} onClick={onClick} className={navLinkWrap()}>
      {active && (
        <motion.span
          layoutId="nav-active-glass"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className={activeGlass({
            class: onDark
              ? "border-white/15 bg-white/8 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]"
              : "border-ink-950/10 bg-white/50 shadow-[0_8px_24px_-12px_rgba(5,7,10,0.25)]",
          })}
        />
      )}
      <Text
        as="span"
        variant="navLink"
        className={linkLabel({
          class: onDark
            ? active
              ? "text-white"
              : "text-white/55 hover:text-white/85"
            : active
              ? "text-ink-950"
              : "text-ink-950/45 hover:text-ink-950/75",
        })}
      >
        {link.label}
      </Text>
    </a>
  );
}
