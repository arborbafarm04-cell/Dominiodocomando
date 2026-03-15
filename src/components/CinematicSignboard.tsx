import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CinematicSignboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const signboardRef = useRef<THREE.Group | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 100, 500);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 40);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Main spotlight for signboard
    const spotLight = new THREE.SpotLight(0xffd700, 2, 200, Math.PI / 3, 0.5, 2);
    spotLight.position.set(0, 30, 20);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    scene.add(spotLight);

    // Neon glow light
    const neonLight = new THREE.PointLight(0x00eaff, 1.5, 150);
    neonLight.position.set(0, 20, 0);
    scene.add(neonLight);

    // City lights in background
    const cityLights = new THREE.Group();
    for (let i = 0; i < 50; i++) {
      const light = new THREE.PointLight(0xffaa00, Math.random() * 0.8 + 0.2, 100);
      light.position.set(
        (Math.random() - 0.5) * 300,
        Math.random() * 50 + 10,
        Math.random() * -200 - 100
      );
      cityLights.add(light);
    }
    scene.add(cityLights);

    // Create signboard group
    const signboard = new THREE.Group();
    signboardRef.current = signboard;
    scene.add(signboard);

    // Create canvas texture for text
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Golden text with glow effect
      ctx.font = 'bold 180px "Arial Black", sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00eaff';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillText('COMPLEXO 1 DO COMANDO NORTE', canvas.width / 2, canvas.height / 2);

      // Add additional glow layers
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.shadowBlur = 60;
      ctx.fillText('COMPLEXO 1 DO COMANDO NORTE', canvas.width / 2, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    // Create signboard mesh
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: new THREE.Color(0xffd700),
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });

    const geometry = new THREE.PlaneGeometry(40, 10);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    signboard.add(mesh);

    // Add frame/border
    const frameGeometry = new THREE.BoxGeometry(42, 12, 0.5);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color(0xffd700),
      emissiveIntensity: 0.5,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.z = -0.3;
    frame.castShadow = true;
    frame.receiveShadow = true;
    signboard.add(frame);

    // Add particles for atmosphere
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positionArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positionArray[i] = (Math.random() - 0.5) * 100;
      positionArray[i + 1] = Math.random() * 80;
      positionArray[i + 2] = (Math.random() - 0.5) * 100 - 50;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00eaff,
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation variables
    let time = 0;
    const startTime = Date.now();
    const zoomDuration = 3000; // 3 seconds for zoom

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      time = Date.now() - startTime;

      // Zoom effect
      if (time < zoomDuration) {
        const progress = time / zoomDuration;
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        camera.position.z = 40 - easeProgress * 25;
        camera.position.y = 15 - easeProgress * 5;
      }

      // Signboard rotation and pulsing
      signboard.rotation.y = Math.sin(time * 0.0005) * 0.1;
      signboard.rotation.x = Math.cos(time * 0.0003) * 0.05;

      // Pulsing glow effect
      const pulse = Math.sin(time * 0.003) * 0.5 + 0.5;
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.emissiveIntensity = 0.6 + pulse * 0.4;
      }
      if (frame.material instanceof THREE.MeshStandardMaterial) {
        frame.material.emissiveIntensity = 0.3 + pulse * 0.3;
      }

      // Neon light pulsing
      neonLight.intensity = 1 + pulse * 0.5;

      // Particle animation
      const positionAttribute = particleGeometry.getAttribute('position');
      const positions = positionAttribute.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.1;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 80;
        }
      }
      positionAttribute.needsUpdate = true;

      // City lights flickering
      cityLights.children.forEach((light: any) => {
        light.intensity = Math.random() * 0.8 + 0.2;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      frameGeometry.dispose();
      frameMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: 'relative', overflow: 'hidden' }}
    />
  );
}
