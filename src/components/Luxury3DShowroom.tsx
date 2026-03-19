import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Luxury3DShowroom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 100, 1000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    // Main light
    const mainLight = new THREE.DirectionalLight(0xff6600, 1.5);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    scene.add(mainLight);

    // Neon blue accent light
    const neonLight = new THREE.PointLight(0x00eaff, 1.2);
    neonLight.position.set(-8, 5, 5);
    scene.add(neonLight);

    // Neon pink accent light
    const pinkLight = new THREE.PointLight(0xff00ff, 0.8);
    pinkLight.position.set(8, 3, -5);
    scene.add(pinkLight);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1f2e,
      metalness: 0.3,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create car group
    const carGroup = new THREE.Group();
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // Create luxury car (simplified geometric car)
    const createLuxuryCar = (xOffset: number, color: number) => {
      const carGroup = new THREE.Group();

      // Car body
      const bodyGeometry = new THREE.BoxGeometry(2, 1.2, 4.5);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.9,
        roughness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.6;
      body.castShadow = true;
      body.receiveShadow = true;
      carGroup.add(body);

      // Car roof
      const roofGeometry = new THREE.BoxGeometry(1.8, 0.8, 2.5);
      const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
      roof.position.set(0, 1.5, -0.3);
      roof.castShadow = true;
      roof.receiveShadow = true;
      carGroup.add(roof);

      // Wheels
      const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
      const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.6,
        roughness: 0.4,
      });

      const wheelPositions = [
        [-0.8, 0.5, 1],
        [0.8, 0.5, 1],
        [-0.8, 0.5, -1.2],
        [0.8, 0.5, -1.2],
      ];

      wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(pos[0], pos[1], pos[2]);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        carGroup.add(wheel);
      });

      // Headlights (neon glow)
      const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0x00eaff,
        emissive: 0x00eaff,
        emissiveIntensity: 1,
      });

      const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
      leftHeadlight.position.set(-0.6, 0.8, 2.3);
      carGroup.add(leftHeadlight);

      const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
      rightHeadlight.position.set(0.6, 0.8, 2.3);
      carGroup.add(rightHeadlight);

      carGroup.position.x = xOffset;
      return carGroup;
    };

    // Add multiple cars
    const car1 = createLuxuryCar(-6, 0xff4500);
    carGroup.add(car1);

    const car2 = createLuxuryCar(0, 0xffd700);
    carGroup.add(car2);

    const car3 = createLuxuryCar(6, 0xff00ff);
    carGroup.add(car3);

    // Add decorative pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2f3e,
      metalness: 0.4,
      roughness: 0.6,
    });

    const pillarPositions = [
      [-10, 0, -10],
      [10, 0, -10],
      [-10, 0, 10],
      [10, 0, 10],
    ];

    pillarPositions.forEach((pos) => {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(pos[0], pos[1], pos[2]);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);
    });

    setIsLoading(false);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      targetRotationY = mouseX * 0.5;
      targetRotationX = mouseY * 0.3;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Handle window resize
    const onWindowResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onWindowResize);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth rotation
      if (carGroup) {
        carGroup.rotation.y += (targetRotationY - carGroup.rotation.y) * 0.05;
        carGroup.rotation.x += (targetRotationX - carGroup.rotation.x) * 0.05;

        // Gentle floating animation
        carGroup.position.y = Math.sin(Date.now() * 0.0005) * 0.3;
      }

      // Rotate individual cars
      car1.rotation.y += 0.003;
      car2.rotation.y -= 0.002;
      car3.rotation.y += 0.0025;

      // Animate lights
      if (neonLight) {
        neonLight.intensity = 1.2 + Math.sin(Date.now() * 0.003) * 0.3;
      }
      if (pinkLight) {
        pinkLight.intensity = 0.8 + Math.cos(Date.now() * 0.004) * 0.2;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-xl font-heading">Carregando showroom 3D...</div>
        </div>
      )}
    </div>
  );
}
