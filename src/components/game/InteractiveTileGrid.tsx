import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface TileData {
  id: number;
  x: number;
  z: number;
  isSelected: boolean;
}

interface InteractiveTileGridProps {
  onTileSelect?: (tileId: number, position: { x: number; z: number }) => void;
  gridSize?: number;
  tileSize?: number;
}

const InteractiveTileGrid: React.FC<InteractiveTileGridProps> = ({
  onTileSelect,
  gridSize = 28,
  tileSize = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tilesRef = useRef<Map<number, TileData>>(new Map());
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const selectedTileRef = useRef<number | null>(null);
  const highlightMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ===== SCENE SETUP =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // ===== CAMERA SETUP =====
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    
    // Position camera to view the entire grid
    const gridTotalSize = gridSize * tileSize;
    camera.position.set(gridTotalSize / 2, gridTotalSize * 0.8, gridTotalSize / 2);
    camera.lookAt(gridTotalSize / 2, 0, gridTotalSize / 2);
    cameraRef.current = camera;

    // ===== RENDERER SETUP =====
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // ===== LIGHTING =====
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(gridTotalSize / 2, gridTotalSize, gridTotalSize / 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -gridTotalSize / 2;
    directionalLight.shadow.camera.right = gridTotalSize / 2;
    directionalLight.shadow.camera.top = gridTotalSize / 2;
    directionalLight.shadow.camera.bottom = -gridTotalSize / 2;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = gridTotalSize * 2;
    scene.add(directionalLight);

    // ===== CREATE TILE GRID =====
    const totalTiles = gridSize * gridSize;
    // Create 3D box geometry instead of flat plane for true 3D appearance
    const geometry = new THREE.BoxGeometry(tileSize * 0.95, tileSize * 0.3, tileSize * 0.95);
    
    // Base material - urban concrete/asphalt style
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      metalness: 0.3,
      roughness: 0.8,
      side: THREE.FrontSide,
    });

    // Highlight material for selected tiles
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x00eaff,
      metalness: 0.5,
      roughness: 0.4,
      emissive: 0x00eaff,
      emissiveIntensity: 0.5,
    });
    highlightMaterialRef.current = highlightMaterial;

    // Create instanced mesh
    const instancedMesh = new THREE.InstancedMesh(geometry, baseMaterial, totalTiles);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMeshRef.current = instancedMesh;

    // Position all tiles
    const dummy = new THREE.Object3D();
    const startX = -(gridSize * tileSize) / 2;
    const startZ = -(gridSize * tileSize) / 2;

    let tileIndex = 0;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = startX + col * tileSize + tileSize / 2;
        const z = startZ + row * tileSize + tileSize / 2;
        const y = tileSize * 0.15; // Position box so bottom sits at y=0

        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(tileIndex, dummy.matrix);

        // Store tile data
        tilesRef.current.set(tileIndex, {
          id: tileIndex,
          x,
          z,
          isSelected: false,
        });

        tileIndex++;
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);

    // ===== ADD GROUND PLANE =====
    const groundGeometry = new THREE.PlaneGeometry(gridSize * tileSize * 1.2, gridSize * tileSize * 1.2);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.2,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // ===== ADD SUBTLE GRID LINES (optional visual aid) =====
    const gridLinesGeometry = new THREE.BufferGeometry();
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x555555, linewidth: 1 });
    const gridLinesPoints: number[] = [];

    // Vertical lines
    for (let i = 0; i <= gridSize; i++) {
      const pos = startX + i * tileSize;
      gridLinesPoints.push(pos, 0.05, startZ);
      gridLinesPoints.push(pos, 0.05, startZ + gridSize * tileSize);
    }

    // Horizontal lines
    for (let i = 0; i <= gridSize; i++) {
      const pos = startZ + i * tileSize;
      gridLinesPoints.push(startX, 0.05, pos);
      gridLinesPoints.push(startX + gridSize * tileSize, 0.05, pos);
    }

    gridLinesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridLinesPoints), 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    scene.add(gridLines);

    // ===== MOUSE INTERACTION =====
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    const onMouseClick = (event: MouseEvent) => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const intersects = raycasterRef.current.intersectObject(instancedMesh);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const instanceId = intersection.instanceId;

        if (instanceId !== undefined) {
          // Deselect previous tile
          if (selectedTileRef.current !== null && selectedTileRef.current !== instanceId) {
            instancedMesh.setColorAt(selectedTileRef.current, new THREE.Color(0x4a4a4a));
          }

          // Select new tile
          selectedTileRef.current = instanceId;
          instancedMesh.setColorAt(instanceId, new THREE.Color(0x00eaff));
          instancedMesh.instanceColor!.needsUpdate = true;

          const tileData = tilesRef.current.get(instanceId);
          if (tileData && onTileSelect) {
            onTileSelect(instanceId, { x: tileData.x, z: tileData.z });
          }
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);

    // ===== CAMERA CONTROLS (simple orbit) =====
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUpOrLeave = () => {
      isDragging = false;
    };

    const onMouseMoveCamera = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      const radius = camera.position.length();
      const theta = Math.atan2(camera.position.z, camera.position.x);
      const phi = Math.acos(camera.position.y / radius);

      const newTheta = theta - deltaX * 0.01;
      const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi + deltaY * 0.01));

      camera.position.x = radius * Math.sin(newPhi) * Math.cos(newTheta);
      camera.position.y = radius * Math.cos(newPhi);
      camera.position.z = radius * Math.sin(newPhi) * Math.sin(newTheta);

      camera.lookAt(gridTotalSize / 2, 0, gridTotalSize / 2);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 1.1;
      const direction = e.deltaY > 0 ? zoomSpeed : 1 / zoomSpeed;
      const newPosition = camera.position.multiplyScalar(direction);
      
      // Clamp zoom
      const maxDistance = gridTotalSize * 2;
      const minDistance = gridTotalSize * 0.3;
      const distance = newPosition.length();
      
      if (distance <= maxDistance && distance >= minDistance) {
        camera.position.copy(newPosition);
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUpOrLeave);
    renderer.domElement.addEventListener('mouseleave', onMouseUpOrLeave);
    renderer.domElement.addEventListener('mousemove', onMouseMoveCamera);
    renderer.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

    // ===== ANIMATION LOOP =====
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // ===== HANDLE WINDOW RESIZE =====
    const onWindowResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', onWindowResize);

    // ===== CLEANUP =====
    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUpOrLeave);
      renderer.domElement.removeEventListener('mouseleave', onMouseUpOrLeave);
      renderer.domElement.removeEventListener('mousemove', onMouseMoveCamera);
      renderer.domElement.removeEventListener('wheel', onMouseWheel);
      
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      baseMaterial.dispose();
      highlightMaterial.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      gridLinesGeometry.dispose();
      gridLinesMaterial.dispose();
      instancedMesh.dispose();
      renderer.dispose();
    };
  }, [gridSize, tileSize, onTileSelect]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
};

export default InteractiveTileGrid;
