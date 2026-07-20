import Image from "next/image";
import type { RefObject } from "react";
import { Text } from "@/components/ui/Text";

import crImg from "@/assets/images/building-facade.jpg";
import { MAPS_PLACE_URL } from "@/lib/business-info";

// Google's no-API-key embed URL, centered on the precise pin coordinates
// (the `!3d!4d` values, more accurate than the `@lat,lng` viewport center)
// from MAPS_PLACE_URL (lib/business-info.ts).
const MAPS_EMBED_SRC = "https://maps.google.com/maps?q=-30.0060128,-51.2041833&z=17&output=embed";

type FactoryLocationProps = {
  factoryPhotoBoxRef: RefObject<HTMLDivElement | null>;
  factoryPhotoRef: RefObject<HTMLDivElement | null>;
  mapBoxRef: RefObject<HTMLDivElement | null>;
};

export function FactoryLocation({ factoryPhotoBoxRef, factoryPhotoRef, mapBoxRef }: FactoryLocationProps) {
  return (
    <div className="mt-24 grid w-full grid-cols-1 sm:mt-32 sm:grid-cols-2">
      <div ref={factoryPhotoBoxRef} className="relative h-[380px] opacity-0 sm:h-[480px]">
        <div ref={factoryPhotoRef} className="absolute inset-0">
          <Image
            src={crImg}
            alt="Fachada da fábrica da CR Mesquita, em Porto Alegre"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div ref={mapBoxRef} className="relative h-[380px] opacity-0 sm:h-[480px]">
        <iframe
          src={MAPS_EMBED_SRC}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localização da CR Mesquita no Google Maps"
        />
        <a
          href={MAPS_PLACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-ink-950/70 px-4 py-2 backdrop-blur-md transition-colors hover:bg-ink-950/85"
        >
          <Text as="span" size="xs" weight="medium" color="white">
            Ver no Google Maps
          </Text>
        </a>
      </div>
    </div>
  );
}
