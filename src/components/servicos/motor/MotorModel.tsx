"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Fetched by URL at runtime (GLTFLoader does a plain fetch/XHR, not a
// bundler import), so it must live in public/ — that's the only directory
// Next.js serves as static files at the site root. An identical copy used
// to also sit at app/assets/models/electric_motor.glb, but that copy was
// never actually reachable (app/assets/ goes through the bundler, not
// served by URL) or imported by any bundler import anywhere — a genuine
// unused duplicate, deleted. This public/ copy is the only one that
// exists now and the only one that was ever truly in use. Plain three.js,
// not react-three-fiber — this project doesn't have @react-three/fiber/drei
// installed, only the base `three` package.
const MODEL_URL = "/models/electric_motor.glb";

// Back to rendering inside its own bounded box (not full-viewport) — see
// MotorIntro.tsx, which now slides that whole box in from viewport-center
// to a side slot next to the title/description, rather than moving the
// model in Three.js world-space. TARGET_SIZE 2.75 reproduces the same
// on-screen apparent size the motor had the last time it lived in a small
// dedicated box (~464px tall, filling ~87% of it) — since the camera's
// vertical FOV/distance are unchanged, on-screen fraction of container
// height only depends on TARGET_SIZE/3.15 (the fixed frustum height).
const TARGET_SIZE = 2.75;
const ROTATE_SPEED = 0.06;

// Half the side length of the loose CUBE particles start in before
// assembling into the motor — explicit request: "ao invés de uma esfera,
// faça um cubo." Each particle sits on this cube's SURFACE along the SAME
// direction vector used for its hover-disperse offset below (same idiom
// the old sphere used, just projected onto a cube instead of a sphere —
// see the L∞/Chebyshev-normalized `cubeScale` in the generation loop),
// so the cube→motor morph still reads as an organic "coming together"
// rather than a random reshuffle. A cube's farthest points from center are
// its CORNERS, at `CUBE_HALF * √3` — noticeably farther than a sphere of
// the same "radius" (whose farthest point is just the radius itself), so
// this has to be smaller than the old SPHERE_RADIUS (1.25) to respect the
// same frustum bound discovered while tuning that sphere (the camera's
// uncompensated `position.set(0, 0.3, 5)` tilt makes the bottom margin the
// tightest at ~1.275 world units — see TARGET_SIZE's own comment above):
// 0.72 * √3 ≈ 1.247, just inside that bound (confirmed visually, no corner
// clipping).
const CUBE_HALF = 0.72;

// No texture at all — every mesh's surface gets merged into one geometry
// and resampled into a cloud of points (three.js's MeshSurfaceSampler, a
// standard example addon: it picks random positions weighted by triangle
// area), rendered as small opaque THREE.Points.
const PARTICLE_COUNT = 20000;
const PARTICLE_SIZE = 0.022;
const PARTICLE_COLOR = "#2f7cc9";

// Reject samples whose face normal doesn't point outward from the model's
// own center (dot(normal, point-center) <= threshold) and re-roll — this is
// what actually keeps interior/backfacing surfaces (the inside of the
// terminal-box cavity, inward-facing walls around bolt holes, etc.) out of
// the cloud, rather than just relying on depth occlusion to hide them once
// rendered. A small positive threshold (not exactly 0) drops near-grazing
// faces too, which tend to be edge seams that look noisy either way.
const OUTWARD_DOT_THRESHOLD = 0.05;
const MAX_SAMPLE_ATTEMPTS = 40;

const DISPERSE_DISTANCE_MIN = 0.6;
const DISPERSE_DISTANCE_MAX = 1.8;

// Only particles within this radius of the cursor's 3D position (where the
// mouse ray crosses the model's own z=0 depth plane) disperse — not the
// whole cloud — with the amount falling off toward the edge of the radius.
const CURSOR_RADIUS = 1.1;
const PARTICLE_DISPERSE_LERP = 0.15;

