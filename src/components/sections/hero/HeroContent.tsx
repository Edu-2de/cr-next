import { motion } from "framer-motion";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";
import { WHATSAPP_HREF, WHATSAPP_NUMBER } from "@/lib/business-info";
import { Aurora } from "./Aurora";

const heroContentStyles = tv({
  slots: {
    root: "relative flex min-h-screen w-full items-center justify-center overflow-hidden",
    content: "relative z-10 flex flex-col items-center px-6 text-center",
    headline: "pointer-events-none sm:text-8xl lg:text-[8.5rem]",
    subline: "pointer-events-none mt-7 max-w-md",
    whatsappLink: "mt-4 transition-colors hover:text-white",
  },
});

export function HeroContent({ activeRef }: { activeRef?: React.RefObject<boolean> } = {}) {
  const { root, content, headline, subline, whatsappLink } = heroContentStyles();

  return (
    <div className={root()}>
      <Aurora activeRef={activeRef} />
      <div className={content()}>
        <Text
          as={motion.h1}
          variant="display"
          size="6xl"
          color="white"
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={headline()}
        >
          Potência
          <br />
          contínua
        </Text>
        <Text
          as={motion.p}
          variant="eyebrow"
          color="whiteMuted"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className={subline()}
        >
          Motores elétricos industriais de alta performance
        </Text>
        <Text
          as={motion.a}
          variant="eyebrow"
          color="whiteMuted"
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className={whatsappLink()}
        >
          {WHATSAPP_NUMBER}
        </Text>
      </div>
    </div>
  );
}
