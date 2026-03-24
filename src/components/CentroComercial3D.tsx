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

        // Calculate center position between tiles 40, 80, 120, 160
        // These tiles form a pattern, center should be at their midpoint
        // Tile 40: (40, 0), Tile 80: (80, 0), Tile 120: (40, 80), Tile 160: (80, 80)
        // Center: X = 60, Z = 40
        const centerX = 60;
        const centerZ = 40;
        
        group.position.set(centerX, 0, centerZ);

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const modelSize = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);

        // Scale to fit 4 tiles (2x2 format) - approximately 20 units in world space
        const targetSize = size * 2; // 20 units for 4 tiles
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

        // Rotate 180 degrees so the front faces inward (toward the center of the grid)
        model.rotation.y = Math.PI;

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
