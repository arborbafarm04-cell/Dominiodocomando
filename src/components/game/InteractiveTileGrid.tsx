import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface TileData {
  id: number;
  x: number;
  z: number;
  isSelected: boolean;
}

interface InteractiveTileGridProps {
  onTileSelect?: (tileId: number, position: { x: number; z: number }) => void;
  gridWidth?: number;
  gridHeight?: number;
  tileSize?: number;
}

const InteractiveTileGrid: React.FC<InteractiveTileGridProps> = ({
  onTileSelect,
  gridWidth = 40,
  gridHeight = 20,
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
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ===== SCENE SETUP =====
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background to show page background
    scene.fog = new THREE.Fog(0x000000, 100, 200);
    sceneRef.current = scene;

    // ===== CAMERA SETUP =====
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    
    // Position camera to view the entire grid
    const gridTotalWidth = gridWidth * tileSize;
    const gridTotalHeight = gridHeight * tileSize;
    const maxDim = Math.max(gridTotalWidth, gridTotalHeight);
    camera.position.set(gridTotalWidth / 2, maxDim * 0.6, gridTotalHeight * 0.8);
    camera.lookAt(gridTotalWidth / 2, 0, gridTotalHeight / 2);
    cameraRef.current = camera;

    // ===== RENDERER SETUP =====
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // ===== LIGHTING =====
    // Ambient light with warm tone matching São Paulo aesthetic
    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.8);
    scene.add(ambientLight);

    // Point light for additional illumination
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(gridTotalWidth / 2, maxDim * 1.2, gridTotalHeight / 2);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // ===== CREATE TILE GRID (40x20 = 800 tiles) =====
    const totalTiles = gridWidth * gridHeight;
    
    // Create 3D box geometry for tiles
    const geometry = new THREE.BoxGeometry(tileSize * 0.9, tileSize * 0.05, tileSize * 0.9);
    
    // Base material - urban concrete/asphalt style with dark gray
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      metalness: 0.8,
      roughness: 0.1,
      side: THREE.FrontSide,
      emissive: 0x003333,
      emissiveIntensity: 0.2,
    });

    // Create instanced mesh for performance
    const instancedMesh = new THREE.InstancedMesh(geometry, baseMaterial, totalTiles);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMeshRef.current = instancedMesh;

    // Position all tiles
    const dummy = new THREE.Object3D();
    const startX = -(gridTotalWidth) / 2;
    const startZ = -(gridTotalHeight) / 2;

    let tileIndex = 0;
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const x = startX + col * tileSize + tileSize / 2;
        const z = startZ + row * tileSize + tileSize / 2;
        const y = tileSize * 0.025; // Position box so bottom sits at y=0

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
    const groundGeometry = new THREE.PlaneGeometry(gridTotalWidth * 1.3, gridTotalHeight * 1.3);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.3,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // ===== ADD SUBTLE GRID LINES =====
    const gridLinesGeometry = new THREE.BufferGeometry();
    const gridLinesMaterial = new THREE.LineBasicMaterial({ color: 0x00eaff, linewidth: 1, transparent: true, opacity: 0.3 });
    const gridLinesPoints: number[] = [];

    // Vertical lines
    for (let i = 0; i <= gridWidth; i++) {
      const pos = startX + i * tileSize;
      gridLinesPoints.push(pos, 0.02, startZ);
      gridLinesPoints.push(pos, 0.02, startZ + gridTotalHeight);
    }

    // Horizontal lines
    for (let i = 0; i <= gridHeight; i++) {
      const pos = startZ + i * tileSize;
      gridLinesPoints.push(startX, 0.02, pos);
      gridLinesPoints.push(startX + gridTotalWidth, 0.02, pos);
    }

    gridLinesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridLinesPoints), 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    scene.add(gridLines);

    // ===== LOAD OPTIONAL 3D MODEL =====
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_d6b5b42919df42f5a18545627953b239.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(2, 2, 2);
        model.position.set(gridTotalWidth / 2, 0, gridTotalHeight / 2);
        model.castShadow = true;
        model.receiveShadow = true;
        scene.add(model);
      },
      undefined,
      (error) => {
        console.warn('Failed to load 3D model:', error);
      }
    );

    // ===== ORBIT CONTROLS =====
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = maxDim * 0.3;
    controls.maxDistance = maxDim * 2;
    controls.target.set(gridTotalWidth / 2, 0, gridTotalHeight / 2);
    controls.update();
    controlsRef.current = controls;

    // ===== MOUSE INTERACTION FOR TILE SELECTION =====
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
            instancedMesh.setColorAt(selectedTileRef.current, new THREE.Color(0x3a3a3a));
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

    // ===== ANIMATION LOOP =====
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
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
      
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      baseMaterial.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      gridLinesGeometry.dispose();
      gridLinesMaterial.dispose();
      instancedMesh.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, [gridWidth, gridHeight, tileSize, onTileSelect]);

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
