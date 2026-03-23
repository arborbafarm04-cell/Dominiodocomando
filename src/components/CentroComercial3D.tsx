import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface CentroComercial3DProps {
  scene: THREE.Scene;
  position: { x: number; z: number };
  size: number;
  onClickCallback?: () => void;
  raycaster: THREE.Raycaster;
  camera: THREE.PerspectiveCamera;
}

export const CentroComercial3D = ({
  scene,
  position,
  size,
  onClickCallback,
  raycaster,
  camera,
}: CentroComercial3DProps) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const originalScaleRef = useRef<number>(1);

  useEffect(() => {
    const gltfLoader = new GLTFLoader();

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_8b894931f3c241f285c4292c4842c4f0.glb',
      (gltf) => {
        const model = gltf.scene;

        // Create a group for the centro comercial
        const group = new THREE.Group();

        // Position at center of platform
        group.position.set(position.x, 0, position.z);

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const modelSize = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);

        // Scale to fit exactly 8 tiles (2x4 or 4x2 format)
        const targetSize = size * 1; // 8 units in world space
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);
        originalScaleRef.current = scale;

        // Center the model within the group
        bbox.setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Ensure model sits on the ground (y = 0)
        bbox.setFromObject(model);
        const bottomY = bbox.min.y;
        model.position.y -= bottomY;

        // Apply shadow properties recursively to all children
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material instanceof THREE.Material) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissiveIntensity = 0.3;
                child.material.metalness = Math.max(0, child.material.metalness - 0.2);
                child.material.roughness = Math.min(1, child.material.roughness + 0.1);
              }
            }
          }
        });

        group.add(model);
        group.userData = { clickable: true, type: 'centro-comercial' };
        scene.add(group);

        groupRef.current = group;
        setIsLoaded(true);
      },
      undefined,
      (error) => {
        console.warn('Failed to load Centro Comercial 3D model:', error);
      }
    );

    return () => {
      if (groupRef.current && scene) {
        scene.remove(groupRef.current);
      }
    };
  }, [scene, position, size]);

  // Handle hover and click interactions
  useEffect(() => {
    if (!isLoaded || !groupRef.current) return;

    const onMouseMove = (event: MouseEvent) => {
      const canvas = (camera as any).domElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (groupRef.current) {
        const intersects = raycaster.intersectObject(groupRef.current, true);
        if (intersects.length > 0) {
          if (!isHovered) {
            setIsHovered(true);
            // Scale up on hover
            groupRef.current.scale.set(1.05, 1.05, 1.05);
          }
        } else {
          if (isHovered) {
            setIsHovered(false);
            // Scale back to normal
            groupRef.current.scale.set(1, 1, 1);
          }
        }
      }
    };

    const onMouseClick = (event: MouseEvent) => {
      const canvas = (camera as any).domElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (groupRef.current) {
        const intersects = raycaster.intersectObject(groupRef.current, true);
        if (intersects.length > 0) {
          // Click animation: scale down then back up
          if (groupRef.current.scale.x === 1.05) {
            groupRef.current.scale.set(0.95, 0.95, 0.95);
            setTimeout(() => {
              if (groupRef.current) {
                groupRef.current.scale.set(1.05, 1.05, 1.05);
              }
            }, 100);
          }

          if (onClickCallback) {
            onClickCallback();
          }
        }
      }
    };

    const canvas = (camera as any).domElement;
    if (canvas) {
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('click', onMouseClick);

      return () => {
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('click', onMouseClick);
      };
    }
  }, [isLoaded, isHovered, raycaster, camera, onClickCallback]);

  return null; // This component doesn't render anything to the DOM
};

export default CentroComercial3D;
