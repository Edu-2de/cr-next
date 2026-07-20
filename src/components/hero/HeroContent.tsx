import { motion } from "framer-motion";
import { WHATSAPP_HREF, WHATSAPP_NUMBER } from "@/lib/business-info";
import { Aurora } from "./Aurora";

// Same centered single-column layout as an earlier dark-theme hero (since
// deleted as unused),
// just re-themed light: the Aurora field itself carries the color switch
// (dark navy bg + bright glow → light bg + saturated-blue glow, full-screen
// instead of corner-masked, see Aurora.tsx), so this file only swaps text
// colors/weights to match.
//
// WhatsApp direct-contact link added below the subline — explicit request
// ("info de contato direto no hero"). First pass used an icon + underlined
// hyperlink styling that read as a bolted-on "contact chip," inconsistent
// with the subline right above it — explicit follow-up: "quero que fique
// mais clean". Fixed by dropping the icon entirely and reusing the SAME
// typographic treatment as the subline itself (`text-sm uppercase
// tracking-[0.15em] text-white/70`, same weight/size/letter-spacing) so it
// reads as one continuous, cohesive text block rather than a distinct UI
// element — only a plain color brighten on hover (no underline) signals
// it's a link, matching this project's "flat/subtle hover states, no
// glow/decoration" convention. The number itself was confirmed with the
// user rather than guessed from CR.jpg, which is too low-res (284×160) to
// read reliably. Number now sourced from `lib/business-info.ts` (single
// source of truth, shared with the Sobre section and the Footer).

export function HeroContent({ activeRef }: { activeRef?: React.RefObject<boolean> } = {}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <Aurora activeRef={activeRef} />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none font-display text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-8xl lg:text-[8.5rem]"
        >
          Potência
          <br />
          contínua
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="pointer-events-none mt-7 max-w-md text-sm uppercase tracking-[0.15em] text-white/70"
        >
          Motores elétricos industriais de alta performance
        </motion.p>
        <motion.a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="mt-4 text-sm uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white"
        >
          {WHATSAPP_NUMBER}
        </motion.a>
      </div>
    </div>
  );
}
