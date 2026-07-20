"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Text } from "@/components/ui/Text";
import type { Service } from "@/lib/services-info";

gsap.registerPlugin(ScrollTrigger);

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

  return (
    <div ref={rowRef} className="border-t border-ink-950/15 py-10 sm:py-14">
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-x-16 sm:gap-y-10">
        <Text as="h3" variant="rowHeading" color="ink">
          {service.title}
        </Text>
        <Text as="p" size="lg" leading="relaxed" color="inkMuted" className="sm:text-xl">
          {service.description}
        </Text>
        <div className="relative">
          <div className="relative h-52 w-full overflow-hidden rounded-md sm:h-60">
            <Image
              src={service.src}
              alt={service.title}
              fill
              sizes="(min-width: 640px) 400px, 100vw"
              className="object-cover"
            />
          </div>
          <Text
            as="span"
            variant="badge"
            color="white"
            className="absolute bottom-3 left-3 rounded-sm bg-ink-950 px-3 py-1.5"
          >
            Ver serviço ↗
          </Text>
        </div>
      </div>
    </div>
  );
}
