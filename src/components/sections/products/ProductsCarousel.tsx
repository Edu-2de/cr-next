"use client";

import Image from "next/image";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import { useDraggableCarousel } from "@/hooks/ui/useDraggableCarousel";
import { PRODUCTS } from "@/lib/products-info";

const REPEAT_COUNT = 3;
const TRACK_ITEMS = Array.from({ length: REPEAT_COUNT }, () => PRODUCTS).flat();
const ROW_DURATION_S = 90;

const productsCarouselStyles = tv({
  slots: {
    wrapper: "mx-auto max-w-6xl px-6 pt-6 sm:px-12 sm:pt-10",
    maskBox: "relative overflow-hidden bg-white",
    track: "flex w-max",
    card: "flex w-80 shrink-0 flex-col gap-6 border-l border-ink-950/15 px-8 py-8 sm:py-10",
    imageBox: "relative h-80 w-full",
    image: "object-contain",
  },
});

export function ProductsCarousel() {
  const { trackRef, onMouseEnter, onMouseLeave } = useDraggableCarousel(REPEAT_COUNT, ROW_DURATION_S);

  const { wrapper, maskBox, track, card, imageBox, image } = productsCarouselStyles();

  return (
    <div className={wrapper()}>
      <div
        className={maskBox()}
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div ref={trackRef} className={track()}>
          {TRACK_ITEMS.map((product, i) => (
            <div key={`${product.id}-${i}`} className={card()}>
              <Text as="h3" variant="productLabel" color="ink">
                {product.title}
              </Text>
              <div className={imageBox()}>
                <Image src={product.src} alt={product.title} fill sizes="320px" className={image()} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
