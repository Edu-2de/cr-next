"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function LoadingScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let cancelled = false;

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 550));
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const windowLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));

    // Only the two things the first frame actually needs (fonts + core
    // bundle) gate the screen — the motor GLB is deferred on purpose to
    // avoid stuttering the hero, so it stays out of this readiness check.
    Promise.all([minDelay, fontsReady, windowLoaded]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) document.body.style.overflow = "";
  }, [ready]);

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="loading-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060b16]"
        >
          <div className="flex flex-col items-center gap-6">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-white">
              CR Mesquita
            </span>
            <div className="h-px w-36 overflow-hidden bg-white/10">
              <motion.div
                className="h-full w-1/3 bg-brand-500"
                animate={{ x: ["-120%", "220%"] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
