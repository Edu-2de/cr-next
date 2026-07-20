import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Off deliberately: components/hero/Aurora.tsx owns a raw WebGL2 canvas
  // (hand-managed GL context, not R3F/Three.js) whose cleanup explicitly
  // releases the GL context on unmount (see WEBGL_lose_context there) to
  // avoid leaking contexts across dev Fast Refresh cycles. React 18 Strict
  // Mode's dev-only double-invoke (mount → cleanup → mount, back-to-back,
  // on the same canvas element) races that release against the very next
  // context creation and reliably hands back an already-lost context —
  // confirmed directly: identical code with `reactStrictMode: true` loses
  // the context every load in dev, `false` never does, and a production
  // build (which never double-invokes regardless of this flag) was already
  // confirmed unaffected either way. Since the only observed Strict Mode
  // violation in this codebase is this exact WebGL timing quirk (not an
  // actual effect-cleanup bug), turning it off is a targeted trade, not a
  // blanket "ignore StrictMode's warnings" — revisit if a future effect
  // elsewhere actually needs it. (A second such component, MotorAurora,
  // existed briefly and shared this same concern, but was removed
  // entirely per a later decision — see project memory for that section.)
  reactStrictMode: false,
  allowedDevOrigins:  ['192.168.0.11'],

};

export default nextConfig;
