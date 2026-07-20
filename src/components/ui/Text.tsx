import type { ComponentPropsWithRef, ElementType } from "react";
import { tv, type VariantProps } from "tailwind-variants";

// The site's one text primitive — every heading/paragraph/label renders
// through this instead of a raw h1-h6/p/span carrying its own one-off
// classes. Two ways to style it: reach for a `variant` preset (the common,
// already-established combinations below) or compose the atomic axes
// (`size`/`font`/`weight`/`color`/`tracking`/`leading`/`align`/`uppercase`/
// `italic`) directly. Both can mix — a preset plus an axis override — since
// tv() merges them with tailwind-merge, last-applied class in each utility
// group wins. One-off exact values (a specific hover opacity, a bespoke
// clamp() size) still go through `className`/`style`, same as any element.
export const textVariants = tv({
  variants: {
    variant: {
      plain: "",
      display: "font-display font-bold leading-[0.95] tracking-tight",
      heroWord: "font-display font-bold leading-[0.9] tracking-tight whitespace-nowrap",
      sectionHeading: "font-display font-bold tracking-tight",
      cardHeading: "font-display text-3xl font-bold sm:text-4xl",
      rowHeading: "font-display text-2xl font-bold tracking-tight sm:text-3xl",
      catalogHeading: "font-display text-3xl font-bold tracking-tight sm:text-5xl",
      productLabel: "text-sm font-bold uppercase tracking-wide sm:text-base",
      watermark: "font-display font-bold italic uppercase tracking-tight",
      wordmark: "font-display font-bold tracking-tight",
      lead: "leading-loose text-xl sm:text-2xl",
      bodyLg: "leading-relaxed text-lg sm:text-2xl",
      body: "leading-relaxed",
      kicker: "font-mono text-xs uppercase tracking-[0.2em]",
      eyebrow: "text-sm uppercase tracking-[0.15em]",
      navLink: "text-[0.6875rem] font-medium uppercase tracking-[0.12em]",
      badge: "text-[0.625rem] font-semibold uppercase tracking-wider",
      brandPill: "text-sm font-semibold uppercase tracking-[0.15em] sm:text-base",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
      "7xl": "text-7xl",
      "8xl": "text-8xl",
      "9xl": "text-9xl",
    },
    font: {
      sans: "font-sans",
      display: "font-display",
      mono: "font-mono",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    tracking: {
      tight: "tracking-tight",
      normal: "tracking-normal",
      wide: "tracking-wide",
      wider: "tracking-wider",
      widest: "tracking-widest",
      loosest: "tracking-[0.3em]",
    },
    leading: {
      none: "leading-none",
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    uppercase: {
      true: "uppercase",
    },
    italic: {
      true: "italic",
    },
    color: {
      inherit: "",
      current: "text-current",
      ink: "text-ink-950",
      inkMuted: "text-ink-950/60",
      inkFaint: "text-ink-950/45",
      inkGhost: "text-ink-950/10",
      white: "text-white",
      whiteMuted: "text-white/70",
      whiteFaint: "text-white/40",
      whiteGhost: "text-white/10",
      brand: "text-brand-500",
    },
  },
  defaultVariants: {
    variant: "plain",
    color: "inherit",
  },
});

type TextVariants = VariantProps<typeof textVariants>;

// ComponentPropsWithRef (not WithoutRef) — React 19 lets function components
// receive `ref` as a plain prop, so it just flows through `...rest` below.
type TextProps<E extends ElementType> = {
  as?: E;
} & TextVariants &
  Omit<ComponentPropsWithRef<E>, "as" | keyof TextVariants>;

const DEFAULT_ELEMENT = "p";

export function Text<E extends ElementType = typeof DEFAULT_ELEMENT>({
  as,
  variant,
  size,
  font,
  weight,
  tracking,
  leading,
  align,
  uppercase,
  italic,
  color,
  className,
  ...rest
}: TextProps<E>) {
  const Component = (as ?? DEFAULT_ELEMENT) as ElementType;
  return (
    <Component
      className={textVariants({
        variant,
        size,
        font,
        weight,
        tracking,
        leading,
        align,
        uppercase,
        italic,
        color,
        className,
      })}
      {...rest}
    />
  );
}
