import { Text } from "@/components/ui/Text";
import type { CatalogProduct } from "@/lib/products-info";
import { tv } from "tailwind-variants";

type CatalogItemProps = {
  product: CatalogProduct;
  index: number;
  isActive: boolean;
  onSelect?: () => void;
  titleWrapRef: (el: HTMLDivElement | null) => void;
  titleRef: (el: HTMLHeadingElement | null) => void;
  rowHeightRef: (el: HTMLDivElement | null) => void;
  rowInnerRef: (el: HTMLDivElement | null) => void;
};

const catalogItemStyles = tv({
  slots: {
    row: "",
    content: "py-10 sm:py-16",
    rowHeight: "overflow-hidden",
    rowInner: "pt-4",
    description: "max-w-2xl sm:text-lg",
    specs: "mt-4 flex max-w-2xl flex-col gap-1.5 sm:mt-5",
    titleButton: "block w-full text-left",
  },
  variants: {
    first: {
      true: {},
      false: { row: "border-t border-ink-950/15" },
    },
  },
});

export function CatalogItem({
  product,
  index,
  isActive,
  onSelect,
  titleWrapRef,
  titleRef,
  rowHeightRef,
  rowInnerRef,
}: CatalogItemProps) {
  const { row, content, rowHeight, rowInner, description, specs, titleButton } = catalogItemStyles({
    first: index === 0,
  });

  return (
    <div className={row()}>
      <div className={content()}>
        <div
          ref={titleWrapRef}
          style={{ opacity: isActive ? 1 : 0.3 }}
          {...(onSelect && { role: "button", tabIndex: 0, onClick: onSelect })}
          className={onSelect ? titleButton() : undefined}
        >
          <Text as="h3" variant="catalogHeading" color="ink" ref={titleRef}>
            {product.title}
          </Text>
        </div>
        <div ref={rowHeightRef} className={rowHeight()} style={{ height: index === 0 ? undefined : 0 }}>
          <div ref={rowInnerRef} className={rowInner()} style={{ opacity: index === 0 ? 1 : 0 }}>
            <Text as="p" size="base" leading="relaxed" color="inkMuted" className={description()}>
              {product.description}
            </Text>
            {product.specs.length > 0 && (
              <ul className={specs()}>
                {product.specs.map((item) => (
                  <Text as="li" key={item} size="lg" color="inkFaint" >
                    {item}
                  </Text>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
