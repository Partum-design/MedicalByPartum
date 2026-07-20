"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Fondo 3D del hero: esferas de cristal flotando + una red de partículas que
// sugiere datos/telemedicina. Decorativo y con parallax sutil al mouse;
// se detiene si la pestaña no está visible o el usuario prefiere menos movimiento.
export function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Luces: cálidas + frías para que el cristal tenga vida sobre el degradado.
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.PointLight(0x22d3ee, 3, 30);
    key.position.set(6, 5, 8);
    scene.add(key);
    const fill = new THREE.PointLight(0x3b82f6, 2, 30);
    fill.position.set(-6, -4, 6);
    scene.add(fill);

    // Esferas de cristal flotando (icosaedros suaves).
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);
    const orbConfigs = [
      { r: 1.6, color: 0xffffff, x: 3.2, y: 1.4, z: -1, opacity: 0.5 },
      { r: 1.05, color: 0x22d3ee, x: -3.4, y: -1.2, z: 1, opacity: 0.55 },
      { r: 0.7, color: 0x60a5fa, x: -1.6, y: 2.1, z: 2, opacity: 0.6 },
      { r: 0.5, color: 0xffffff, x: 2.2, y: -2.2, z: 1.5, opacity: 0.45 },
    ];
    const orbs = orbConfigs.map((cfg) => {
      const geo = new THREE.IcosahedronGeometry(cfg.r, 2);
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
        roughness: 0.15,
        metalness: 0.05,
        transmission: 0.5,
        thickness: 1.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      orbGroup.add(mesh);
      return mesh;
    });

    // Red de partículas: puntos + líneas ocasionales, estilo "datos de salud".
    const PARTICLES = 90;
    const positions = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0xbfe8f5,
      transparent: true,
      opacity: 0.12,
    });
    const lineSegments: THREE.Line[] = [];
    for (let i = 0; i < 22; i++) {
      const a = Math.floor(Math.random() * PARTICLES);
      const b = Math.floor(Math.random() * PARTICLES);
      const pts = [
        new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]),
        new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, lineMat);
      scene.add(line);
      lineSegments.push(line);
    }

    let mouseX = 0;
    let mouseY = 0;
    function onPointerMove(e: PointerEvent) {
      const rect = mount!.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
    // Listener en window (no en el canvas) para no interferir con los clics
    // de los elementos que se dibujan encima del fondo 3D.
    window.addEventListener("pointermove", onPointerMove);

    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();

    function tick() {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      orbs.forEach((mesh, i) => {
        mesh.rotation.x = t * 0.08 + i;
        mesh.rotation.y = t * 0.12 + i;
        mesh.position.y += Math.sin(t * 0.5 + i * 2) * 0.0008;
      });
      particles.rotation.y = t * 0.02;

      if (!prefersReducedMotion) {
        camera.position.x += (mouseX * 1.1 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.7 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    }

    function onVisibility() {
      running = document.visibilityState === "visible";
      if (running) tick();
      else cancelAnimationFrame(raf);
    }
    document.addEventListener("visibilitychange", onVisibility);

    function onResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener("resize", onResize);

    tick();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      lineSegments.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      particleGeo.dispose();
      particleMat.dispose();
      orbs.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}
