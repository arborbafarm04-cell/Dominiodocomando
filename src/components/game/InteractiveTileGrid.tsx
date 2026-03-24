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
    scene.background = null;
    scene.fog = new THREE.Fog(0x2a3b5f, 120, 420);
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
    const startX = -(gridTotalWidth) / 2;
    const startZ = -(gridTotalHeight) / 2;
    camera.position.set(gridTotalWidth / 2, maxDim * 0.6, gridTotalHeight * 0.8);
    camera.lookAt(gridTotalWidth / 2, 0, gridTotalHeight / 2);
    cameraRef.current = camera;

    // ===== RENDERER SETUP =====
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // ===== LIGHTING - BRIGHTER CINEMATIC NIGHT =====
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
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

    const fillLight = new THREE.DirectionalLight(0xffd166, 0.9);
    fillLight.position.set(gridTotalWidth / 2 - 40, maxDim * 0.7, gridTotalHeight / 2 - 30);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    rimLight.position.set(gridTotalWidth / 2, maxDim * 0.6, gridTotalHeight / 2 - 60);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(gridTotalWidth / 2, maxDim * 0.5, gridTotalHeight / 2);
    scene.add(pointLight);

    // Lamp posts with strong warm lights
    const createLampPost = (x: number, z: number) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.9, metalness: 0.15 })
      );
      pole.position.set(x, 2, z);
      pole.castShadow = true;
      pole.receiveShadow = true;
      scene.add(pole);

      const lampHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 1.1 })
      );
      lampHead.position.set(x, 4.1, z);
      scene.add(lampHead);

      const lampLight = new THREE.PointLight(0xffd166, 3.8, 16, 2);
      lampLight.position.set(x, 4.2, z);
      lampLight.castShadow = true;
      scene.add(lampLight);
    };

    for (let i = 3; i < gridWidth; i += 6) {
      const worldX = startX + i * tileSize;
      createLampPost(worldX, startZ + 1.5 * tileSize);
      createLampPost(worldX, startZ + (gridHeight - 1.5) * tileSize);
    }

    // Initialize AAA 3D Visual System
    const aaa3dSystem = new AAA3DVisualSystem(scene, camera, renderer);
    aaa3dSystemRef.current = aaa3dSystem;

    // ===== CREATE REALISTIC GROUND TEXTURE =====
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const baseColor = '#6b5e4a';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 40 + 10;
      const variation = Math.random() * 0.15 - 0.075;
      ctx.fillStyle = `rgba(107, 94, 74, ${0.3 + variation})`;
      ctx.fillRect(x, y, size, size);
    }

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const grassLength = Math.random() * 8 + 3;
      ctx.strokeStyle = `rgba(100, 95, 70, ${0.4 + Math.random() * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 4, y - grassLength);
      ctx.stroke();
    }

    for (let i = 0; i < 120; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const stoneSize = Math.random() * 6 + 2;
      const stoneShade = Math.floor(Math.random() * 30 + 80);
      ctx.fillStyle = `rgba(${stoneShade}, ${stoneShade - 5}, ${stoneShade - 10}, ${0.6 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, stoneSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(40, 40, 40, 0.3)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const widthMark = Math.random() * 30 + 15;
      const heightMark = Math.random() * 8 + 3;
      ctx.fillStyle = `rgba(60, 55, 45, ${0.2 + Math.random() * 0.2})`;
      ctx.fillRect(x, y, widthMark, heightMark);
    }

    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.magFilter = THREE.LinearFilter;
    groundTexture.minFilter = THREE.LinearMipmapLinearFilter;
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(4, 4);

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 256;
    normalCanvas.height = 256;
    const normalCtx = normalCanvas.getContext('2d')!;

    normalCtx.fillStyle = '#8080ff';
    normalCtx.fillRect(0, 0, normalCanvas.width, normalCanvas.height);

    for (let i = 0; i < 150; i++) {
      const x = Math.random() * normalCanvas.width;
      const y = Math.random() * normalCanvas.height;
      const size = Math.random() * 20 + 5;

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

    const totalTiles = gridWidth * gridHeight;

    const geometry = new THREE.BoxGeometry(tileSize * 0.9, tileSize * 0.05, tileSize * 0.9);

    const baseMaterial = new THREE.MeshStandardMaterial({

map: groundTexture,
      normalMap: normalMap,
      color: 0x6b5e4a,
      metalness: 0.05,
      roughness: 0.85,
      side: THREE.FrontSide,
      emissive: 0x000000,
      emissiveIntensity: 0.0,
      normalScale: new THREE.Vector2(0.5, 0.5),
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, baseMaterial, totalTiles);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMeshRef.current = instancedMesh;

    const dummy = new THREE.Object3D();

    let tileIndex = 0;
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const x = startX + col * tileSize + tileSize / 2;
        const z = startZ + row * tileSize + tileSize / 2;
        const y = tileSize * 0.025;

        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(tileIndex, dummy.matrix);

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
    const createNumberTexture = (tileNumber: number) => {
      const numberCanvas = document.createElement('canvas');
      numberCanvas.width = 256;
      numberCanvas.height = 256;
      const numberCtx = numberCanvas.getContext('2d')!;

      numberCtx.clearRect(0, 0, numberCanvas.width, numberCanvas.height);

      numberCtx.fillStyle = '#00eaff';
      numberCtx.font = 'bold 120px Arial';
      numberCtx.textAlign = 'center';
      numberCtx.textBaseline = 'middle';
      numberCtx.fillText(tileNumber.toString(), 128, 128);

      numberCtx.strokeStyle = '#00eaff';
      numberCtx.lineWidth = 3;
      numberCtx.strokeText(tileNumber.toString(), 128, 128);

      return new THREE.CanvasTexture(numberCanvas);
    };

    const labelInterval = 5;
    tileIndex = 0;
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        if (tileIndex % labelInterval === 0) {
          const x = startX + col * tileSize + tileSize / 2;
          const z = startZ + row * tileSize + tileSize / 2;
          const y = tileSize * 0.15;

          const numberTexture = createNumberTexture(tileIndex);
          const numberMaterial = new THREE.MeshBasicMaterial({
            map: numberTexture,
            transparent: true,
            side: THREE.DoubleSide,
          });

          const numberGeometry = new THREE.PlaneGeometry(tileSize * 0.8, tileSize * 0.8);
          const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);

          numberMesh.position.set(x, y, z);
          numberMesh.rotation.x = -Math.PI / 2.5;

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
      color: 0x6b5e4a,
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
    const gridLinesMaterial = new THREE.LineBasicMaterial({
      color: 0x00eaff,
      linewidth: 1,
      transparent: true,
      opacity: 0.28
    });
    const gridLinesPoints: number[] = [];

    for (let i = 0; i <= gridWidth; i++) {
      const pos = startX + i * tileSize;
      gridLinesPoints.push(pos, 0.02, startZ);
      gridLinesPoints.push(pos, 0.02, startZ + gridTotalHeight);
    }

    for (let i = 0; i <= gridHeight; i++) {
      const pos = startZ + i * tileSize;
      gridLinesPoints.push(startX, 0.02, pos);
      gridLinesPoints.push(startX + gridTotalWidth, 0.02, pos);
    }

    gridLinesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridLinesPoints), 3));
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    scene.add(gridLines);

    // ===== EXTRA STONES / SMALL CLUTTER =====
    const clutterGroup = new THREE.Group();
    for (let i = 0; i < 60; i++) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(Math.random() * 0.18 + 0.08),
        new THREE.MeshStandardMaterial({
          color: 0x5a5a5a,
          roughness: 1,
          metalness: 0.0
        })
      );

      rock.position.set(
        startX + Math.random() * gridTotalWidth,
        0.08,
        startZ + Math.random() * gridTotalHeight
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      clutterGroup.add(rock);
    }
    scene.add(clutterGroup);

    // ===== LOADERS =====
    const gltfLoader = new GLTFLoader();

    // ===== LUXURY STORE 3D MODEL =====
    const storeSize = 4;
    const storeGridX = 10;
    const storeGridZ = 0;

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

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_55eda8581fc04c02a39a33c94b588afc.glb',
      (gltf) => {
        const model = gltf.scene;
        const storeGroup = new THREE.Group();

        storeGroup.position.set(storeWorldX, 0, storeWorldZ);

        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const targetSize = storeSize * tileSize;
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

        bbox.setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        bbox.setFromObject(model);
        const bottomY = bbox.min.y;
        model.position.y -= bottomY;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissiveIntensity = 0.22;
              child.material.metalness = Math.max(0, child.material.metalness - 0.2);
              child.material.roughness = Math.min(1, child.material.roughness + 0.1);
            }
          }
        });

        storeGroup.add(model);
        scene.add(storeGroup);

        luxuryStoreRef.current.model = storeGroup;
        luxuryStoreGroupRef.current = storeGroup;

        for (let x = 0; x < storeSize; x++) {
          for (let z = 0; z < storeSize; z++) {
            blockedTilesRef.current.add(`${storeGridX + x}-${storeGridZ + z}`);
          }
        }
      },
      undefined,
      (error) => {
        console.error('Erro ao carregar Luxury Store:', error);
      }
    );

    // ===== CENTRO COMERCIAL 3D MODEL - LATERAL DIREITA VIRADO PARA O CENTRO =====
    const centroSize = 4;
    const centroGridX = gridWidth - 6;
    const centroGridZ = Math.floor(gridHeight / 2) - 2;

    const centroCenterGridX = centroGridX + centroSize / 2;
    const centroCenterGridZ = centroGridZ + centroSize / 2;

    const centroWorldX = startX + centroCenterGridX * tileSize;
    const centroWorldZ = startZ + centroCenterGridZ * tileSize;

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_55eda8581fc04c02a39a33c94b588afc.glb',
      (gltf) => {
        const model = gltf.scene;
        const group = new THREE.Group();

        group.position.set(centroWorldX, 0, centroWorldZ);

        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const targetSize = centroSize * tileSize;
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

        bbox.setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        bbox.setFromObject(model);
        model.position.y -= bbox.min.y;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissiveIntensity = 0.18;
            }
          }
        });

        group.add(model);
        group.lookAt(new THREE.Vector3(0, 0, 0));

        scene.add(group);
        centroComercialGroupRef.current = group;

        for (let x = 0; x < centroSize; x++) {
          for (let z = 0; z < centroSize; z++) {
            blockedTilesRef.current.add(`${centroGridX + x}-${centroGridZ + z}`);
          }
        }
      },
      undefined,
      (error) => {
        console.error('Erro ao carregar Centro Comercial:', error);
      }
    );
