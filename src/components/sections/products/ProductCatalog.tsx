"use client";

import { tv } from "tailwind-variants";
import { useIsDesktop } from "@/hooks/ui/useIsDesktop";
import { useScrollAccordion } from "@/hooks/ui/useScrollAccordion";
import type { CatalogProduct } from "@/lib/products-info";
import { CatalogItem } from "./CatalogItem";

// Wrapper height must add a full 100vh "tax" on top of the per-item scroll
// budget — with start/end "top top"/"bottom bottom", the usable scrub range
// is wrapperHeight - 100vh, not the wrapper's own height.
const SCROLL_PER_ITEM_VH = 40;

const productCatalogStyles = tv({
  slots: {
    wrapper: "relative",
    sticky: "sticky top-0 flex h-screen w-full items-center",
    inner: "mx-auto w-full max-w-6xl px-6 sm:px-12",
    flowInner: "mx-auto w-full max-w-6xl px-6 py-16 sm:px-12",
    divider: "border-t border-ink-950/15",
  },
});

// Desktop (lg+): the section pins and scroll drives which item is open — a
// scroll-jacked reveal that reads as intentional at that scale. Below lg
// that same scroll-jack is unusable (a whole section hijacked just to open
// one item), so it's a plain tap accordion in normal document flow instead.
export function ProductCatalog({ products }: { products: CatalogProduct[] }) {
  const isDesktop = useIsDesktop();
  const { wrapperRef, activeIndex, rowHeightRefs, rowInnerRefs, titleWrapRefs, titleRefs, openItem } =
    useScrollAccordion(products.length, isDesktop);

  const { wrapper, sticky, inner, flowInner, divider } = productCatalogStyles();

  const items = products.map((product, i) => (
    <CatalogItem
      key={product.id}
      product={product}
      index={i}
      isActive={i === activeIndex}
      onSelect={isDesktop ? undefined : () => openItem(i)}
      titleWrapRef={(el) => {
        titleWrapRefs.current[i] = el;
      }}
      titleRef={(el) => {
        titleRefs.current[i] = el;
      }}
      rowHeightRef={(el) => {
        rowHeightRefs.current[i] = el;
      }}
      rowInnerRef={(el) => {
        rowInnerRefs.current[i] = el;
      }}
    />
  ));

  if (!isDesktop) {
    return (
      <div className={flowInner()}>
        {items}
        <div className={divider()} />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={wrapper()} style={{ height: `${100 + products.length * SCROLL_PER_ITEM_VH}vh` }}>
      <div className={sticky()}>
        <div className={inner()}>
          {items}
          <div className={divider()} />
        </div>
      </div>
    </div>
  );
}
