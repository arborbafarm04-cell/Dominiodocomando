import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useNavigate } from 'react-router-dom';

interface GiroAsfaltoObjectProps {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  raycaster: THREE.Raycaster;
  tileSize?: number;
  gridStartX?: number;
  gridStartZ?: number;
  onObjectLoaded?: (group: THREE.Group) => void;
  onBlockedTilesRegistered?: (tiles: Array<{ x: number; z: number }>) => void;
}

const GiroAsfaltoObject: React.FC<GiroAsfaltoObjectProps> = ({
  scene,
  camera,
  raycaster,
  tileSize = 1,
  gridStartX = -20,
  gridStartZ = -10,
  onObjectLoaded,
  onBlockedTilesRegistered,
}) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!scene) return;

    // ===== GIRO NO ASFALTO OBJECT CONFIGURATION =====
    // 8 tiles in 2x4 format (2 tiles wide, 4 tiles deep)
    const giroWidth = 2; // tiles
    const giroDepth = 4; // tiles
    const giroGridX = 10; // Starting grid position X
    const giroGridZ = 8; // Starting grid position Z

    // Calculate center position in world coordinates
    const giroCenterGridX = giroGridX + giroWidth / 2;
    const giroCenterGridZ = giroGridZ + giroDepth / 2;

    const giroWorldX = gridStartX + giroCenterGridX * tileSize;
    const giroWorldZ = gridStartZ + giroCenterGridZ * tileSize;

    // Calculate blocked tiles (8 tiles total)
    const blockedTiles: Array<{ x: number; z: number }> = [];
    for (let x = giroGridX; x < giroGridX + giroWidth; x++) {
      for (let z = giroGridZ; z < giroGridZ + giroDepth; z++) {
        blockedTiles.push({ x, z });
      }
    }

    // Notify parent about blocked tiles
    if (onBlockedTilesRegistered) {
      onBlockedTilesRegistered(blockedTiles);
    }

    console.log('Giro no Asfalto Position:', {
      gridX: giroGridX,
      gridZ: giroGridZ,
      worldX: giroWorldX,
      worldZ: giroWorldZ,
      gridSize: `${giroWidth}x${giroDepth}`,
      blockedTiles,
    });

    // ===== LOAD GIRO NO ASFALTO 3D MODEL =====
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_54abdb76d21c4aa0995035679f4f632b.glb',
      (gltf) => {
        const model = gltf.scene;

        // Create a group for the giro no asfalto object
        const giroGroup = new THREE.Group();

        // Position at center of platform
        giroGroup.position.set(giroWorldX, 0, giroWorldZ);

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale to fit exactly 8 tiles (2x4 format)
        // Target size is the larger dimension of the 2x4 grid
        const targetWidth = giroWidth * tileSize; // 2 units
        const targetDepth = giroDepth * tileSize; // 4 units
        const targetSize = Math.max(targetWidth, targetDepth); // 4 units
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

        // Center the model within the group
        bbox.setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Ensure model sits on the ground (y = 0)
        bbox.setFromObject(model);
        const bottomY = bbox.min.y;
        model.position.y -= bottomY; // Lift model so bottom is at y = 0

        // Apply shadow properties recursively to all children
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Apply emissive material for better visibility
            if (child.material instanceof THREE.Material) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissiveIntensity = 0.25;
                child.material.metalness = Math.max(0, child.material.metalness - 0.15);
                child.material.roughness = Math.min(1, child.material.roughness + 0.1);
              }
            }
          }
        });

        giroGroup.add(model);
        giroGroup.userData = { clickable: true, type: 'giro-no-asfalto' };
        scene.add(giroGroup);

        groupRef.current = giroGroup;

        if (onObjectLoaded) {
          onObjectLoaded(giroGroup);
        }

        console.log('Giro no Asfalto 3D model loaded successfully');
      },
      undefined,
      (error) => {
        console.warn('Failed to load Giro no Asfalto 3D model:', error);
      }
    );

    // ===== CLEANUP =====
    return () => {
      if (groupRef.current && scene.children.includes(groupRef.current)) {
        scene.remove(groupRef.current);
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [scene, camera, raycaster, tileSize, gridStartX, gridStartZ, onObjectLoaded, onBlockedTilesRegistered]);

  // ===== HANDLE CLICK DETECTION =====
  useEffect(() => {
    if (!groupRef.current) return;

    const onMouseClick = (event: MouseEvent) => {
      // Only process clicks on the canvas
      const canvas = (camera as any).domElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // Check if giro no asfalto was clicked
      const intersects = raycaster.intersectObject(groupRef.current!, true);

      if (intersects.length > 0) {
        console.log('Giro no Asfalto clicked!');
        navigate('/giro-no-asfalto');
      }
    };

    const canvas = (camera as any).domElement;
    if (canvas) {
      canvas.addEventListener('click', onMouseClick);

      return () => {
        canvas.removeEventListener('click', onMouseClick);
      };
    }
  }, [camera, raycaster, navigate]);

  // This component doesn't render anything in React
  return null;
};

export default GiroAsfaltoObject;
