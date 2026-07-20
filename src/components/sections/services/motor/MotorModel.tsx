"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { BRAND_600 } from "@/lib/palette";

// GLTFLoader fetches by URL at runtime, so the model must live in public/,
// the only directory Next.js serves as static files.
const MODEL_URL = "/models/electric_motor.glb";

// On-screen apparent size only depends on TARGET_SIZE/3.15 (the fixed
// frustum height), since camera FOV/distance are constant.
const TARGET_SIZE = 2.75;
const ROTATE_SPEED = 0.06;

// Half the side length of the loose cube particles start in. Each particle
// sits on the cube's surface via an L∞ (Chebyshev) projection of the same
// direction vector used for its formed position, so the cube→motor morph
// reads as particles converging radially rather than a random reshuffle.
const CUBE_HALF = 0.72;

// Mesh surfaces merged into one geometry and resampled into a point cloud
// (three.js MeshSurfaceSampler), rendered as opaque THREE.Points — no texture.
const PARTICLE_COUNT = 20000;
const PARTICLE_SIZE = 0.022;
const PARTICLE_COLOR = BRAND_600;

// Rejects samples whose face normal doesn't point outward from the model's
// center, so interior/backfacing surfaces don't end up in the cloud.
const OUTWARD_DOT_THRESHOLD = 0.05;
const MAX_SAMPLE_ATTEMPTS = 40;

const DISPERSE_DISTANCE_MIN = 0.6;
const DISPERSE_DISTANCE_MAX = 1.8;

// Particles within this radius of the cursor's 3D position disperse, with
// the amount falling off toward the radius edge.
const CURSOR_RADIUS = 1.1;
const PARTICLE_DISPERSE_LERP = 0.15;

export function MotorModel({
  formProgressRef, // 0 = loose cube, 1 = fully formed motor
}: {
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

    // null while the pointer isn't over the canvas, so the cloud relaxes back to formed.
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

        // Reduced to world-space, non-indexed, position+normal only — uvs
        // dropped since mergeGeometries needs identical attributes across
        // all parts and a multi-part GLB won't reliably share uv sets.
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

          // Same direction vector drives both the cube position and the
          // hover-disperse offset below.
          dir.set(x, y, z);
          if (dir.lengthSq() < 1e-6) dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
          dir.normalize();

          // Divide by the largest component (not normalize to unit length)
          // to project onto the cube's surface instead of a sphere's.
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

    // Pause rendering while off-screen.
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
        // Recomputed immediately since the cursor transform below reads
        // this matrix in the same frame the rotation just changed.
        particles.updateMatrixWorld();
      }

      // Gated by formT so hover-disperse can't fight the cube→motor morph.
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
