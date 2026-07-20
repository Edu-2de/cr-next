import { Text } from "@/components/ui/Text";
import type { CatalogProduct } from "@/lib/products-info";

type CatalogItemProps = {
  product: CatalogProduct;
  index: number;
  isActive: boolean;
  titleWrapRef: (el: HTMLDivElement | null) => void;
  titleRef: (el: HTMLHeadingElement | null) => void;
  rowHeightRef: (el: HTMLDivElement | null) => void;
  rowInnerRef: (el: HTMLDivElement | null) => void;
};

export function CatalogItem({
  product,
  index,
  isActive,
  titleWrapRef,
  titleRef,
  rowHeightRef,
  rowInnerRef,
}: CatalogItemProps) {
  return (
    <div className={index === 0 ? undefined : "border-t border-ink-950/15"}>
      <div className="py-10 sm:py-16">
        <div ref={titleWrapRef} style={{ opacity: isActive ? 1 : 0.3 }}>
          <Text as="h3" variant="catalogHeading" color="ink" ref={titleRef}>
            {product.title}
          </Text>
        </div>
        <div ref={rowHeightRef} className="overflow-hidden" style={{ height: index === 0 ? undefined : 0 }}>
          <div ref={rowInnerRef} className="pt-4" style={{ opacity: index === 0 ? 1 : 0 }}>
            <Text as="p" size="base" leading="relaxed" color="inkMuted" className="max-w-2xl sm:text-lg">
              {product.description}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