// ===== QG 3D MODEL =====
    const qgSize = 4;
    const qgGridX = Math.floor(gridWidth / 2) - 2;
    const qgGridZ = Math.floor(gridHeight / 2) - 2;

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

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_abe964c8ae1f4e6dbf9e77f25b9fd535.glb',
      (gltf) => {
        const model = gltf.scene;
        const group = new THREE.Group();

        group.position.set(qgWorldX, 0, qgWorldZ);

        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const targetSize = 6 * tileSize;
        const scale = targetSize / maxDim;
        model.scale.set(scale, scale, scale);

        bbox.setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        bbox.setFromObject(model);
        model.position.y -= bbox.min.y;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissiveIntensity = 0.25;
              child.material.roughness = Math.min(1, child.material.roughness + 0.08);
            }
          }
        });

        group.add(model);
        scene.add(group);

        qgRef.current.model = group;
        qgGroupRef.current = group;

        for (let x = 0; x < qgSize; x++) {
          for (let z = 0; z < qgSize; z++) {
            blockedTilesRef.current.add(`${qgGridX + x}-${qgGridZ + z}`);
          }
        }
      },
      undefined,
      (error) => {
        console.error('Erro ao carregar QG:', error);
      }
    );

    // ===== DELEGACIA =====
    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_55eda8581fc04c02a39a33c94b588afc.glb',
      (gltf) => {
        const model = gltf.scene;
        const group = new THREE.Group();

        const delegaciaGridX = 4;
        const delegaciaGridZ = gridHeight - 6;

        const delegaciaWorldX = startX + (delegaciaGridX + 2) * tileSize;
        const delegaciaWorldZ = startZ + (delegaciaGridZ + 2) * tileSize;

        group.position.set(delegaciaWorldX, 0, delegaciaWorldZ);

        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDim;

        model.scale.set(scale, scale, scale);

        bbox.setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        bbox.setFromObject(model);
        model.position.y -= bbox.min.y;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        group.add(model);
        scene.add(group);

        delegaciaGroupRef.current = group;
      },
      undefined,
      (error) => {
        console.error('Erro ao carregar Delegacia:', error);
      }
    );

    // ===== CUSTOM OBJECTS =====
    customObjects.forEach((customObject, index) => {
      gltfLoader.load(
        customObject.modelUrl,
        (gltf) => {
          const model = gltf.scene;
          const group = new THREE.Group();

          const worldX = startX + (customObject.gridX + customObject.size / 2) * tileSize;
          const worldZ = startZ + (customObject.gridZ + customObject.size / 2) * tileSize;

          group.position.set(worldX, 0, worldZ);

          const bbox = new THREE.Box3().setFromObject(model);
          const size = bbox.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          const targetSize = customObject.size * tileSize;
          const scale = targetSize / maxDim;
          model.scale.set(scale, scale, scale);

          bbox.setFromObject(model);
          const center = bbox.getCenter(new THREE.Vector3());
          model.position.sub(center);

          bbox.setFromObject(model);
          model.position.y -= bbox.min.y;

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          group.add(model);
          scene.add(group);

          customObjectsRef.current.set(index, group);

          for (let x = 0; x < customObject.size; x++) {
            for (let z = 0; z < customObject.size; z++) {
              blockedTilesRef.current.add(`${customObject.gridX + x}-${customObject.gridZ + z}`);
            }
          }
        },
        undefined,
        (error) => {
          console.error(`Erro ao carregar objeto customizado ${index}:`, error);
        }
      );
    });

    // ===== ORBIT CONTROLS =====
    controlsRef.current = controls;
    controls.target.set(gridTotalWidth / 2 - gridTotalWidth / 2, 0, gridTotalHeight / 2 - gridTotalHeight / 2);
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.minDistance = 8;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minPolarAngle = Math.PI / 5;
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.9;
    controls.update();

    // ===== HOVER HIGHLIGHT =====
    const setBuildingHover = (group: THREE.Group | null, hovered: boolean) => {
      if (!group) return;

      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissive = new THREE.Color(hovered ? 0x223344 : 0x000000);
          child.material.emissiveIntensity = hovered ? 0.45 : 0.18;
        }
      });
    };

    const handlePointerMove = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      let hoveredGroup: THREE.Group | null = null;

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;

        while (obj?.parent) {
          if (obj === luxuryStoreGroupRef.current) {
            hoveredGroup = luxuryStoreGroupRef.current;
            break;
          }
          if (obj === centroComercialGroupRef.current) {
            hoveredGroup = centroComercialGroupRef.current;
            break;
          }
          if (obj === qgGroupRef.current) {
            hoveredGroup = qgGroupRef.current;
            break;
          }
          if (obj === delegaciaGroupRef.current) {
            hoveredGroup = delegaciaGroupRef.current;
            break;
          }
          obj = obj.parent;
        }
      }

      if (lastHoveredBuildingRef.current !== hoveredGroup) {
        if (lastHoveredBuildingRef.current) {
          setBuildingHover(lastHoveredBuildingRef.current, false);
        }
        if (hoveredGroup) {
          setBuildingHover(hoveredGroup, true);
        }
        lastHoveredBuildingRef.current = hoveredGroup;
      }
    };

    // ===== CLICK =====
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;

        while (obj?.parent) {
          if (obj === luxuryStoreGroupRef.current) {
            onLuxuryStoreClick?.();
            return;
          }

          if (obj === centroComercialGroupRef.current) {
            navigate('/commercial-center');
            return;
          }

          if (obj === qgGroupRef.current) {
            onQGClick?.();
            return;
          }

          if (obj === delegaciaGroupRef.current) {
            console.log('Delegacia clicada');
            return;
          }

          obj = obj.parent;
        }
      }

      const intersectsTiles = raycasterRef.current.intersectObject(instancedMesh, false);
      if (intersectsTiles.length > 0) {
        const instanceId = intersectsTiles[0].instanceId;
        if (instanceId !== undefined) {
          selectedTileRef.current = instanceId;
          const tile = tilesRef.current.get(instanceId);
          if (tile && onTileSelect) {
            onTileSelect(instanceId, { x: tile.x, z: tile.z });
          }
        }
      }
    };
