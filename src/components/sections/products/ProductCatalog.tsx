"use client";

import { tv } from "tailwind-variants";
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
    divider: "border-t border-ink-950/15",
  },
});

export function ProductCatalog({ products }: { products: CatalogProduct[] }) {
  const { wrapperRef, activeIndex, rowHeightRefs, rowInnerRefs, titleWrapRefs, titleRefs } = useScrollAccordion(
    products.length,
  );

  const { wrapper, sticky, inner, divider } = productCatalogStyles();

  return (
    <div ref={wrapperRef} className={wrapper()} style={{ height: `${100 + products.length * SCROLL_PER_ITEM_VH}vh` }}>
      <div className={sticky()}>
        <div className={inner()}>
          {products.map((product, i) => (
            <CatalogItem
              key={product.id}
              product={product}
              index={i}
              isActive={i === activeIndex}
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
          ))}
          <div className={divider()} />
        </div>
      </div>
    </div>
  );
}
