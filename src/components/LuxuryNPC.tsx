import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface LuxuryNPCProps {
  onNPCLoaded?: () => void;
}

export default function LuxuryNPC({ onNPCLoaded }: LuxuryNPCProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const npcRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number>();
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup - fixed position
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer setup with optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.shadowMap.autoUpdate = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup - basic lighting for visibility
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Load GLB model
    const loader = new GLTFLoader();
    
    loader.load(
      'https://static.wixstatic.com/3d/50f4bf_55eda8581fc04c02a39a33c94b588afc.glb',
      (gltf) => {
        const npc = gltf.scene;
        // Position at center, slightly behind counter area
        npc.position.set(0, 0, 0.5);
        // Scale appropriately for full body visibility
        npc.scale.set(1.65, 1.65, 1.65);

        // Enable shadows on all meshes and optimize materials
        npc.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Optimize materials
            if (child.material) {
              child.material.side = THREE.FrontSide;
            }
          }
        });

        scene.add(npc);
        npcRef.current = npc;
        isLoadedRef.current = true;

        if (onNPCLoaded) {
          onNPCLoaded();
        }
      },
      undefined,
      (error) => {
        console.error('Error loading GLB model:', error);
      }
    );

    // Animation loop - static rendering only
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      isLoadedRef.current = false;
    };
  }, [onNPCLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
