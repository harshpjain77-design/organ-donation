import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDOrganCanvas({ title, subtitle, badgeText = "3D AI Match Matrix", height = "320px" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const h = currentMount.clientHeight || parseInt(height, 10) || 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / h, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Icosahedron Wireframe Core (Bio Network Node)
    const coreGeo = new THREE.IcosahedronGeometry(6, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // 2. Inner Glowing Sphere
    const innerGeo = new THREE.IcosahedronGeometry(4, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 3. Floating Particles / Organ Data Points
    const particleCount = 120;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x06b6d4);
    const emeraldColor = new THREE.Color(0x10b981);
    const indigoColor = new THREE.Color(0x818cf8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 6 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color selection
      const rand = Math.random();
      const c = rand > 0.6 ? cyanColor : rand > 0.3 ? emeraldColor : indigoColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    mainGroup.add(particleSystem);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((event.clientY - rect.top) / h - 0.5) * 2;
    };

    currentMount.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight || parseInt(height, 10) || 320;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse easing
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotations
      coreMesh.rotation.y += 0.003;
      coreMesh.rotation.x += 0.001;

      innerMesh.rotation.y -= 0.005;
      innerMesh.rotation.z += 0.002;

      particleSystem.rotation.y += 0.002;

      mainGroup.rotation.y = targetX * 0.5;
      mainGroup.rotation.x = -targetY * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      currentMount.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl p-6 mb-8 group">
      {/* Background Mesh/Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-indigo-950/30 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={mountRef} 
        style={{ height }} 
        className="w-full relative z-10 cursor-grab active:cursor-grabbing"
      />

      {/* Overlay Title / Badges */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none max-w-xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 backdrop-blur-md mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          {badgeText}
        </span>
        {title && <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{title}</h2>}
        {subtitle && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
      </div>

      <div className="absolute bottom-4 right-6 z-20 pointer-events-none text-right">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
          WebGL Interactive Matrix Node • Drag to Orbit
        </span>
      </div>
    </div>
  );
}
