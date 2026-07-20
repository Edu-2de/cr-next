"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Light-theme variant of the original dark-theme hero Aurora (that earlier
// component was deleted as unused — this file's own comments are the only
// remaining record of it). Same noise/warp math, but the region mask is
// dropped entirely (the dark original confined its glow to a
// vertical/horizontal gaussian window, which is why it read as
// concentrated in one area) so the cloud pattern is visible edge-to-edge,
// and the color ramp is inverted: near-bg-light for low noise, saturating
// up to a deep brand blue at the peaks, instead of dark-navy-to-white.
const VERTEX_SRC = `#version 300 es
void main() {
  vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}`;

const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uEnergy;

out vec4 fragColor;

vec3 hash33(vec3 p3) {
  p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yxx) * p3.zyx);
}

float perlinNoise(vec3 p) {
  vec3 pi = floor(p);
  vec3 pf = p - pi;
  vec3 w = pf * pf * (3.0 - 2.0 * pf);
  float n000 = dot(pf - vec3(0.0, 0.0, 0.0), hash33(pi + vec3(0.0, 0.0, 0.0)) * 2.0 - 1.0);
  float n100 = dot(pf - vec3(1.0, 0.0, 0.0), hash33(pi + vec3(1.0, 0.0, 0.0)) * 2.0 - 1.0);
  float n010 = dot(pf - vec3(0.0, 1.0, 0.0), hash33(pi + vec3(0.0, 1.0, 0.0)) * 2.0 - 1.0);
  float n110 = dot(pf - vec3(1.0, 1.0, 0.0), hash33(pi + vec3(1.0, 1.0, 0.0)) * 2.0 - 1.0);
  float n001 = dot(pf - vec3(0.0, 0.0, 1.0), hash33(pi + vec3(0.0, 0.0, 1.0)) * 2.0 - 1.0);
  float n101 = dot(pf - vec3(1.0, 0.0, 1.0), hash33(pi + vec3(1.0, 0.0, 1.0)) * 2.0 - 1.0);
  float n011 = dot(pf - vec3(0.0, 1.0, 1.0), hash33(pi + vec3(0.0, 1.0, 1.0)) * 2.0 - 1.0);
  float n111 = dot(pf - vec3(1.0, 1.0, 1.0), hash33(pi + vec3(1.0, 1.0, 1.0)) * 2.0 - 1.0);
  float nx00 = mix(n000, n100, w.x);
  float nx10 = mix(n010, n110, w.x);
  float nx01 = mix(n001, n101, w.x);
  float nx11 = mix(n011, n111, w.x);
  float nxy0 = mix(nx00, nx10, w.y);
  float nxy1 = mix(nx01, nx11, w.y);
  return mix(nxy0, nxy1, w.z);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;

  vec2 st = uv;
  st.x *= aspect;

  // Center point (hero text is centered on screen both ways, see
  // HeroContent.tsx) — used below to keep the middle calm and to anchor
  // the autonomous cursor.
  vec2 circleCenter = vec2(0.5 * aspect, 0.5);
  float distFromCenter = length(st - circleCenter);

  vec2 mouseUV = uMouse;
  mouseUV.x *= aspect;

  float mouseDist = length(st - mouseUV);
  float mouseFalloff = exp(-mouseDist * mouseDist * 3.2) * uEnergy;

  // Autonomous "virtual cursor" — explicit request: the same swirl/white-
  // push reaction the real mouse triggers, but happening on its own, no
  // interaction required. A point drifts in a slow ellipse around the
  // circle's center (not a full loop back to exactly where it started
  // each time — the two different periods on x/y keep the path from
  // repeating in an obviously mechanical way) and drives the identical
  // falloff formula the real cursor uses below, just always "on".
  float autoAngle = uTime * 0.11;
  vec2 autoMouseUV = circleCenter + vec2(cos(autoAngle) * 0.24, sin(autoAngle * 0.8) * 0.18);
  float autoDist = length(st - autoMouseUV);
  float autoFalloff = exp(-autoDist * autoDist * 3.2) * 0.8;

  mouseFalloff = max(mouseFalloff, autoFalloff);

  // Explicit fix: "tente fazer a maior parte do efeito ficar nas laterais
  // para o meio não ficar mudando tanto, para não dificultar a leitura" —
  // 0 right at center (where the title sits), ramping to 1 by mid-distance
  // out to the sides. Scales both the warp distortion below and the final
  // color variation, so the middle stays calm/stable and the sides carry
  // most of the movement.
  float edgeFactor = smoothstep(0.0, 0.62, distFromCenter);

  float t = uTime * 0.16;
  vec2 warped = st;
  float freq = 1.3;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float n = perlinNoise(vec3(warped * freq + fi * 4.1, t + fi * 1.6));
    float angle = n * 6.28318 * 1.4 + mouseFalloff * 4.5;
    float amount = (0.16 + mouseFalloff * 0.9) * (0.8 - fi * 0.2) * mix(0.3, 1.0, edgeFactor);
    warped += vec2(cos(angle), sin(angle)) * amount;
    freq *= 1.9;
  }

  float bands = sin(warped.x * 2.4 + warped.y * 1.0 + uTime * 0.13) * 0.5 + 0.5;
  float haze = perlinNoise(vec3(warped * 0.75, t * 0.6)) * 0.5 + 0.5;

  float n = clamp(bands * 0.65 + haze * 0.55, 0.0, 1.0);
  // Explicit fix: bands+haze saturates near 1.0 over broad areas (their
  // combined weight can exceed 1.0 before the clamp above), so raising the
  // color thresholds alone didn't help — most of the frame was already
  // sitting at the top of the range regardless of where the thresholds
  // sat. Raising to a power >1 compresses the low/mid values down toward
  // 0 while leaving true peaks near 1.0 alone, so only the genuine hot
  // spots stay bright and everything else reads as white/light.
  n = pow(n, 1.5);

  // Explicit fix: settles n toward a fixed, calm mid-tone right at center
  // (where the title sits) and only lets the full organic noise range
  // through once edgeFactor ramps up toward the sides — same "keep the
  // middle stable" request as the warp scaling above, applied to the
  // color-driving value itself so the center doesn't just move less, it
  // also stops swinging between light and dark shades.
  float calmN = 0.4;
  n = mix(calmN, n, edgeFactor);

  // Cursor pushes the pattern toward white/light instead of adding more
  // blue — explicit fix: "quero que o efeito seja branco e não totalmente
  // azul, tipo efeito branco mas empurrando o azul". The warp loop above
  // already displaces the noise field's angle/amount around the cursor
  // (so the blue swirls visibly bend away from it); subtracting here on
  // top of that reads as the cursor carving out a light void that pushes
  // the blue aside, rather than concentrating more blue under it.
  n -= mouseFalloff * 0.6;
  n = clamp(n, 0.0, 1.0);

  // Explicit fix: "só tons de azul, sem branco" — deep used to be
  // near-white (0.933, 0.945, 0.965); now it's the lightest shade of blue
  // in the ramp instead, so every pixel on screen stays some tone of blue,
  // never pure white/gray.
  // Explicit fix: "utilize tons de azul mais escuros para combinar mais"
  // (darker to pair better with the now-white title) — every step of the
  // ramp shifted down, deep included, so nothing lands close to white/pale
  // anymore.
  vec3 deep = vec3(0.30, 0.46, 0.68);
  vec3 mid = vec3(0.20, 0.40, 0.66);
  vec3 bright = vec3(0.12, 0.27, 0.48);
  vec3 hot = vec3(0.05, 0.11, 0.22);

  // Thresholds pulled back down again — explicit fix: "não quero que a
  // tela fique tão branca na maior parte do tempo", so more of the noise
  // range now reads as color instead of staying pure white.
  vec3 color = mix(deep, mid, smoothstep(0.1, 0.35, n));
  color = mix(color, bright, smoothstep(0.4, 0.62, n));
  color = mix(color, hot, smoothstep(0.78, 1.0, n));
  // Explicit fix: pushes toward deep (the lightest, near-white tone) right
  // at the cursor, matching the n subtraction above — the cursor reads as
  // a white/light area that displaces the blue swirl, not a spot that
  // concentrates more blue.
  color = mix(color, deep, mouseFalloff * 0.7);

  // Explicit fix: "deixar a tela toda com o efeito... sem branco, só tons
  // de azul" — no more masking back out to white/deep outside a circle;
  // the whole screen stays covered by the (now blue-only) ramp above. The
  // circle geometry above is still used for the center fill boost and to
  // anchor the autonomous cursor, just no longer for cutting the edges.
  fragColor = vec4(color, 1.0);
}`;

// A lost WebGL context makes shader compilation fail with a null info log
// (not a real syntax error) — that used to throw a hard "Shader compile
// error: null" that crashed the whole component tree. Context loss is an
// expected, recoverable event (the browser's ~16-context cap force-losing
// the oldest one under heavy dev-mode remount churn, see the
// WEBGL_lose_context cleanup below) — so this returns `null` instead of
// throwing whenever the context is already lost, and only throws for a
// genuine compile error (context still alive, info log has real content).
function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    if (gl.isContextLost()) return null;
    throw new Error("Unable to create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    if (gl.isContextLost()) return null;
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

export function Aurora({ activeRef }: { activeRef?: React.RefObject<boolean> } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl || gl.isContextLost()) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) {
      if (gl.isContextLost()) return;
      throw new Error("Unable to create program");
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (gl.isContextLost()) return;
      throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
    }
    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uEnergy = gl.getUniformLocation(program, "uEnergy");

    const mouseState = { x: 0.5, y: 0.5 };
    const energyState = { v: 0 };

    const quickX = gsap.quickTo(mouseState, "x", { duration: 0.9, ease: "power3.out" });
    const quickY = gsap.quickTo(mouseState, "y", { duration: 0.9, ease: "power3.out" });

    function pulseEnergy() {
      gsap.to(energyState, {
        v: 1,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => {
          gsap.to(energyState, { v: 0, duration: 1.5, ease: "power2.out", overwrite: true });
        },
      });
    }

    function handlePointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      quickX((e.clientX - rect.left) / rect.width);
      quickY(1 - (e.clientY - rect.top) / rect.height);
      pulseEnergy();
    }

    canvas.addEventListener("pointermove", handlePointerMove);

    const RENDER_SCALE = 0.65;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * RENDER_SCALE;
      const width = Math.floor(canvas!.clientWidth * dpr);
      const height = Math.floor(canvas!.clientHeight * dpr);
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
        gl!.viewport(0, 0, width, height);
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.8, ease: "power2.out" });

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    function frame(now: number) {
      // If the context died mid-session (GPU reset, or the browser's
      // context cap force-losing this one), every GL call below is a
      // no-op — stop the loop entirely instead of spinning RAF forever
      // doing nothing.
      if (gl!.isContextLost()) return;

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Once the hero has scrolled out of view (activeRef flips false), skip the
      // actual draw — this shader runs continuously otherwise, and it's wasted
      // GPU work once nothing above it is visible.
      if (activeRef?.current === false) {
        raf = requestAnimationFrame(frame);
        return;
      }

      // Explicit fix: this used to freeze under prefers-reduced-motion, but
      // this effect's whole point now is an ambient animation that runs on
      // its own without any interaction ("quero que ele se mexa sozinho,
      // tenha uma animação própria") — always advance.
      elapsed += dt;

      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, elapsed);
      gl!.uniform2f(uMouse, mouseState.x, mouseState.y);
      gl!.uniform1f(uEnergy, energyState.v);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    }

    function handleContextLost(event: Event) {
      event.preventDefault();
      cancelAnimationFrame(raf);
    }
    canvas.addEventListener("webglcontextlost", handleContextLost);

    raf = requestAnimationFrame(frame);

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      gsap.killTweensOf(mouseState);
      gsap.killTweensOf(energyState);
      gsap.killTweensOf(canvas);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      // Browsers cap simultaneous WebGL contexts (commonly ~16) and force-
      // lose the OLDEST one once exceeded — deleting the program/shaders
      // above doesn't free the context slot itself, so every remount
      // without this leaked one context (very visible across a long dev
      // session's Fast Refresh cycles). Deferred slightly because doing it
      // synchronously races React 18 Strict Mode's dev-only double-invoke
      // (mount → cleanup → mount, back-to-back on the same canvas) — see
      // `reactStrictMode: false` in next.config.ts, which this codebase
      // also relies on for this exact reason.
      setTimeout(() => gl.getExtension("WEBGL_lose_context")?.loseContext(), 50);
    };
  }, [activeRef]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="bg-grain pointer-events-none absolute inset-0" />
    </div>
  );
}