export function MotorModel({
  formProgressRef,
}: {
  // 0 = loose cube, 1 = fully formed motor. Defaults to already-formed so
  // any future caller that omits it just gets the static motor, same as
  // before this prop existed.
  formProgressRef?: React.RefObject<number>;
} = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    const container = containerRef.current;
    if (!wrap || !container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.3, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);

    let particles: THREE.Points | null = null;
    let formedPositions: Float32Array | null = null;
    let cubePositions: Float32Array | null = null;
    let dispersedOffsets: Float32Array | null = null;
    let livePositions: Float32Array | null = null;
    let particleDisperse: Float32Array | null = null;
    let disposed = false;

    // Where the pointer currently is, in normalized device coords — null
    // while the pointer isn't over this canvas at all, so the proximity
    // pass can skip everything and let the cloud relax back to formed.
    let pointerNDC: THREE.Vector2 | null = null;
    const pointerNDCVec = new THREE.Vector2();
    function updatePointerNDC(event: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointerNDCVec.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
      pointerNDC = pointerNDCVec;
    }
    function handlePointerLeave() {
      pointerNDC = null;
    }
    container.addEventListener("pointermove", updatePointerNDC);
    container.addEventListener("pointerleave", handlePointerLeave);

    const raycaster = new THREE.Raycaster();
    const depthPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const cursorWorld = new THREE.Vector3();
    const cursorLocal = new THREE.Vector3();

    function resize() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    }
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;

        gltf.scene.updateMatrixWorld(true);

        // Every mesh reduced to a world-space, non-indexed geometry keeping
        // only position + normal — mergeGeometries requires identical
        // attribute sets across all inputs, and a real multi-part GLB
        // (body/fins/bolts/shaft) won't reliably share uv sets, so uvs are
        // dropped. Normals are computed per-mesh first if missing, so every
        // part has one to merge.
        const preparedGeometries: THREE.BufferGeometry[] = [];
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            let source = child.geometry;
            if (!source.getAttribute("normal")) {
              source = source.clone();
              source.computeVertexNormals();
            }
            const nonIndexed = source.index ? source.toNonIndexed() : source;
            const stripped = new THREE.BufferGeometry();
            stripped.setAttribute("position", nonIndexed.getAttribute("position").clone());
            stripped.setAttribute("normal", nonIndexed.getAttribute("normal").clone());
            stripped.applyMatrix4(child.matrixWorld);
            preparedGeometries.push(stripped);
          }
        });
        if (preparedGeometries.length === 0) return;

        const merged = mergeGeometries(preparedGeometries, false);
        preparedGeometries.forEach((g) => g.dispose());
        if (!merged) return;

        merged.computeBoundingBox();
        const box = merged.boundingBox!;
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = TARGET_SIZE / maxDim;

        const samplerMaterial = new THREE.MeshBasicMaterial();
        const samplerMesh = new THREE.Mesh(merged, samplerMaterial);
        const sampler = new MeshSurfaceSampler(samplerMesh).build();

        const formed = new Float32Array(PARTICLE_COUNT * 3);
        const cube = new Float32Array(PARTICLE_COUNT * 3);
        const offsets = new Float32Array(PARTICLE_COUNT * 3);
        const p = new THREE.Vector3();
        const n = new THREE.Vector3();
        const toSurface = new THREE.Vector3();
        const dir = new THREE.Vector3();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let dot = -1;
          for (let attempt = 0; attempt < MAX_SAMPLE_ATTEMPTS; attempt++) {
            sampler.sample(p, n);
            toSurface.copy(p).sub(center);
            dot = n.dot(toSurface.normalize());
            if (dot > OUTWARD_DOT_THRESHOLD) break;
          }

          const x = (p.x - center.x) * scale;
          const y = (p.y - center.y) * scale;
          const z = (p.z - center.z) * scale;
          formed[i * 3] = x;
          formed[i * 3 + 1] = y;
          formed[i * 3 + 2] = z;

          // Both the hover-disperse offset AND the cube starting position
          // reuse this same per-particle direction vector — the cube is
          // just "every particle pushed out to this direction's own
          // intersection with the cube's surface," so the cube→motor morph
          // reads as particles converging radially into place rather than a
          // random reshuffle.
          dir.set(x, y, z);
          if (dir.lengthSq() < 1e-6) dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
          dir.normalize();

          // L∞ (Chebyshev) projection, not Euclidean — dividing by the
          // LARGEST absolute component (instead of normalizing to unit
          // length, which is what produces a sphere) scales `dir` out to
          // exactly where it crosses a cube's surface.
          const maxAbs = Math.max(Math.abs(dir.x), Math.abs(dir.y), Math.abs(dir.z)) || 1;
          const cubeScale = CUBE_HALF / maxAbs;
          cube[i * 3] = dir.x * cubeScale;
          cube[i * 3 + 1] = dir.y * cubeScale;
          cube[i * 3 + 2] = dir.z * cubeScale;

          const distance = DISPERSE_DISTANCE_MIN + Math.random() * (DISPERSE_DISTANCE_MAX - DISPERSE_DISTANCE_MIN);
          offsets[i * 3] = dir.x * distance;
          offsets[i * 3 + 1] = dir.y * distance;
          offsets[i * 3 + 2] = dir.z * distance;
        }

        merged.dispose();
        samplerMaterial.dispose();

        formedPositions = formed;
        cubePositions = cube;
        dispersedOffsets = offsets;
        livePositions = cube.slice();
        particleDisperse = new Float32Array(PARTICLE_COUNT);

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(livePositions, 3));

        const particleMaterial = new THREE.PointsMaterial({
          color: PARTICLE_COLOR,
          size: PARTICLE_SIZE,
          sizeAttenuation: true,
        });

        const points = new THREE.Points(particleGeometry, particleMaterial);
        points.rotation.y = Math.PI / 6;
        scene.add(points);
        particles = points;
      },
      undefined,
      (err) => {
        console.error("MotorModel: failed to load model", err);
      },
    );

    // Pause rendering while off-screen — cheap insurance, this canvas can
    // sit in a section that's scrolled far away for most of a session.
    let visible = false;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    let raf = 0;
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const formT = formProgressRef?.current ?? 1;

      if (particles) {
        particles.rotation.y += ROTATE_SPEED * 0.016;
        // Recompute immediately (rather than waiting for renderer.render()
        // to do it) — the cursor-to-local-space transform right below reads
        // this matrix in the same frame the rotation just changed.
        particles.updateMatrixWorld();
      }

      // Cursor position in the points object's own (rotating) local space —
      // computed once per frame, reused for every particle's distance test.
      // Hover-disperse only makes sense once the motor has actually formed —
      // gated below by formT so it can't fight the cube→motor morph.
      let haveCursor = false;
      if (particles && pointerNDC && formT > 0.98) {
        raycaster.setFromCamera(pointerNDC, camera);
        if (raycaster.ray.intersectPlane(depthPlane, cursorWorld)) {
          cursorLocal.copy(cursorWorld).applyMatrix4(particles.matrixWorld.clone().invert());
          haveCursor = true;
        }
      }

      if (particles && formedPositions && cubePositions && dispersedOffsets && livePositions && particleDisperse) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const idx = i * 3;
          const baseX = cubePositions[idx] + (formedPositions[idx] - cubePositions[idx]) * formT;
          const baseY = cubePositions[idx + 1] + (formedPositions[idx + 1] - cubePositions[idx + 1]) * formT;
          const baseZ = cubePositions[idx + 2] + (formedPositions[idx + 2] - cubePositions[idx + 2]) * formT;

          let target = 0;
          if (haveCursor) {
            const dx = formedPositions[idx] - cursorLocal.x;
            const dy = formedPositions[idx + 1] - cursorLocal.y;
            const dz = formedPositions[idx + 2] - cursorLocal.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < CURSOR_RADIUS) {
              target = 1 - dist / CURSOR_RADIUS;
            }
          }
          particleDisperse[i] += (target - particleDisperse[i]) * PARTICLE_DISPERSE_LERP;

          const t = particleDisperse[i];
          livePositions[idx] = baseX + dispersedOffsets[idx] * t;
          livePositions[idx + 1] = baseY + dispersedOffsets[idx + 1] * t;
          livePositions[idx + 2] = baseZ + dispersedOffsets[idx + 2] * t;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", updatePointerNDC);
      container.removeEventListener("pointerleave", handlePointerLeave);
      renderer.dispose();
      wrap.removeChild(renderer.domElement);
      if (particles) {
        particles.geometry.dispose();
        (particles.material as THREE.Material).dispose();
      }
    };
  }, [formProgressRef]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div ref={canvasWrapRef} className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
    </div>
  );
}
