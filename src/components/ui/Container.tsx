import type { ComponentPropsWithRef, ElementType } from "react";
import { tv, type VariantProps } from "tailwind-variants";

// Wraps a top-level page section's root instead of a bare <section>/<div>.
// Variants hold the position/z-index/width/surface classes every section
// already repeated (relative z-10, sticky top-0 z-0 w-full, the
// bg-ink-950/paper/mist surfaces) — swapping a section's outer tag for
// this is a pure structural change, zero visual diff. Dynamic per-section
// values (an inline PAGE_BG_COLOR, a computed pinned height) still go
// through `style`, same as any element.
export const containerVariants = tv({
  variants: {
    position: {
      relative: "relative",
      sticky: "sticky top-0",
    },
    z: {
      base: "z-0",
      raised: "z-10",
    },
    width: {
      auto: "",
      full: "w-full",
    },
    surface: {
      none: "",
      paper: "bg-paper",
      mist: "bg-mist",
      ink: "bg-ink-950",
    },
  },
  defaultVariants: {
    position: "relative",
    z: "raised",
    width: "auto",
    surface: "none",
  },
});

type ContainerVariants = VariantProps<typeof containerVariants>;

type ContainerProps<E extends ElementType> = {
  as?: E;
} & ContainerVariants &
  Omit<ComponentPropsWithRef<E>, "as" | keyof ContainerVariants>;

const DEFAULT_ELEMENT = "div";

export function Container<E extends ElementType = typeof DEFAULT_ELEMENT>({
  as,
  position,
  z,
  width,
  surface,
  className,
  ...rest
}: ContainerProps<E>) {
  const Component = (as ?? DEFAULT_ELEMENT) as ElementType;
  return (
    <Component className={containerVariants({ position, z, width, surface, className })} {...rest} />
  );
}
