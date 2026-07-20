"use client";

import Image from "next/image";
import { Text } from "@/components/ui/Text";
import { useDraggableCarousel } from "@/hooks/useDraggableCarousel";
import { PRODUCTS } from "@/lib/products-info";

const REPEAT_COUNT = 3;
const TRACK_ITEMS = Array.from({ length: REPEAT_COUNT }, () => PRODUCTS).flat();
const ROW_DURATION_S = 90;

export function ProductsCarousel() {
  const { trackRef, onMouseEnter, onMouseLeave } = useDraggableCarousel(REPEAT_COUNT, ROW_DURATION_S);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-6 sm:px-12 sm:pt-10">
      <div
        className="relative overflow-hidden bg-white"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div ref={trackRef} className="flex w-max">
          {TRACK_ITEMS.map((product, i) => (
            <div
              key={`${product.id}-${i}`}
              className="flex w-80 shrink-0 flex-col gap-6 border-l border-ink-950/15 px-8 py-8 sm:py-10"
            >
              <Text as="h3" variant="productLabel" color="ink">
                {product.title}
              </Text>
              <div className="relative h-80 w-full">
                <Image src={product.src} alt={product.title} fill sizes="320px" className="object-contain" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
