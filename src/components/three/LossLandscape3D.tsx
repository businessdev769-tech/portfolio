"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const SIZE = 11;
const START = new THREE.Vector2(-3.8, -3.6);
const END = new THREE.Vector2(1.6, 1.2);
const PATH_POINTS = 240;
const BALL_RADIUS = 0.2;

/** The "loss" surface: a bowl with ripples, lowest near END. */
function loss(x: number, z: number) {
  return (
    0.05 * ((x - END.x) ** 2 + (z - END.y) ** 2) +
    0.3 * Math.sin(x * 1.1) * Math.cos(z * 0.9) +
    0.12 * Math.sin(z * 2 + x * 0.6)
  );
}

/** Gradient-descent-like path from START to END that wiggles less as it converges. */
function pathAt(t: number) {
  const dir = END.clone().sub(START);
  const normal = new THREE.Vector2(-dir.y, dir.x).normalize();
  const p = START.clone().add(dir.multiplyScalar(t)).add(normal.multiplyScalar(Math.sin(t * Math.PI * 2.2) * 0.9 * (1 - t)));
  return new THREE.Vector3(p.x, loss(p.x, p.y), p.y);
}

type Props = { stops: number[]; selected: number; started: boolean; active: boolean; reduced: boolean };

function Landscape({ stops, selected, started, reduced }: Omit<Props, "active">) {
  const group = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  const surface = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(SIZE, SIZE, 90, 90);
    geometry.rotateX(-Math.PI / 2);
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const low = new THREE.Color("#1d2050");
    const high = new THREE.Color("#2a2a36");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = loss(pos.getX(i), pos.getZ(i));
      pos.setY(i, y);
      c.copy(low).lerp(high, THREE.MathUtils.clamp(y / 2.2, 0, 1));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const pathGeometry = useMemo(() => {
    const points = Array.from({ length: PATH_POINTS }, (_, i) => pathAt(i / (PATH_POINTS - 1)).add(new THREE.Vector3(0, 0.05, 0)));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const lines = useMemo(() => {
    const dim = new THREE.Line(pathGeometry, new THREE.LineBasicMaterial({ color: "#ff5a1f", transparent: true, opacity: 0.25 }));
    const trail = new THREE.Line(pathGeometry.clone(), new THREE.LineBasicMaterial({ color: "#ff7a47" }));
    trail.geometry.setDrawRange(0, 1);
    return { dim, trail };
  }, [pathGeometry]);

  const markers = useMemo(() => stops.map((t) => pathAt(t)), [stops]);

  useEffect(
    () => () => {
      surface.dispose();
      pathGeometry.dispose();
      lines.trail.geometry.dispose();
    },
    [surface, pathGeometry, lines],
  );

  useFrame((state, delta) => {
    // Pull the camera back on narrow (phone) screens so the whole landscape fits.
    const aspect = state.size.width / state.size.height;
    const distance = aspect < 1 ? 19 : aspect < 1.4 ? 15 : 12.5;
    state.camera.position.lerp(new THREE.Vector3(0, distance * 0.62, distance * 0.82), 0.1);
    state.camera.lookAt(0, 0.3, 0);

    const target = started ? stops[selected] : 0;
    progress.current = reduced ? target : progress.current + (target - progress.current) * (1 - Math.exp(-delta * 1.6));
    const p = pathAt(progress.current);
    ball.current?.position.set(p.x, p.y + BALL_RADIUS, p.z);
    lines.trail.geometry.setDrawRange(0, Math.max(1, Math.round(progress.current * (PATH_POINTS - 1)) + 1));

    const g = group.current;
    if (g && !reduced) {
      const t = state.clock.elapsedTime;
      g.rotation.y += (-0.55 + Math.sin(t * 0.18) * 0.22 + state.pointer.x * 0.3 - g.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={group} rotation={[0, -0.55, 0]}>
      <mesh geometry={surface}>
        <meshStandardMaterial vertexColors roughness={0.85} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={surface} position={[0, 0.005, 0]}>
        <meshBasicMaterial color="#ff5a1f" wireframe transparent opacity={0.13} />
      </mesh>
      <primitive object={lines.dim} />
      <primitive object={lines.trail} />
      {markers.map((m, i) => (
        <group key={i} position={m}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
            <meshBasicMaterial color={i === selected ? "#ff5a1f" : "#a0a0ab"} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[i === selected ? 0.11 : 0.07, 16, 16]} />
            <meshBasicMaterial color={i === selected ? "#ff5a1f" : "#f3f3f5"} />
          </mesh>
        </group>
      ))}
      <mesh ref={ball}>
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ff5a1f" emissiveIntensity={0.9} />
        <pointLight color="#ff5a1f" intensity={8} distance={4} />
      </mesh>
    </group>
  );
}

export default function LossLandscape3D({ active, ...props }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 8, 10], fov: 40, near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 10, 6]} intensity={1.6} />
      <Landscape {...props} />
    </Canvas>
  );
}
