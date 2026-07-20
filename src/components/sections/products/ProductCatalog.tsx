"use client";

import { useScrollAccordion } from "@/hooks/useScrollAccordion";
import type { CatalogProduct } from "@/lib/products-info";
import { CatalogItem } from "./CatalogItem";

// Wrapper height must add a full 100vh "tax" on top of the per-item scroll
// budget — with start/end "top top"/"bottom bottom", the usable scrub range
// is wrapperHeight - 100vh, not the wrapper's own height.
const SCROLL_PER_ITEM_VH = 40;

export function ProductCatalog({ products }: { products: CatalogProduct[] }) {
  const { wrapperRef, activeIndex, rowHeightRefs, rowInnerRefs, titleWrapRefs, titleRefs } = useScrollAccordion(
    products.length,
  );

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: `${100 + products.length * SCROLL_PER_ITEM_VH}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-12">
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
          <div className="border-t border-ink-950/15" />
        </div>
      </div>
    </div>
  );
}
