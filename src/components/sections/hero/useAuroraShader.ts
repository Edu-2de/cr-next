import { useEffect } from "react";
import gsap from "gsap";
import { FRAGMENT_SRC, VERTEX_SRC } from "./aurora-shaders";

// A lost context makes compilation fail with a null info log, not a real
// syntax error — return null instead of throwing when that's the cause.
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

export function useAuroraShader(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  activeRef?: React.RefObject<boolean>,
) {
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
      if (gl!.isContextLost()) return;

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Skip the draw once the hero has scrolled out of view.
      if (activeRef?.current === false) {
        raf = requestAnimationFrame(frame);
        return;
      }

      // Always advances regardless of prefers-reduced-motion — this is an
      // ambient effect, not an interaction response.
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
      // Browsers cap simultaneous WebGL contexts (~16); deleting the
      // program/shaders doesn't free the slot, so release it explicitly.
      // Deferred to avoid racing React Strict Mode's dev-only double-invoke.
      setTimeout(() => gl.getExtension("WEBGL_lose_context")?.loseContext(), 50);
    };
  }, [canvasRef, activeRef]);
}
