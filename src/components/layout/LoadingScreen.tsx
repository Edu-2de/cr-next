"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";

gsap.registerPlugin(ScrollTrigger);

// A plain CSS opacity transition on an always-mounted element — not
// AnimatePresence's exit animation — because AnimatePresence here would
// intermittently leave the overlay's DOM node stuck fully opaque forever
// (setReady(true) fired, but framer-motion never applied the exit style).
// unmounted after its own transition ends, so no dangling opaque overlay or
// pointer-events trap survives past the fade.
const FADE_MS = 600;

const loadingScreenStyles = tv({
  slots: {
    overlay:
      "fixed inset-0 z-100 flex items-center justify-center bg-ink-950 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)]",
    content: "flex flex-col items-center gap-6",
    barTrack: "h-px w-36 overflow-hidden bg-white/10",
    barFill: "h-full w-1/3 bg-brand-500",
  },
});

export function LoadingScreen() {
  const [ready, setReady] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let cancelled = false;

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 550));
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const windowLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));

    // Motor GLB deliberately excluded — deferring it avoids stuttering the hero.
    Promise.all([minDelay, fontsReady, windowLoaded]).then(() => {
      if (cancelled) return;
      // Every pinned/scrubbed section's ScrollTrigger is created (and its
      // start/end measured) as soon as its component mounts — well before
      // fonts/images finish loading and settling final layout. Without this,
      // those triggers keep whatever (sometimes wrong) geometry they saw at
      // mount, so a scrubbed reveal can silently misfire or never fire.
      ScrollTrigger.refresh();
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.body.style.overflow = "";
    const timeout = setTimeout(() => setUnmounted(true), FADE_MS);
    return () => clearTimeout(timeout);
  }, [ready]);

  const { overlay, content, barTrack, barFill } = loadingScreenStyles();

  if (unmounted) return null;

  return (
    <div
      className={overlay({ class: ready ? "pointer-events-none opacity-0" : "opacity-100" })}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className={content()}>
        <Text as="span" variant="wordmark" size="sm" weight="semibold" tracking="loosest" uppercase color="white">
          CR Mesquita
        </Text>
        <div className={barTrack()}>
          <motion.div
            className={barFill()}
            animate={{ x: ["-120%", "220%"] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
