import gsap from "gsap";

export function remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const clamped = gsap.utils.clamp(inMin, inMax, value);
  return gsap.utils.mapRange(inMin, inMax, outMin, outMax, clamped);
}

export const EASE_SETTLE = gsap.parseEase("power2.out");
