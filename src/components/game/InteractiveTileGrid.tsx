import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';
import { AAA3DVisualSystem } from '@/systems/AAA3DVisualSystem';

interface TileData {
  id: number;
  x: number;
  z: number;
  isSelected: boolean;
}

interface LuxuryStoreData {
  position: { x: number; z: number };
  gridX: number;
  gridZ: number;
  size: number; // 4x4 tiles
  model: THREE.Group | null;
  isClickable: boolean;
}

interface QGData {
  position: { x: number; z: number };
  gridX: number;
  gridZ: number;
  size: number; // 4x4 tiles
  model: THREE.Group | null;
  isClickable: boolean;
}

interface CustomObjectData {
  position: { x: number; z: number };
  gridX: number;
  gridZ: number;
  size: number;
  model: THREE.Group | null;
  isClickable: boolean;
  modelUrl: string;
  onClickCallback?: () => void;
}

interface InteractiveTileGridProps {
  onTileSelect?: (tileId: number, position: { x: number; z: number }) => void;
  onLuxuryStoreClick?: () => void;
  onQGClick?: () => void;
  customObjects?: CustomObjectData[];
  gridWidth?: number;
  gridHeight?: number;
  tileSize?: number;
}

const InteractiveTileGrid: React.FC<InteractiveTileGridProps> = (
  {
    onTileSelect,
    onLuxuryStoreClick,
    onQGClick,
    customObjects = [],
    gridWidth = 40,
    gridHeight = 20,
    tileSize = 1,
  }
) => {
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
  const luxuryStoreRef = useRef<LuxuryStoreData>({
    position: { x: 0, z: 0 },
    gridX: 0,
    gridZ: 0,
    size: 4,
    model: null,
    isClickable: false,
  });
  const luxuryStoreGroupRef = useRef<THREE.Group | null>(null);
  const qgRef = useRef<QGData>({
    position: { x: 0, z: 0 },
    gridX: 0,
    gridZ: 0,
    size: 4,
    model: null,
    isClickable: false,
  });
  const qgGroupRef = useRef<THREE.Group | null>(null);
  const delegaciaGroupRef = useRef<THREE.Group | null>(null);
  const customObjectsRef = useRef<Map<number, THREE.Group>>(new Map());
  const giroAsfaltoGroupRef = useRef<THREE.Group | null>(null);
  const centroComercialGroupRef = useRef<THREE.Group | null>(null);
  const centroComunitarioGroupRef = useRef<THREE.Group | null>(null);
  const blockedTilesRef = useRef<Set<string>>(new Set());
  const navigate = useNavigate();
  const { level } = usePlayerStore();
  const [sceneReady, setSceneReady] = useState(false);
  const aaa3dSystemRef = useRef<AAA3DVisualSystem | null>(null);
  const lastHoveredBuildingRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set scene as ready immediately so GiroAsfaltoObject can be rendered
    setSceneReady(true);

    // ===== SCENE SETUP - NIGHT URBAN ATMOSPHERE =====
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background to show page background
    // Renovated dark layer with enhanced depth and atmosphere
    scene.fog = new THREE.Fog(0x0d1117, 100, 280); // Deeper, more sophisticated dark tone
    sceneRef.current = scene;

    // Initialize blocked tiles set
    blockedTilesRef.current.clear();

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

    // ===== LIGHTING - RENOVATED CINEMATIC NIGHT URBAN =====
    // Enhanced dark ambient light for sophisticated night atmosphere
    const ambientLight = new THREE.AmbientLight(0x1a2a4a, 0.3);
    scene.add(ambientLight);

    // Directional light for dramatic shadows with enhanced contrast
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(gridTotalWidth / 2 + 30, maxDim * 0.9, gridTotalHeight / 2 + 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // Warm fill light (orange/gold) - enhanced for depth
    const fillLight = new THREE.DirectionalLight(0xFF6B35, 0.45);
    fillLight.position.set(gridTotalWidth / 2 - 40, maxDim * 0.7, gridTotalHeight / 2 - 30);
    scene.add(fillLight);

    // Rim light for edge definition - enhanced neon glow
    const rimLight = new THREE.DirectionalLight(0x00EAFF, 0.5);
    rimLight.position.set(gridTotalWidth / 2, maxDim * 0.6, gridTotalHeight / 2 - 60);
    scene.add(rimLight);

    // Initialize AAA 3D Visual System
    const aaa3dSystem = new AAA3DVisualSystem(scene, camera, renderer);
    aaa3dSystemRef.current = aaa3dSystem;

    // ===== CREATE REALISTIC GROUND TEXTURE =====
    // Create canvas texture for beaten earth with variations
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base color: grayish-brown (#6b5e4a)
    const baseColor = '#6b5e4a';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle color variations to avoid repetition
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 40 + 10;
      const variation = Math.random() * 0.15 - 0.075; // ±7.5% variation

      // Create subtle patches of slightly different colors
      ctx.fillStyle = `rgba(107, 94, 74, ${0.3 + variation})`;
      ctx.fillRect(x, y, size, size);
    }

    // Add sparse dry grass/vegetation (very light, sparse)
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const grassLength = Math.random() * 8 + 3;

      // Dry grass color - muted brownish-green
      ctx.strokeStyle = `rgba(100, 95, 70, ${0.4 + Math.random() * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 4, y - grassLength);
      ctx.stroke();
    }

    // Add small stones/pebbles scattered across
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const stoneSize = Math.random() * 6 + 2;

      // Stone colors - gray with slight variation
      const stoneShade = Math.floor(Math.random() * 30 + 80);
      ctx.fillStyle = `rgba(${stoneShade}, ${stoneShade - 5}, ${stoneShade - 10}, ${0.6 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, stoneSize, 0, Math.PI * 2);
      ctx.fill();

      // Add subtle shadow to stones
      ctx.strokeStyle = `rgba(40, 40, 40, 0.3)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Add wear marks and natural depressions
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const width = Math.random() * 30 + 15;
      const height = Math.random() * 8 + 3;

      ctx.fillStyle = `rgba(60, 55, 45, ${0.2 + Math.random() * 0.2})`;
      ctx.fillRect(x, y, width, height);
    }

    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.magFilter = THREE.LinearFilter;
    groundTexture.minFilter = THREE.LinearMipmapLinearFilter;
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(4, 4); // Repeat pattern to avoid obvious tiling

    // ===== CREATE NORMAL MAP FOR DEPTH =====
    // Create a simple normal map to simulate surface irregularity
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 256;
    normalCanvas.height = 256;
    const normalCtx = normalCanvas.getContext('2d')!;

    // Base normal color (neutral blue - 0.5, 0.5, 1.0 in normalized space)
    normalCtx.fillStyle = '#8080ff';
    normalCtx.fillRect(0, 0, normalCanvas.width, normalCanvas.height);

    // Add subtle bumps and depressions
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * normalCanvas.width;
      const y = Math.random() * normalCanvas.height;
      const size = Math.random() * 20 + 5;

      // Create subtle normal variations
      const gradient = normalCtx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, '#9090ff');
      gradient.addColorStop(1, '#7070ff');
      normalCtx.fillStyle = gradient;
      normalCtx.beginPath();
      normalCtx.arc(x, y, size, 0, Math.PI * 2);
      normalCtx.fill();
    }

    const normalMap = new THREE.CanvasTexture(normalCanvas);
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(4, 4);

    // ===== CREATE TILE GRID (40x20 = 800 tiles) =====
    const totalTiles = gridWidth * gridHeight;

    // Create 3D box geometry for tiles
    const geometry = new THREE.BoxGeometry(tileSize * 0.9, tileSize * 0.05, tileSize * 0.9);

    // Base material - realistic beaten earth with texture
    const baseMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      normalMap: normalMap,
      color: 0x6b5e4a, // Grayish-brown base color
      metalness: 0.05, // Minimal metallic shine
      roughness: 0.85, // Very rough, dry earth appearance
      side: THREE.FrontSide,
      emissive: 0x000000,
      emissiveIntensity: 0.0,
      normalScale: new THREE.Vector2(0.5, 0.5), // Subtle normal map effect
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

    // ===== ADD TILE NUMBERS FOR ORIENTATION =====
    // Create canvas texture for tile numbers
    const numberCanvasTemplate = document.createElement('canvas');
    numberCanvasTemplate.width = 256;
    numberCanvasTemplate.height = 256;
    const numberCtxTemplate = numberCanvasTemplate.getContext('2d')!;

    // Create a function to generate number texture for a specific tile
    const createNumberTexture = (tileNumber: number) => {
      const numberCanvas = document.createElement('canvas');
      numberCanvas.width = 256;
      numberCanvas.height = 256;
      const numberCtx = numberCanvas.getContext('2d')!;

      // Transparent background
      numberCtx.clearRect(0, 0, numberCanvas.width, numberCanvas.height);

      // Draw number
      numberCtx.fillStyle = '#00eaff';
      numberCtx.font = 'bold 120px Arial';
      numberCtx.textAlign = 'center';
      numberCtx.textBaseline = 'middle';
      numberCtx.fillText(tileNumber.toString(), 128, 128);

      // Add glow effect
      numberCtx.strokeStyle = '#00eaff';
      numberCtx.lineWidth = 3;
      numberCtx.strokeText(tileNumber.toString(), 128, 128);

      return new THREE.CanvasTexture(numberCanvas);
    };

    // Add text labels for every 5th tile to avoid clutter
    const labelInterval = 5;
    tileIndex = 0;
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        if (tileIndex % labelInterval === 0) {
          const x = startX + col * tileSize + tileSize / 2;
          const z = startZ + row * tileSize + tileSize / 2;
          const y = tileSize * 0.15; // Slightly above the tile

          // Create a plane with the number texture
          const numberTexture = createNumberTexture(tileIndex);
          const numberMaterial = new THREE.MeshBasicMaterial({
            map: numberTexture,
            transparent: true,
            side: THREE.DoubleSide,
            emissive: 0x00eaff,
            emissiveIntensity: 0.5,
          });

          const numberGeometry = new THREE.PlaneGeometry(tileSize * 0.8, tileSize * 0.8);
          const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);

          // Position the number above the tile
          numberMesh.position.set(x, y, z);
          numberMesh.rotation.x = -Math.PI / 2.5; // Tilt to be visible from camera angle

          scene.add(numberMesh);
        }

        tileIndex++;
      }
    }

    // ===== ADD GROUND PLANE WITH REALISTIC TEXTURE =====
    const groundGeometry = new THREE.PlaneGeometry(gridTotalWidth * 1.3, gridTotalHeight * 1.3);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      normalMap: normalMap,
      color: 0x6b5e4a, // Match tile color for consistency
      metalness: 0.0,
      roughness: 0.9,
      normalScale: new THREE.Vector2(0.5, 0.5),
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

    // ===== LOAD LUXURY STORE 3D MODEL =====
    const gltfLoader = new GLTFLoader();

    // Calculate position for 4x4 luxury store (16 tiles) - POSITIONED at tile 10
    const storeSize = 4; // 4x4 tiles

    // Position the store at tile 10
    // Tile 10 in a linear grid corresponds to grid position (10, 0) when counting from left to right
    // For a 40-wide grid: tile 10 = x:10, z:0
    const storeGridX = 10;
    const storeGridZ = 0;

    // Convert grid coordinates to world coordinates
    // Grid position (6, 3) means starting at tile 6,3
    // Center of a 4x4 store at grid position (6,3) is at (6+2, 3+2) = (8, 5)
    const storeCenterGridX = storeGridX + storeSize / 2;
    const storeCenterGridZ = storeGridZ + storeSize / 2;

    const storeWorldX = startX + storeCenterGridX * tileSize;
    const storeWorldZ = startZ + storeCenterGridZ * tileSize;

    luxuryStoreRef.current = {
      position: { x: storeWorldX, z: storeWorldZ },
      gridX: storeGridX,
      gridZ: storeGridZ,
      size: storeSize,
      model: null,
      isClickable: true,
    };

    // Debug: Log the store position
    console.log('Luxury Store Position:', {
      gridX: storeGridX,
      gridZ: storeGridZ,
      worldX: storeWorldX,
      worldZ: storeWorldZ,
      gridSize: storeSize,
    });

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_55eda8581fc04c02a39a33c94b588afc.glb',
      (gltf) => {
        const model = gltf.scene;

        // Create a group for the luxury store
        const storeGroup = new THREE.Group();

        // Position at center of platform
        storeGroup.position.set(storeWorldX, 0, storeWorldZ);

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale to fit exactly 4x4 tiles (4 units in world space)
        const targetSize = storeSize * tileSize; // 4 units
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

        // Center the model within the group
        bbox.setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Ensure model sits on the ground (y = 0)
        // Get the bottom of the model
        bbox.setFromObject(model);
        const bottomY = bbox.min.y;
        model.position.y -= bottomY; // Lift model so bottom is at y = 0

        // Apply shadow properties recursively to all children
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Enhance material brightness for better visibility
            if (child.material instanceof THREE.Material) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissiveIntensity = 0.3;
                child.material.metalness = Math.max(0, child.material.metalness - 0.2);
                child.material.roughness = Math.min(1, child.material.roughness + 0.1);
              }
            }
          }
        });

        storeGroup.add(model);
        scene.add(storeGroup);

        luxuryStoreRef.current.model = storeGroup;
        luxuryStoreGroupRef.current = storeGroup;

        // Apply AAA visuals
        if (aaa3dSystemRef.current) {
          aaa3dSystemRef.current.applyBuildingVisuals(storeGroup, 'luxury');
          aaa3dSystemRef.current.addGroundShadow(storeGroup, 4);
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load luxury store 3D model:', error);
      }
    );

    // ===== LOAD QG 3D MODEL (4x4 tiles in center) =====
    // Position the QG in the center of the grid (16 central tiles)
    const qgSize = 4; // 4x4 tiles
    const qgGridX = (gridWidth / 2) - (qgSize / 2); // Center horizontally
    const qgGridZ = (gridHeight / 2) - (qgSize / 2); // Center vertically

    // Convert grid coordinates to world coordinates
    const qgCenterGridX = qgGridX + qgSize / 2;
    const qgCenterGridZ = qgGridZ + qgSize / 2;

    const qgWorldX = startX + qgCenterGridX * tileSize;
    const qgWorldZ = startZ + qgCenterGridZ * tileSize;

    qgRef.current = {
      position: { x: qgWorldX, z: qgWorldZ },
      gridX: qgGridX,
      gridZ: qgGridZ,
      size: qgSize,
      model: null,
      isClickable: true,
    };

    // Debug: Log the QG position
    console.log('QG Position:', {
      gridX: qgGridX,
      gridZ: qgGridZ,
      worldX: qgWorldX,
      worldZ: qgWorldZ,
      gridSize: qgSize,
    });

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_938928189a844f56ac340bada0b551bd.glb',
      (gltf) => {
        const model = gltf.scene;

        // Create a group for the QG
        const qgGroup = new THREE.Group();

        // Position at center of platform
        qgGroup.position.set(qgWorldX, 0, qgWorldZ);

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale to fit exactly 4x4 tiles (4 units in world space)
        const targetSize = qgSize * tileSize; // 4 units
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

        // Center the model within the group
        bbox.setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Ensure model sits on the ground (y = 0)
        // Get the bottom of the model
        bbox.setFromObject(model);
        const bottomY = bbox.min.y;
        model.position.y -= bottomY; // Lift model so bottom is at y = 0

        // Apply shadow properties recursively to all children
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Enhance material brightness for better visibility
            if (child.material instanceof THREE.Material) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissiveIntensity = 0.3;
                child.material.metalness = Math.max(0, child.material.metalness - 0.2);
                child.material.roughness = Math.min(1, child.material.roughness + 0.1);
              }
            }
          }
        });

        qgGroup.add(model);
        scene.add(qgGroup);

        qgRef.current.model = qgGroup;
        qgGroupRef.current = qgGroup;

        // Apply AAA visuals
        if (aaa3dSystemRef.current) {
          aaa3dSystemRef.current.applyBuildingVisuals(qgGroup, 'qg');
          aaa3dSystemRef.current.addGroundShadow(qgGroup, 4);
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load QG 3D model:', error);
      }
    );

    // ===== LOAD CUSTOM 3D OBJECTS =====
    customObjects.forEach((customObj, index) => {
      gltfLoader.load(
        customObj.modelUrl,
        (gltf) => {
          const model = gltf.scene;

          // Create a group for the custom object
          const objGroup = new THREE.Group();

          // Position at center of platform
          objGroup.position.set(customObj.position.x, 0, customObj.position.z);

          // Calculate bounding box to determine proper scale
          const bbox = new THREE.Box3().setFromObject(model);
          const size = bbox.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          // Scale to fit the specified size
          const targetSize = customObj.size * tileSize;
          const scale = targetSize / maxDim;
          model.scale.set(scale, scale, scale);

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

          objGroup.add(model);
          scene.add(objGroup);

          customObjectsRef.current.set(index, objGroup);
        },
        undefined,
        (error) => {
          console.warn(`Failed to load custom object ${index}:`, error);
        }
      );
    });

    // ===== LOAD GIRO NO ASFALTO 3D MODEL (4x2 format) =====
    // Position the giro no asfalto in a strategic location
    const giroWidth = 4; // tiles wide
    const giroDepth = 2; // tiles deep
    const giroGridX = 8; // Starting grid position X
    const giroGridZ = 9; // Starting grid position Z

    // Calculate center position in world coordinates
    const giroCenterGridX = giroGridX + giroWidth / 2;
    const giroCenterGridZ = giroGridZ + giroDepth / 2;

    const giroWorldX = startX + giroCenterGridX * tileSize;
    const giroWorldZ = startZ + giroCenterGridZ * tileSize;

    console.log('Giro no Asfalto Position:', {
      gridX: giroGridX,
      gridZ: giroGridZ,
      worldX: giroWorldX,
      worldZ: giroWorldZ,
      gridSize: `${giroWidth}x${giroDepth}`,
    });

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

        // Scale to fit exactly 8 tiles (4x2 format)
        const targetWidth = giroWidth * tileSize; // 4 units
        const targetDepth = giroDepth * tileSize; // 2 units
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
        model.position.y -= bottomY;

        // Apply shadow properties recursively to all children
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Enhance material brightness for better visibility
            if (child.material instanceof THREE.Material) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissiveIntensity = 0.3;
                child.material.metalness = Math.max(0, child.material.metalness - 0.2);
                child.material.roughness = Math.min(1, child.material.roughness + 0.15);
              }
            }
          }
        });

        giroGroup.add(model);
        giroGroup.userData = { clickable: true, type: 'giro-no-asfalto' };
        scene.add(giroGroup);

        giroAsfaltoGroupRef.current = giroGroup;
        console.log('Giro no Asfalto 3D model loaded successfully');
      },
      undefined,
      (error) => {
        console.warn('Failed to load Giro no Asfalto 3D model:', error);
      }
    );

    // ===== LOAD DELEGACIA 3D MODEL (8 tiles - 2x4 format) =====
    // Position the delegacia at tile 5
    const delegaciaSize = 2; // 2 tiles wide
    const delegaciaDepth = 4; // 4 tiles deep
    
    // Tile 5 is at row 0, col 5 in the grid (40 columns × 20 rows)
    const delegaciaGridX = 5; // Column 5
    const delegaciaGridZ = 0; // Row 0

    // Convert grid coordinates to world coordinates
    const delegaciaCenterGridX = delegaciaGridX + delegaciaSize / 2;
    const delegaciaCenterGridZ = delegaciaGridZ + delegaciaDepth / 2;

    const delegaciaWorldX = startX + delegaciaCenterGridX * tileSize;
    const delegaciaWorldZ = startZ + delegaciaCenterGridZ * tileSize;

    console.log('Delegacia Position:', {
      gridX: delegaciaGridX,
      gridZ: delegaciaGridZ,
      worldX: delegaciaWorldX,
      worldZ: delegaciaWorldZ,
      gridSize: `${delegaciaSize}x${delegaciaDepth}`,
      tile: 5,
    });

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_6dad7dc336a548d1b45d2a925a05b458.glb',
      (gltf) => {
        const model = gltf.scene;

        // Create a group for the delegacia
        const delegaciaGroup = new THREE.Group();

        // Position at center of platform
        delegaciaGroup.position.set(delegaciaWorldX, 0, delegaciaWorldZ);

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale to fit exactly 8 tiles (2x4 format)
        const targetSize = Math.max(delegaciaSize * tileSize, delegaciaDepth * tileSize);
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

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
            // Enhance material brightness for better visibility
            if (child.material instanceof THREE.Material) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.emissiveIntensity = 0.2;
                child.material.metalness = Math.max(0, child.material.metalness - 0.2);
                child.material.roughness = Math.min(1, child.material.roughness + 0.1);
              }
            }
          }
        });

        delegaciaGroup.add(model);
        delegaciaGroup.userData = { clickable: true, type: 'delegacia' };
        scene.add(delegaciaGroup);

        delegaciaGroupRef.current = delegaciaGroup;

        // Apply AAA visuals
        if (aaa3dSystemRef.current) {
          aaa3dSystemRef.current.applyBuildingVisuals(delegaciaGroup, 'delegacia');
          aaa3dSystemRef.current.addGroundShadow(delegaciaGroup, 2);
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load delegacia 3D model:', error);
      }
    );

    // ===== LOAD CENTRO COMERCIAL 3D MODEL (positioned at tile 40) =====
    // Position the centro comercial at tile 40 (exact position marked with X)
    const centroComercialSize = 4; // 4 tiles wide
    const centroComercialDepth = 2; // 2 tiles deep (8 tiles total)
    const centroComercialGridX = 20; // Tile 40 X position (center)
    const centroComercialGridZ = 10; // Tile 40 Z position (center)

    // Convert grid coordinates to world coordinates
    const centroComercialCenterGridX = centroComercialGridX;
    const centroComercialCenterGridZ = centroComercialGridZ;

    const centroComercialWorldX = startX + centroComercialCenterGridX * tileSize;
    const centroComercialWorldZ = startZ + centroComercialCenterGridZ * tileSize;

    console.log('Centro Comercial Position (Tile 40):', {
      gridX: centroComercialGridX,
      gridZ: centroComercialGridZ,
      worldX: centroComercialWorldX,
      worldZ: centroComercialWorldZ,
      gridSize: `${centroComercialSize}x${centroComercialDepth}`,
    });

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_8b894931f3c241f285c4292c4842c4f0.glb',
      (gltf) => {
        const model = gltf.scene;

        // Create a group for the centro comercial
        const centroComercialGroup = new THREE.Group();

        // Position at center of platform
        centroComercialGroup.position.set(centroComercialWorldX, 0, centroComercialWorldZ);

        // Rotate to face inward (towards the center of the platform)
        // Rotate 180 degrees around Y axis to face inward
        centroComercialGroup.rotation.y = Math.PI;

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale to fit exactly 8 tiles
        const targetSize = Math.max(centroComercialSize * tileSize, centroComercialDepth * tileSize);
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

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

        centroComercialGroup.add(model);
        centroComercialGroup.userData = { clickable: true, type: 'centro-comercial' };
        scene.add(centroComercialGroup);

        centroComercialGroupRef.current = centroComercialGroup;

        // Apply AAA visuals
        if (aaa3dSystemRef.current) {
          aaa3dSystemRef.current.applyBuildingVisuals(centroComercialGroup, 'centro-comercial');
          aaa3dSystemRef.current.addGroundShadow(centroComercialGroup, 4);
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load Centro Comercial 3D model:', error);
      }
    );

    // ===== LOAD CENTRO COMUNITÁRIO 3D MODEL (8 tiles - right margin, next to Centro Comercial) =====
    // Position the centro comunitário next to the centro comercial
    const centroComunitarioSize = 4; // 4 tiles wide
    const centroComunitarioDepth = 2; // 2 tiles deep (8 tiles total)
    const centroComunitarioGridX = 32; // Right margin (same as centro comercial)
    const centroComunitarioGridZ = 5; // Below centro comercial with spacing

    // Convert grid coordinates to world coordinates
    const centroComunitarioCenterGridX = centroComunitarioGridX + centroComunitarioSize / 2;
    const centroComunitarioCenterGridZ = centroComunitarioGridZ + centroComunitarioDepth / 2;

    const centroComunitarioWorldX = startX + centroComunitarioCenterGridX * tileSize;
    const centroComunitarioWorldZ = startZ + centroComunitarioCenterGridZ * tileSize;

    console.log('Centro Comunitário Position:', {
      gridX: centroComunitarioGridX,
      gridZ: centroComunitarioGridZ,
      worldX: centroComunitarioWorldX,
      worldZ: centroComunitarioWorldZ,
      gridSize: `${centroComunitarioSize}x${centroComunitarioDepth}`,
    });

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_1641be50f6a74954848cfaae281d6b15.glb',
      (gltf) => {
        const model = gltf.scene;

        // Create a group for the centro comunitário
        const centroComunitarioGroup = new THREE.Group();

        // Position at center of platform
        centroComunitarioGroup.position.set(centroComunitarioWorldX, 0, centroComunitarioWorldZ);

        // Calculate bounding box to determine proper scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Scale to fit exactly 8 tiles
        const targetSize = Math.max(centroComunitarioSize * tileSize, centroComunitarioDepth * tileSize);
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

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

        centroComunitarioGroup.add(model);
        centroComunitarioGroup.userData = { clickable: true, type: 'centro-comunitario' };
        scene.add(centroComunitarioGroup);

        centroComunitarioGroupRef.current = centroComunitarioGroup;

        // Apply AAA visuals
        if (aaa3dSystemRef.current) {
          aaa3dSystemRef.current.applyBuildingVisuals(centroComunitarioGroup, 'centro-comunitario');
          aaa3dSystemRef.current.addGroundShadow(centroComunitarioGroup, 4);
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load Centro Comunitário 3D model:', error);
      }
    );

    // ===== ORBIT CONTROLS WITH CUSTOM CONFIGURATION =====
    const controls = new OrbitControls(camera, renderer.domElement);

    // ===== CAMERA CONTROLS - Configuração conforme solicitado =====
    controls.enablePan = true;          // permite mover lateralmente
    controls.enableZoom = true;         // permite zoom
    controls.enableRotate = true;       // permite girar em torno do grid
    controls.target.set(0, 0, 0);       // centraliza no grid fixo
    controls.maxPolarAngle = Math.PI/2; // impede câmera passar pelo chão
    controls.minDistance = 10;          // zoom mínimo
    controls.maxDistance = 100;         // zoom máximo

    // ===== DAMPING CONFIGURATION (Smooth Movement) =====
    controls.enableDamping = true;
    controls.dampingFactor = 0.08; // Smooth deceleration
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;

    // ===== ZOOM CONFIGURATION =====
    controls.zoomSpeed = 1.2; // Sensitivity for scroll/pinch

    // ===== ROTATION CONFIGURATION =====
    controls.rotateSpeed = 0.8; // Rotation sensitivity

    // ===== AZIMUTH LOCK (Horizontal rotation only) =====
    // Allow free rotation around Y-axis (no restrictions)
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;

    // ===== TOUCH SUPPORT =====
    controls.touchDollyRotate = true; // Enable pinch-to-zoom on mobile
    controls.touchDollySpeed = 8; // Pinch zoom sensitivity

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

      // Check if delegacia was clicked
      if (delegaciaGroupRef.current) {
        const delegaciaIntersects = raycasterRef.current.intersectObject(delegaciaGroupRef.current, true);
        if (delegaciaIntersects.length > 0) {
          // Handle delegacia click based on player level
          if (level < 10) {
            console.warn('Nível insuficiente para acessar a delegacia');
            return;
          }

          if (level >= 10 && level < 20) {
            navigate('/bribery-investigador');
          } else if (level >= 20) {
            navigate('/bribery-delegado');
          }
          return;
        }
      }

      // Check if centro comercial was clicked
      if (centroComercialGroupRef.current) {
        const centroComercialIntersects = raycasterRef.current.intersectObject(centroComercialGroupRef.current, true);
        if (centroComercialIntersects.length > 0) {
          console.log('Centro Comercial clicked from grid!');
          navigate('/centro-comercial');
          return;
        }
      }

      // Check if centro comunitário was clicked
      if (centroComunitarioGroupRef.current) {
        const centroComunitarioIntersects = raycasterRef.current.intersectObject(centroComunitarioGroupRef.current, true);
        if (centroComunitarioIntersects.length > 0) {
          console.log('Centro Comunitário clicked from grid!');
          navigate('/investment-center');
          return;
        }
      }

      // Check if giro no asfalto was clicked
      if (giroAsfaltoGroupRef.current) {
        const giroIntersects = raycasterRef.current.intersectObject(giroAsfaltoGroupRef.current, true);
        if (giroIntersects.length > 0) {
          console.log('Giro no Asfalto clicked from grid!');
          navigate('/giro-no-asfalto');
          return;
        }
      }

      // Check if custom objects were clicked
      for (let i = 0; i < customObjects.length; i++) {
        const customObjGroup = customObjectsRef.current.get(i);
        if (customObjGroup) {
          const customIntersects = raycasterRef.current.intersectObject(customObjGroup, true);
          if (customIntersects.length > 0) {
            if (customObjects[i].onClickCallback) {
              customObjects[i].onClickCallback!();
            }
            return;
          }
        }
      }

      // Check if QG was clicked
      if (qgGroupRef.current) {
        const qgIntersects = raycasterRef.current.intersectObject(qgGroupRef.current, true);
        if (qgIntersects.length > 0) {
          if (onQGClick) {
            onQGClick();
          }
          return;
        }
      }

      // Check if luxury store was clicked
      if (luxuryStoreGroupRef.current) {
        const storeIntersects = raycasterRef.current.intersectObject(luxuryStoreGroupRef.current, true);
        if (storeIntersects.length > 0) {
          if (onLuxuryStoreClick) {
            onLuxuryStoreClick();
          }
          return;
        }
      }

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

      // Update AAA 3D visual effects
      if (aaa3dSystemRef.current) {
        aaa3dSystemRef.current.update(0.016); // ~60fps delta time
      }

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
      groundTexture.dispose();
      normalMap.dispose();
      instancedMesh.dispose();
      controls.dispose();
      renderer.dispose();

      // Dispose AAA 3D system
      if (aaa3dSystemRef.current) {
        aaa3dSystemRef.current.dispose();
      }

      setSceneReady(false);
    };
  }, [gridWidth, gridHeight, tileSize, onTileSelect, onLuxuryStoreClick, onQGClick, customObjects, level, navigate]);

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
