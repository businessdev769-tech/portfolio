"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const LOW = new THREE.Color("#c9cfff");
const HIGH = new THREE.Color("#2b3bff");
const MASKED = new THREE.Color("#ececf0");
const WAITING = new THREE.Color("#dcdde3");

type Props = { matrix: number[][]; count: number; active: boolean; reduced: boolean };

function Bars({ matrix, count, reduced }: Omit<Props, "active">) {
  const n = matrix.length;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const heights = useRef(new Float32Array(n * n).fill(0.02));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    // Fit the grid to the canvas.
    const zoom = Math.min(state.size.width, state.size.height) / (n * 1.35);
    if (Math.abs(state.camera.zoom - zoom) > 0.01) {
      state.camera.zoom = zoom;
      state.camera.lookAt(0, 0.7, 0); // aim at the middle of the bars, not the floor
      state.camera.updateProjectionMatrix();
    }

    const m = mesh.current;
    if (!m) return;
    const ease = reduced ? 1 : 1 - Math.exp(-delta * 7);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const idx = i * n + j;
        const masked = j > i;
        const lit = !masked && i < count;
        const w = matrix[i][j];
        const target = masked ? 0.02 : lit ? 0.12 + w * 2.4 : 0.06;
        const h = (heights.current[idx] += (target - heights.current[idx]) * ease);
        dummy.position.set(j - (n - 1) / 2, h / 2, i - (n - 1) / 2);
        dummy.scale.set(0.78, h, 0.78);
        dummy.updateMatrix();
        m.setMatrixAt(idx, dummy.matrix);
        m.setColorAt(idx, masked ? MASKED : lit ? color.copy(LOW).lerp(HIGH, w) : WAITING);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    const g = group.current;
    if (g && !reduced) {
      const t = state.clock.elapsedTime;
      g.rotation.y += (Math.sin(t * 0.35) * 0.14 + state.pointer.x * 0.4 - g.rotation.y) * 0.06;
      g.rotation.x += (-state.pointer.y * 0.12 - g.rotation.x) * 0.06;
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, n * n]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.45} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}

export default function AttentionMatrix3D({ matrix, count, active, reduced }: Props) {
  return (
    <Canvas
      orthographic
      camera={{ position: [10, 11, 12], zoom: 20, near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.7} />
      <directionalLight position={[6, 12, 4]} intensity={2.4} />
      <directionalLight position={[-6, 4, -2]} intensity={0.6} />
      <Bars matrix={matrix} count={count} reduced={reduced} />
    </Canvas>
  );
}
