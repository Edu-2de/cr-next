"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

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

  vec2 mouseUV = uMouse;
  mouseUV.x *= aspect;

  float mouseDist = length(st - mouseUV);
  float mouseFalloff = exp(-mouseDist * mouseDist * 3.2) * uEnergy;

  float t = uTime * 0.05;
  vec2 warped = st;
  float freq = 1.3;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float n = perlinNoise(vec3(warped * freq + fi * 4.1, t + fi * 1.6));
    float angle = n * 6.28318 * 1.4 + mouseFalloff * 4.5;
    float amount = (0.16 + mouseFalloff * 0.9) * (0.8 - fi * 0.2);
    warped += vec2(cos(angle), sin(angle)) * amount;
    freq *= 1.9;
  }

  float bands = sin(warped.x * 2.4 + warped.y * 1.0 + uTime * 0.04) * 0.5 + 0.5;
  float haze = perlinNoise(vec3(warped * 0.75, t * 0.6)) * 0.5 + 0.5;

  float n = clamp(bands * 0.65 + haze * 0.55, 0.0, 1.0);
  n -= mouseFalloff * 0.6;
  n = clamp(n, 0.0, 1.0);

  vec3 deep = vec3(0.018, 0.032, 0.065);
  vec3 mid = vec3(0.098, 0.266, 0.478);
  vec3 bright = vec3(0.282, 0.620, 0.918);
  vec3 hot = vec3(0.80, 0.91, 1.0);

  vec3 color = mix(deep, mid, smoothstep(0.2, 0.55, n));
  color = mix(color, bright, smoothstep(0.5, 0.8, n));
  color = mix(color, hot, smoothstep(0.82, 1.0, n));
  color = mix(color, deep * 0.35, mouseFalloff * 0.85);

  vec3 bg = vec3(0.012, 0.02, 0.04);
  float cx = 0.5 * aspect;
  float verticalMask = smoothstep(0.18, 0.68, uv.y);
  float horizontalMask = exp(-pow((st.x - cx) / (0.42 * aspect + 0.01), 2.0));
  float regionMask = clamp(verticalMask * horizontalMask, 0.0, 1.0);
  color = mix(bg, color, regionMask);

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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

      // Under prefers-reduced-motion we still want the field to respond to the
      // cursor (that's user-driven, not autoplay) — we just stop the ambient
      // autonomous drift by freezing the time uniform.
      if (!reduceMotion) elapsed += dt;

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
