import { useEffect, useState } from "react";

// Defaults to false (this hook's callers treat "mobile" as the simpler,
// cheaper layout — no pinned scroll-jacking, no scroll-driven GSAP setup)
// so a first paint before hydration never briefly ships the heavier
// desktop layout. Corrected to the real value on mount.
export function useIsDesktop(breakpointPx = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    setIsDesktop(mql.matches);
    const handler = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpointPx]);

  return isDesktop;
}