// ===== MOBILE TOUCH SUPPORT =====
    const handleTouchEnd = (event: TouchEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      if (event.changedTouches.length === 0) return;

      const touch = event.changedTouches[0];
      const rect = renderer.domElement.getBoundingClientRect();

      mouseRef.current.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;

        while (obj?.parent) {
          if (obj === luxuryStoreGroupRef.current) {
            onLuxuryStoreClick?.();
            return;
          }

          if (obj === centroComercialGroupRef.current) {
            navigate('/commercial-center');
            return;
          }

          if (obj === qgGroupRef.current) {
            onQGClick?.();
            return;
          }

          if (obj === delegaciaGroupRef.current) {
            console.log('Delegacia clicada');
            return;
          }

          obj = obj.parent;
        }
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    // ===== ANIMATION LOOP =====
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      controls.update();

      if (aaa3dSystemRef.current && typeof aaa3dSystemRef.current.update === 'function') {
        aaa3dSystemRef.current.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // ===== CLEANUP =====
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('touchend', handleTouchEnd);

      if (lastHoveredBuildingRef.current) {
        setBuildingHover(lastHoveredBuildingRef.current, false);
        lastHoveredBuildingRef.current = null;
      }

      controls.dispose();

      if (instancedMeshRef.current) {
        instancedMeshRef.current.geometry.dispose();
        if (Array.isArray(instancedMeshRef.current.material)) {
          instancedMeshRef.current.material.forEach((m) => m.dispose());
        } else {
          instancedMeshRef.current.material.dispose();
        }
      }

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();

          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }

      tilesRef.current.clear();
      customObjectsRef.current.clear();
      blockedTilesRef.current.clear();

      luxuryStoreGroupRef.current = null;
      qgGroupRef.current = null;
      delegaciaGroupRef.current = null;
      giroAsfaltoGroupRef.current = null;
      centroComercialGroupRef.current = null;
      centroComunitarioGroupRef.current = null;

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      aaa3dSystemRef.current = null;
    };
  }, [
    onTileSelect,
    onLuxuryStoreClick,
    onQGClick,
    customObjects,
    gridWidth,
    gridHeight,
    tileSize,
    navigate,
    level,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full touch-none"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100%',
        minWidth: '100%',
      }}
    >
      {!sceneReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-white">
              Carregando complexo...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveTileGrid;



