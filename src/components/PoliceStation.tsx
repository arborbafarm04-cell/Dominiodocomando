import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';

interface PoliceStationProps {
  scene: THREE.Scene;
  gridTileSize: number;
  gridStartX: number;
  gridStartY: number;
  onTilesBlocked?: (tiles: Array<{ x: number; y: number }>) => void;
}

export default function PoliceStation({
  scene,
  gridTileSize,
  gridStartX,
  gridStartY,
  onTilesBlocked,
}: PoliceStationProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const navigate = useNavigate();
  const playerLevel = usePlayerStore((state) => state.level);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    // Create a group for the police station
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Police station occupies 8 tiles (2x4 configuration)
    // Position: center at grid coordinates (10, 10) for example
    const gridCenterX = 10;
    const gridCenterY = 10;
    const tilesWidth = 2; // 2 tiles wide
    const tilesDepth = 4; // 4 tiles deep

    // Calculate world position (center of the 8 tiles)
    const worldX = gridStartX + gridCenterX * gridTileSize;
    const worldY = gridStartY + gridCenterY * gridTileSize;

    // Mark tiles as blocked
    const blockedTiles: Array<{ x: number; y: number }> = [];
    const startTileX = gridCenterX - Math.floor(tilesWidth / 2);
    const startTileY = gridCenterY - Math.floor(tilesDepth / 2);

    for (let x = startTileX; x < startTileX + tilesWidth; x++) {
      for (let y = startTileY; y < startTileY + tilesDepth; y++) {
        blockedTiles.push({ x, y });
      }
    }

    if (onTilesBlocked) {
      onTilesBlocked(blockedTiles);
    }

    // Load the police station model
    const loader = new GLTFLoader();
    loader.load(
      'https://static.wixstatic.com/3d/50f4bf_55eda8581fc04c02a39a33c94b588afc.glb',
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Position the model at the center of the 8 tiles, Y=0
        model.position.set(worldX, 0, worldY);

        // Enable shadows
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        group.add(model);

        // Create a clickable bounding box for raycasting
        const boundingBox = new THREE.Box3().setFromObject(model);
        const size = boundingBox.getSize(new THREE.Vector3());
        const center = boundingBox.getCenter(new THREE.Vector3());

        // Create an invisible mesh for raycasting
        const clickGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const clickMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        });
        const clickMesh = new THREE.Mesh(clickGeometry, clickMaterial);
        clickMesh.position.copy(center);
        (clickMesh as any).isPoliceStation = true;
        (clickMesh as any).playerLevel = playerLevel;

        group.add(clickMesh);
      },
      undefined,
      (error) => {
        console.error('Error loading police station model:', error);
      }
    );

    return () => {
      scene.remove(group);
      if (groupRef.current) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [scene, gridTileSize, gridStartX, gridStartY, onTilesBlocked, playerLevel]);

  // Handle click detection
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!groupRef.current) return;

      // Get the renderer from the scene
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Get camera from scene (assuming it's stored somewhere accessible)
      // For now, we'll dispatch a custom event that the main scene handler can use
      const clickEvent = new CustomEvent('policeStationClick', {
        detail: {
          raycaster: raycasterRef.current,
          mouse: mouseRef.current,
          group: groupRef.current,
          playerLevel,
          navigate,
        },
      });
      window.dispatchEvent(clickEvent);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [playerLevel, navigate]);

  return null;
}
