"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function PulseObject() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.16;
    group.current.rotation.z = Math.sin(t * 0.5) * 0.08;
    group.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.025);
  });

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.018, 12, 96]} />
        <meshBasicMaterial color="#80EE98" transparent opacity={0.82} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.6, 0]}>
        <torusGeometry args={[1.32, 0.012, 12, 96]} />
        <meshBasicMaterial color="#09D1C7" transparent opacity={0.4} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.62, 2]} />
        <meshStandardMaterial
          color="#15919B"
          emissive="#46DFB1"
          emissiveIntensity={0.75}
          roughness={0.3}
          metalness={0.45}
          wireframe
          transparent
          opacity={0.78}
        />
      </mesh>
      <pointLight color="#80EE98" intensity={2} distance={4} />
    </group>
  );
}

// Decoración 3D sin OrbitControls: no captura el gesto del usuario y no hace scroll-jacking.
export function ThreePulse() {
  return (
    <div className="three-pulse pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.8], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.35} />
        <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.35}>
          <PulseObject />
        </Float>
      </Canvas>
    </div>
  );
}
