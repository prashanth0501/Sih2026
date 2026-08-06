import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface SparkStoryCanvas3DProps {
  activeChapterIndex: number;
}

export function SparkStoryCanvas3D({ activeChapterIndex }: SparkStoryCanvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c0914, 0.012);

    // 2. Camera setup - set Z slightly further back for open perspective
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 22);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainPointLight = new THREE.PointLight(0xff7a1a, 3.5, 50);
    mainPointLight.position.set(0, 3, 5);
    scene.add(mainPointLight);

    const secondaryPointLight = new THREE.PointLight(0x4a3ab4, 2.5, 50);
    secondaryPointLight.position.set(10, 8, -5);
    scene.add(secondaryPointLight);

    const goldPointLight = new THREE.PointLight(0xffa92e, 2.5, 40);
    goldPointLight.position.set(-10, -6, 2);
    scene.add(goldPointLight);

    // 5. Main 3D Core Group - positioned slightly higher to form hero halo
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 2.5, 0);
    scene.add(coreGroup);

    // Central Glowing Core (Sphere)
    const coreGeometry = new THREE.IcosahedronGeometry(2.2, 4);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xff7a1a,
      emissive: 0xff5500,
      emissiveIntensity: 0.7,
      roughness: 0.25,
      metalness: 0.75,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(coreMesh);

    // Core Outer Wireframe Glow Shell
    const shellGeometry = new THREE.IcosahedronGeometry(2.8, 2);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa92e,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);
    coreGroup.add(shellMesh);

    // 6. Orbital Rings
    const ringGroup = new THREE.Group();
    coreGroup.add(ringGroup);

    const createRing = (radius: number, tube: number, color: number, rx: number, ry: number) => {
      const geom = new THREE.TorusGeometry(radius, tube, 16, 100);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.65,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = rx;
      mesh.rotation.y = ry;
      ringGroup.add(mesh);
      return mesh;
    };

    const ring1 = createRing(4.0, 0.035, 0xff7a1a, Math.PI / 3, Math.PI / 6);
    const ring2 = createRing(5.2, 0.028, 0x4a3ab4, Math.PI / 4, -Math.PI / 4);
    const ring3 = createRing(6.5, 0.022, 0xffa92e, -Math.PI / 6, Math.PI / 3);

    // 7. Particle Dust Field (pushed outward so text stays crisp & legible)
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xff7a1a),
      new THREE.Color(0xffa92e),
      new THREE.Color(0x4a3ab4),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < particleCount; i++) {
      // Scatter particles in wide sphere shell to keep center clear
      const radius = 10 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 8. Floating Outer Polyhedrons (pushed to margins)
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const nodeGeometries = [
      new THREE.OctahedronGeometry(0.5),
      new THREE.TetrahedronGeometry(0.6),
      new THREE.DodecahedronGeometry(0.45),
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 14; i++) {
      const geom = nodeGeometries[i % nodeGeometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xff7a1a : 0x4a3ab4,
        roughness: 0.35,
        metalness: 0.65,
        wireframe: i % 3 === 0,
      });
      const node = new THREE.Mesh(geom, mat);

      const radius = 12 + Math.random() * 12;
      const angle = (i / 14) * Math.PI * 2;
      node.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 14,
        Math.sin(angle) * radius
      );

      nodesGroup.add(node);
      nodeMeshes.push(node);
    }

    // 9. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 10. Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 11. Render Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Mouse Parallax
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      camera.position.x = mouseX * 2.0;
      camera.position.y = 1.5 - mouseY * 2.0;
      camera.lookAt(0, 1.5, 0);

      // Rotations
      coreMesh.rotation.y = elapsedTime * 0.22;
      coreMesh.rotation.x = elapsedTime * 0.14;

      shellMesh.rotation.y = -elapsedTime * 0.16;
      shellMesh.rotation.z = elapsedTime * 0.11;

      ringGroup.rotation.y = elapsedTime * 0.14;
      ring1.rotation.z = elapsedTime * 0.18;
      ring2.rotation.z = -elapsedTime * 0.14;
      ring3.rotation.x = elapsedTime * 0.22;

      particleSystem.rotation.y = elapsedTime * 0.025;
      particleSystem.rotation.x = elapsedTime * 0.012;

      nodeMeshes.forEach((node, idx) => {
        node.rotation.x = elapsedTime * (0.25 + (idx % 3) * 0.08);
        node.rotation.y = elapsedTime * (0.18 + (idx % 4) * 0.08);
        node.position.y += Math.sin(elapsedTime * 1.4 + idx) * 0.004;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Store references for GSAP chapter updates
    (container as any).__threeScene = {
      scene,
      camera,
      coreGroup,
      coreMesh,
      shellMesh,
      mainPointLight,
      secondaryPointLight,
      goldPointLight,
      ringGroup,
    };

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // GSAP animations triggered on chapter index change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const refs = (container as any).__threeScene;
    if (!refs) return;

    const { coreGroup, shellMesh, mainPointLight, ringGroup } = refs;

    // Elegant initial scale for chapter 0 so hero text is completely unblocked
    const chapterConfigs = [
      { scale: 0.6, lightColor: 0xff7a1a, ringScale: 0.75, posY: 2.8 },
      { scale: 0.9, lightColor: 0xffa92e, ringScale: 0.95, posY: 2.2 },
      { scale: 1.2, lightColor: 0x4a3ab4, ringScale: 1.15, posY: 1.6 },
      { scale: 1.5, lightColor: 0xff7a1a, ringScale: 1.35, posY: 1.0 },
      { scale: 1.8, lightColor: 0x9c90f2, ringScale: 1.55, posY: 0.4 },
      { scale: 2.1, lightColor: 0xff7a1a, ringScale: 1.75, posY: -0.2 },
      { scale: 2.4, lightColor: 0xffa92e, ringScale: 1.95, posY: -0.8 },
      { scale: 2.8, lightColor: 0xff3366, ringScale: 2.15, posY: -1.2 },
      { scale: 3.2, lightColor: 0xffd700, ringScale: 2.45, posY: -1.6 },
      { scale: 3.8, lightColor: 0xff7a1a, ringScale: 2.75, posY: -2.0 },
    ];

    const config = chapterConfigs[activeChapterIndex] || chapterConfigs[0];

    gsap.to(coreGroup.position, {
      y: config.posY,
      duration: 1.2,
      ease: 'power2.out',
    });

    gsap.to(coreGroup.scale, {
      x: config.scale,
      y: config.scale,
      z: config.scale,
      duration: 1.2,
      ease: 'power2.out',
    });

    gsap.to(shellMesh.scale, {
      x: config.scale * 1.15,
      y: config.scale * 1.15,
      z: config.scale * 1.15,
      duration: 1.2,
      ease: 'power2.out',
    });

    gsap.to(ringGroup.scale, {
      x: config.ringScale,
      y: config.ringScale,
      z: config.ringScale,
      duration: 1.2,
      ease: 'back.out(1.4)',
    });

    gsap.to(mainPointLight, {
      intensity: 2.5 + activeChapterIndex * 0.7,
      duration: 1.0,
    });

    gsap.to(mainPointLight.color, {
      r: new THREE.Color(config.lightColor).r,
      g: new THREE.Color(config.lightColor).g,
      b: new THREE.Color(config.lightColor).b,
      duration: 1.0,
    });
  }, [activeChapterIndex]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full opacity-85 transition-opacity duration-700"
    />
  );
}
