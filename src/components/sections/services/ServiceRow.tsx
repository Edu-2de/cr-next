"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import type { Service } from "@/lib/services-info";

gsap.registerPlugin(ScrollTrigger);

const serviceRowStyles = tv({
  slots: {
    row: "border-t border-ink-950/15 py-8 sm:py-14",
    grid: "grid grid-cols-1 gap-4 sm:items-center sm:gap-6 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-x-16 sm:gap-y-10",
    title: "order-2 sm:order-1",
    description: "order-3 sm:order-2 sm:text-xl",
    imageWrap: "relative order-1 sm:order-3",
    imageBox: "relative h-48 w-full overflow-hidden rounded-md sm:h-60",
    image: "object-cover",
    badge: "absolute bottom-3 left-3 rounded-sm bg-ink-950 px-3 py-1.5",
  },
});

export function ServiceRow({ service }: { service: Service }) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (rowRef.current) {
        gsap.fromTo(
          rowRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, rowRef);
    return () => ctx.revert();
  }, []);

  const { row, grid, title, description, imageWrap, imageBox, image, badge } = serviceRowStyles();

  return (
    <div ref={rowRef} className={row()}>
      <div className={grid()}>
        <Text as="h3" variant="rowHeading" color="ink" className={title()}>
          {service.title}
        </Text>
        <Text as="p" size="lg" leading="relaxed" color="inkMuted" className={description()}>
          {service.description}
        </Text>
        <div className={imageWrap()}>
          <div className={imageBox()}>
            <Image
              src={service.src}
              alt={service.title}
              fill
              sizes="(min-width: 640px) 400px, 100vw"
              className={image()}
            />
          </div>
          <Text as="span" variant="badge" color="white" className={badge()}>
            Ver serviço ↗
          </Text>
        </div>
      </div>
    </div>
  );
}
