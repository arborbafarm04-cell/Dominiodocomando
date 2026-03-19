import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function ShowroomNPC() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const npcRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with luxury dark background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 50, 200);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3.5);
    camera.lookAt(0, 1.2, 0);

    // Renderer setup with enhanced settings for luxury lighting
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.3;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced luxury lighting setup
    // Main warm golden directional light
    const mainLight = new THREE.DirectionalLight(0xffd700, 2.2);
    mainLight.position.set(8, 12, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    scene.add(mainLight);

    // Spotlight 1 - Warm golden glow on NPC
    const spotlight1 = new THREE.SpotLight(0xffd700, 2.8);
    spotlight1.position.set(0, 6, 2);
    spotlight1.target.position.set(0, 1.2, 0);
    spotlight1.angle = Math.PI / 5;
    spotlight1.penumbra = 0.8;
    spotlight1.decay = 2;
    spotlight1.castShadow = true;
    scene.add(spotlight1);
    scene.add(spotlight1.target);

    // Spotlight 2 - Left side accent
    const spotlight2 = new THREE.SpotLight(0xffb347, 1.8);
    spotlight2.position.set(-6, 5, 1);
    spotlight2.target.position.set(-1, 1, 0);
    spotlight2.angle = Math.PI / 6;
    spotlight2.penumbra = 0.7;
    spotlight2.decay = 2;
    scene.add(spotlight2);
    scene.add(spotlight2.target);

    // Spotlight 3 - Right side accent
    const spotlight3 = new THREE.SpotLight(0xffb347, 1.8);
    spotlight3.position.set(6, 5, 1);
    spotlight3.target.position.set(1, 1, 0);
    spotlight3.angle = Math.PI / 6;
    spotlight3.penumbra = 0.7;
    spotlight3.decay = 2;
    scene.add(spotlight3);
    scene.add(spotlight3.target);

    // Accent lights - neon and pink for luxury contrast
    const neonLight = new THREE.PointLight(0x00eaff, 0.8);
    neonLight.position.set(-5, 4, 3);
    scene.add(neonLight);

    const pinkLight = new THREE.PointLight(0xff00ff, 0.6);
    pinkLight.position.set(5, 3, -2);
    scene.add(pinkLight);

    // Ambient light - reduced for high contrast luxury look
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    // Ground plane - polished reflective floor
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1f2e,
      metalness: 0.7,
      roughness: 0.15,
      envMapIntensity: 1.5,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Load GLB model with enhanced materials
    const loader = new GLTFLoader();
    loader.load(
      'https://static.wixstatic.com/3d/50f4bf_55eda8581fc04c02a39a33c94b588afc.glb',
      (gltf: any) => {
        const model = gltf.scene;
        npcRef.current = model;

        // Position NPC centered, standing on floor
        model.position.set(0, 0, 0);
        model.scale.set(1.2, 1.2, 1.2);

        // Ensure NPC faces forward
        model.rotation.y = 0;

        // Setup shadows and enhance materials for luxury glow
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Enhance material for luxury glow effect
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) => {
                  if (mat.metalness !== undefined) {
                    mat.metalness = Math.max(mat.metalness, 0.3);
                    mat.roughness = Math.min(mat.roughness, 0.6);
                  }
                });
              } else {
                if (child.material.metalness !== undefined) {
                  child.material.metalness = Math.max(child.material.metalness, 0.3);
                  child.material.roughness = Math.min(child.material.roughness, 0.6);
                }
              }
            }
          }
        });

        scene.add(model);
      },
      undefined,
      (error: any) => {
        console.error('Error loading NPC model:', error);
      }
    );

    // Animation loop with breathing and lighting effects
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.016; // ~60fps

      // Subtle breathing animation (vertical movement)
      if (npcRef.current) {
        const breathingAmount = 0.1;
        const breathingSpeed = 1.2;
        npcRef.current.position.y = Math.sin(time * breathingSpeed) * breathingAmount;

        // Gentle rotation for dynamic presentation
        npcRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
      }

      // Pulsing spotlight effects for luxury atmosphere
      spotlight1.intensity = 2.8 + Math.sin(time * 0.002) * 0.6;
      spotlight2.intensity = 1.8 + Math.cos(time * 0.0025) * 0.4;
      spotlight3.intensity = 1.8 + Math.sin(time * 0.0027) * 0.4;

      // Pulsing accent lights
      neonLight.intensity = 0.8 + Math.sin(time * 0.003) * 0.3;
      pinkLight.intensity = 0.6 + Math.cos(time * 0.0035) * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
