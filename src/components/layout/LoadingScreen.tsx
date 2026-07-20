"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { tv } from "tailwind-variants";
import { Text } from "@/components/ui/Text";

gsap.registerPlugin(ScrollTrigger);

// A plain CSS opacity transition on an always-mounted element — not
// framer-motion's AnimatePresence exit — because AnimatePresence here would
// intermittently leave the overlay's DOM node stuck fully opaque forever
// (setReady(true) fired, but framer-motion never applied the exit style).
// unmounted after its own transition ends, so no dangling opaque overlay or
// pointer-events trap survives past the fade. The progress counter below is
// driven by the same setInterval/setTimeout mechanism for the same reason —
// rAF/WAAPI-driven values (framer-motion, GSAP ticker) can stop advancing
// in a backgrounded/unfocused tab, timers still fire.
const FADE_MS = 500;

// No real byte-level progress signal exists here (fonts.ready/window "load"
// are binary, not incremental), so this eases toward a cap short of 100 —
// same technique GitHub/YouTube use — and only the real `ready` flip snaps
// it the rest of the way, so the number stays honest about "still working"
// vs. "actually done."
const SIMULATED_CAP = 92;
const TICK_MS = 60;

const loadingScreenStyles = tv({
  slots: {
    overlay:
      "fixed inset-0 z-100 flex items-center justify-center bg-ink-950 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)]",
    // One focal element — the count itself, at the same oversized-type scale
    // as the rest of the site's display moments (Hero headline, "sobre nós",
    // the mobile nav's numbered links) — rather than a wordmark + bar +
    // number stacked together, which read as a generic loader widget.
    percent: "flex items-start font-mono text-white tabular-nums",
    percentSign: "mt-[0.5em] text-[0.28em] text-white/30",
    wordmark: "absolute inset-x-0 bottom-14 flex justify-center",
  },
});

export function LoadingScreen() {
  const [ready, setReady] = useState(false);
  const [unmounted, setUnmounted] = useState(false);
  const [progress, setProgress] = useState(0);

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
    if (ready) return;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.max(0.6, (SIMULATED_CAP - p) * 0.045), SIMULATED_CAP));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    document.body.style.overflow = "";
    const timeout = setTimeout(() => setUnmounted(true), FADE_MS);
    return () => clearTimeout(timeout);
  }, [ready]);

  const { overlay, percent, percentSign, wordmark } = loadingScreenStyles();

  if (unmounted) return null;

  const displayProgress = ready ? 100 : Math.round(progress);

  return (
    <div
      className={overlay({ class: ready ? "pointer-events-none opacity-0" : "opacity-100" })}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className={percent()} style={{ fontSize: "clamp(3.5rem, 11vw, 7.5rem)" }}>
        <span>{displayProgress}</span>
        <span className={percentSign()}>%</span>
      </div>
      <div className={wordmark()}>
        <Text as="span" variant="wordmark" size="xs" weight="semibold" tracking="loosest" uppercase color="whiteFaint">
          CR Mesquita
        </Text>
      </div>
    </div>
  );
}
