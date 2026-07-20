import { useCallback, useSyncExternalStore } from "react";

// useSyncExternalStore instead of the more obvious useState+useEffect —
// setting state synchronously inside an effect body (setIsDesktop(mql.matches)
// right after creating the query) is flagged by React as an avoidable
// cascading render: it always fires on mount, forcing a second render pass
// on every single page load just to correct the SSR-safe default. This
// hook's job — read a browser-only media query and re-render on change — is
// exactly what useSyncExternalStore exists for, with no such extra pass.
function subscribe(query: string, onChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

// Same SSR-safe default as before (false) — the visual behavior (mobile
// layout first, corrected to desktop on the client) is unchanged.
function getServerSnapshot() {
  return false;
}

export function useIsDesktop(breakpointPx = 1024) {
  const query = `(min-width: ${breakpointPx}px)`;
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const subscribeToQuery = useCallback((onChange: () => void) => subscribe(query, onChange), [query]);
  return useSyncExternalStore(subscribeToQuery, getSnapshot, getServerSnapshot);
}
