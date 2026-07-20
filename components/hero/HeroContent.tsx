import { motion } from "framer-motion";
import { Aurora } from "./Aurora";

export function HeroContent({
  activeRef,
}: {
  activeRef?: React.RefObject<boolean>;
} = {}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#060b16]">
      <Aurora activeRef={activeRef} />

      <div className="pointer-events-none relative z-10 flex flex-col items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl font-semibold uppercase leading-[0.95] tracking-tight text-white sm:text-8xl lg:text-[8.5rem]"
        >
          Potência
          <br />
          contínua
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-7 max-w-md text-sm uppercase tracking-[0.15em] text-white/50"
        >
          Motores elétricos industriais de alta performance
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="pointer-events-auto mt-10"
        >

        </motion.div>
      </div>
    </div>
  );
}
