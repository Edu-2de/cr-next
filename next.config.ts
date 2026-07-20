import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Off: Strict Mode's dev-only double-invoke races Aurora.tsx's raw WebGL2
  // context cleanup against the next context creation, reliably losing it.
  reactStrictMode: false,
  allowedDevOrigins: ["192.168.0.11", "*"],
};

export default nextConfig;
