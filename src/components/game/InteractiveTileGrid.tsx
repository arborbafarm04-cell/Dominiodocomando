import React, { useEffect, useRef } from 'react';
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
  gridX: number;
  gridZ: number;
  isSelected: boolean;
}

interface LuxuryStoreData {
  position: { x: number; z: number };
  gridX: number;
  gridZ: number;
  size: number;
  model: THREE.Group | null;
  isClickable: boolean;
}

interface QGData {
  position: { x: number; z: number };
  gridX: number;
  gridZ: number;
  size: number;
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
  onGiroClick?: () => void;
  customObjects?: CustomObjectData[];
  gridWidth?: number;
  gridHeight?: number;
  tileSize?: number;
}

const InteractiveTileGrid: React.FC<InteractiveTileGridProps> = ({
  onTileSelect,
  onLuxuryStoreClick,
  onQGClick,
  onGiroClick,
  customObjects = [],
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
  const giroAsfaltoGroupRef = useRef<THREE.Group | null>(null);
  const centroComercialGroupRef = useRef<THREE.Group | null>(null);
  const centroComunitarioGroupRef = useRef<THREE.Group | null>(null);
  const customObjectsRef = useRef<Map<number, THREE.Group>>(new Map());
  const blockedTilesRef = useRef<Set<string>>(new Set());
  const aaa3dSystemRef = useRef<AAA3DVisualSystem | null>(null);

  const navigate = useNavigate();
  const player = usePlayerStore((state) => state.player);
  const level = player?.level ?? 1;

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0xaecbff, 300, 1200);
    sceneRef.current = scene;

    blockedTilesRef.current.clear();
    tilesRef.current.clear();
    customObjectsRef.current.clear();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    const gridTotalWidth = gridWidth * tileSize;
    const gridTotalHeight = gridHeight * tileSize;
    const maxDim = Math.max(gridTotalWidth, gridTotalHeight);

    camera.position.set(gridTotalWidth / 2, maxDim * 0.6, gridTotalHeight * 0.8);
    camera.lookAt(gridTotalWidth / 2, 0, gridTotalHeight / 2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(30, 60, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -150;
    directionalLight.shadow.camera.right = 150;
    directionalLight.shadow.camera.top = 150;
    directionalLight.shadow.camera.bottom = -150;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xfff1b3, 1.2);
    fillLight.position.set(-20, 25, -20);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xaee8ff, 0.8);
    rimLight.position.set(0, 20, -50);
    scene.add(rimLight);

    const aaa3dSystem = new AAA3DVisualSystem(scene, camera, renderer);
    aaa3dSystemRef.current = aaa3dSystem;

    const normalizeModel = (model: THREE.Group, targetSize: number) => {
      const bbox = new THREE.Box3().setFromObject(model);
      const size = bbox.getSize(new THREE.Vector3());
      const maxModelDim = Math.max(size.x, size.y, size.z);

      const scale = targetSize / maxModelDim;
      model.scale.set(scale, scale, scale);

      bbox.setFromObject(model);
      const center = bbox.getCenter(new THREE.Vector3());
      model.position.sub(center);

      bbox.setFromObject(model);
      model.position.y -= bbox.min.y;
    };

    const applyModelShadowsAndMaterial = (
      model: THREE.Group,
      emissiveIntensity = 0.18,
      roughnessBoost = 0.1
    ) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissiveIntensity = emissiveIntensity;
            child.material.metalness = Math.max(0, child.material.metalness - 0.2);
            child.material.roughness = Math.min(1, child.material.roughness + roughnessBoost);
          }
        }
      });
    };

    const blockTiles = (startGridX: number, startGridZ: number, sizeX: number, sizeZ: number) => {
      for (let x = 0; x < sizeX; x++) {
        for (let z = 0; z < sizeZ; z++) {
          blockedTilesRef.current.add(`${startGridX + x}-${startGridZ + z}`);
        }
      }
    };
const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const groundCtx = groundCanvas.getContext('2d');

    if (!groundCtx) return;

    groundCtx.fillStyle = '#6b5e4a';
    groundCtx.fillRect(0, 0, groundCanvas.width, groundCanvas.height);

    for (let i = 0; i < 200; i++) {
      const x = Math.random() * groundCanvas.width;
      const y = Math.random() * groundCanvas.height;
      const size = Math.random() * 40 + 10;
      const variation = Math.random() * 0.15 - 0.075;

      groundCtx.fillStyle = `rgba(107, 94, 74, ${0.3 + variation})`;
      groundCtx.fillRect(x, y, size, size);
    }

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * groundCanvas.width;
      const y = Math.random() * groundCanvas.height;
      const grassLength = Math.random() * 8 + 3;

      groundCtx.strokeStyle = `rgba(100, 95, 70, ${0.4 + Math.random() * 0.3})`;
      groundCtx.lineWidth = 1;
      groundCtx.beginPath();
      groundCtx.moveTo(x, y);
      groundCtx.lineTo(x + (Math.random() - 0.5) * 4, y - grassLength);
      groundCtx.stroke();
    }

    for (let i = 0; i < 120; i++) {
      const x = Math.random() * groundCanvas.width;
      const y = Math.random() * groundCanvas.height;
      const stoneSize = Math.random() * 6 + 2;
      const stoneShade = Math.floor(Math.random() * 30 + 80);

      groundCtx.fillStyle = `rgba(${stoneShade}, ${stoneShade - 5}, ${stoneShade - 10}, ${
        0.6 + Math.random() * 0.3
      })`;
      groundCtx.beginPath();
      groundCtx.arc(x, y, stoneSize, 0, Math.PI * 2);
      groundCtx.fill();

      groundCtx.strokeStyle = 'rgba(40, 40, 40, 0.3)';
      groundCtx.lineWidth = 0.5;
      groundCtx.stroke();
    }

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * groundCanvas.width;
      const y = Math.random() * groundCanvas.height;
      const wearWidth = Math.random() * 30 + 15;
      const wearHeight = Math.random() * 8 + 3;

      groundCtx.fillStyle = `rgba(60, 55, 45, ${0.2 + Math.random() * 0.2})`;
      groundCtx.fillRect(x, y, wearWidth, wearHeight);
    }

    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.magFilter = THREE.LinearFilter;
    groundTexture.minFilter = THREE.LinearMipmapLinearFilter;
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(4, 4);

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 256;
    normalCanvas.height = 256;
    const normalCtx = normalCanvas.getContext('2d');

    if (!normalCtx) return;

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
      normalMap,
      color: 0x6b5e4a,
      metalness: 0,
      roughness: 0.95,
      side: THREE.FrontSide,
      emissive: 0x000000,
      emissiveIntensity: 0,
      normalScale: new THREE.Vector2(0.5, 0.5),
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, baseMaterial, totalTiles);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMeshRef.current = instancedMesh;

    const dummy = new THREE.Object3D();
    const startX = -gridTotalWidth / 2;
    const startZ = -gridTotalHeight / 2;

    let tileIndex = 0;
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const x = startX + col * tileSize + tileSize / 2;
        const z = startZ + row * tileSize + tileSize / 2;
        const y = tileSize * 0.025;

        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(tileIndex, dummy.matrix);
        instancedMesh.setColorAt(tileIndex, new THREE.Color(0x6b5e4a));

        tilesRef.current.set(tileIndex, {
          id: tileIndex,
          x,
          z,
          gridX: col,
          gridZ: row,
          isSelected: false,
        });

        tileIndex++;
      }
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
    scene.add(instancedMesh);

    const createNumberTexture = (tileNumber: number) => {
      const numberCanvas = document.createElement('canvas');
      numberCanvas.width = 256;
      numberCanvas.height = 256;
      const numberCtx = numberCanvas.getContext('2d');

      if (!numberCtx) {
        const fallbackCanvas = document.createElement('canvas');
        return new THREE.CanvasTexture(fallbackCanvas);
      }

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

    const numberTexturesCache = new Map<number, THREE.Texture>();
    const labelInterval = 20;
    const numberMeshes: THREE.Mesh[] = [];
tileIndex = 0;
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        if (tileIndex % labelInterval === 0) {
          const x = startX + col * tileSize + tileSize / 2;
          const z = startZ + row * tileSize + tileSize / 2;
          const y = tileSize * 0.15;

          let numberTexture = numberTexturesCache.get(tileIndex);
          if (!numberTexture) {
            numberTexture = createNumberTexture(tileIndex);
            numberTexturesCache.set(tileIndex, numberTexture);
          }

          const numberMaterial = new THREE.MeshStandardMaterial({
            map: numberTexture,
            transparent: true,
            side: THREE.DoubleSide,
            emissive: 0x00eaff,
            emissiveIntensity: 0.6,
          });

          const numberGeometry = new THREE.PlaneGeometry(tileSize * 0.8, tileSize * 0.8);
          const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
          numberMesh.position.set(x, y, z);
          numberMesh.rotation.x = -Math.PI / 2.5;

          numberMeshes.push(numberMesh);
          scene.add(numberMesh);
        }

        tileIndex++;
      }
    }

    const groundGeometry = new THREE.PlaneGeometry(gridTotalWidth * 1.3, gridTotalHeight * 1.3);
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      normalMap,
      color: 0x6b5e4a,
      metalness: 0,
      roughness: 0.9,
      normalScale: new THREE.Vector2(0.5, 0.5),
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridLinesGeometry = new THREE.BufferGeometry();
    const gridLinesMaterial = new THREE.LineBasicMaterial({
      color: 0x00eaff,
      linewidth: 1,
      transparent: true,
      opacity: 0.15,
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

    gridLinesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(gridLinesPoints), 3)
    );
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    scene.add(gridLines);

    const gltfLoader = new GLTFLoader();

    const storeSize = 4;
    const storeTileIndex = 10;
    const storeGridX = storeTileIndex % gridWidth;
    const storeGridZ = Math.floor(storeTileIndex / gridWidth);
    const storeCenterGridX = storeGridX + storeSize / 2;
    const storeCenterGridZ = storeGridZ + storeSize / 2;
    const storeWorldX = startX + storeCenterGridX * tileSize;
    const storeWorldZ = startZ + storeCenterGridZ * tileSize;

    blockTiles(storeGridX, storeGridZ, storeSize, storeSize);

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
        normalizeModel(model, storeSize * tileSize);
        applyModelShadowsAndMaterial(model, 0.18, 0.1);

        storeGroup.add(model);
        storeGroup.userData = {
          clickable: true,
          type: 'luxury-store',
          gridX: storeGridX,
          gridZ: storeGridZ,
          sizeX: storeSize,
          sizeZ: storeSize,
        };

        scene.add(storeGroup);
        luxuryStoreRef.current.model = storeGroup;
        luxuryStoreGroupRef.current = storeGroup;

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

    const qgSize = 4;
    const qgGridX = gridWidth / 2 - qgSize / 2;
    const qgGridZ = gridHeight / 2 - qgSize / 2;
    const qgCenterGridX = qgGridX + qgSize / 2;
    const qgCenterGridZ = qgGridZ + qgSize / 2;
    const qgWorldX = startX + qgCenterGridX * tileSize;
    const qgWorldZ = startZ + qgCenterGridZ * tileSize;

    blockTiles(qgGridX, qgGridZ, qgSize, qgSize);

    qgRef.current = {
      position: { x: qgWorldX, z: qgWorldZ },
      gridX: qgGridX,
      gridZ: qgGridZ,
      size: qgSize,
      model: null,
      isClickable: true,
    };

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_938928189a844f56ac340bada0b551bd.glb',
      (gltf) => {
        const model = gltf.scene;
        const qgGroup = new THREE.Group();

        qgGroup.position.set(qgWorldX, 0, qgWorldZ);
        normalizeModel(model, qgSize * tileSize);
        applyModelShadowsAndMaterial(model, 0.18, 0.1);

        qgGroup.add(model);
        qgGroup.userData = {
          clickable: true,
          type: 'qg',
          gridX: qgGridX,
          gridZ: qgGridZ,
          sizeX: qgSize,
          sizeZ: qgSize,
        };

        scene.add(qgGroup);
        qgRef.current.model = qgGroup;
        qgGroupRef.current = qgGroup;

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

customObjects.forEach((customObj, index) => {
      blockTiles(customObj.gridX, customObj.gridZ, customObj.size, customObj.size);

      gltfLoader.load(
        customObj.modelUrl,
        (gltf) => {
          const model = gltf.scene;
          const objGroup = new THREE.Group();

          objGroup.position.set(customObj.position.x, 0, customObj.position.z);
          normalizeModel(model, customObj.size * tileSize);
          applyModelShadowsAndMaterial(model, 0.18, 0.1);

          objGroup.add(model);
          objGroup.userData = {
            clickable: true,
            type: 'custom-object',
            gridX: customObj.gridX,
            gridZ: customObj.gridZ,
            sizeX: customObj.size,
            sizeZ: customObj.size,
          };

          scene.add(objGroup);
          customObjectsRef.current.set(index, objGroup);
        },
        undefined,
        (error) => {
          console.warn(`Failed to load custom object ${index}:`, error);
        }
      );
    });

    const giroWidth = 4;
    const giroDepth = 2;
    const giroGridX = 8;
    const giroGridZ = 9;
    const giroCenterGridX = giroGridX + giroWidth / 2;
    const giroCenterGridZ = giroGridZ + giroDepth / 2;
    const giroWorldX = startX + giroCenterGridX * tileSize;
    const giroWorldZ = startZ + giroCenterGridZ * tileSize;

    blockTiles(giroGridX, giroGridZ, giroWidth, giroDepth);

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_54abdb76d21c4aa0995035679f4f632b.glb',
      (gltf) => {
        const model = gltf.scene;
        const giroGroup = new THREE.Group();

        giroGroup.position.set(giroWorldX, 0, giroWorldZ);
        normalizeModel(model, Math.max(giroWidth * tileSize, giroDepth * tileSize));
        applyModelShadowsAndMaterial(model, 0.18, 0.15);

        giroGroup.add(model);
        giroGroup.userData = {
          clickable: true,
          type: 'giro-no-asfalto',
          gridX: giroGridX,
          gridZ: giroGridZ,
          sizeX: giroWidth,
          sizeZ: giroDepth,
        };

        scene.add(giroGroup);
        giroAsfaltoGroupRef.current = giroGroup;
      },
      undefined,
      (error) => {
        console.warn('Failed to load Giro no Asfalto 3D model:', error);
      }
    );

    const delegaciaSize = 2;
    const delegaciaDepth = 4;
    const delegaciaGridX = 5;
    const delegaciaGridZ = 0;
    const delegaciaCenterGridX = delegaciaGridX + delegaciaSize / 2;
    const delegaciaCenterGridZ = delegaciaGridZ + delegaciaDepth / 2;
    const delegaciaWorldX = startX + delegaciaCenterGridX * tileSize;
    const delegaciaWorldZ = startZ + delegaciaCenterGridZ * tileSize;

    blockTiles(delegaciaGridX, delegaciaGridZ, delegaciaSize, delegaciaDepth);

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_6dad7dc336a548d1b45d2a925a05b458.glb',
      (gltf) => {
        const model = gltf.scene;
        const delegaciaGroup = new THREE.Group();

        delegaciaGroup.position.set(delegaciaWorldX, 0, delegaciaWorldZ);
        normalizeModel(model, Math.max(delegaciaSize * tileSize, delegaciaDepth * tileSize));
        applyModelShadowsAndMaterial(model, 0.12, 0.1);

        delegaciaGroup.add(model);
        delegaciaGroup.userData = {
          clickable: true,
          type: 'delegacia',
          gridX: delegaciaGridX,
          gridZ: delegaciaGridZ,
          sizeX: delegaciaSize,
          sizeZ: delegaciaDepth,
        };

        scene.add(delegaciaGroup);
        delegaciaGroupRef.current = delegaciaGroup;

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

    const centroComercialSize = 4;
    const centroComercialDepth = 2;
    const centroComercialGridX = 32;
    const centroComercialGridZ = 2;
    const centroComercialCenterGridX = centroComercialGridX + centroComercialSize / 2;
    const centroComercialCenterGridZ = centroComercialGridZ + centroComercialDepth / 2;
    const centroComercialWorldX = startX + centroComercialCenterGridX * tileSize;
    const centroComercialWorldZ = startZ + centroComercialCenterGridZ * tileSize;

    blockTiles(
      centroComercialGridX,
      centroComercialGridZ,
      centroComercialSize,
      centroComercialDepth
    );

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_8b894931f3c241f285c4292c4842c4f0.glb',
      (gltf) => {
        const model = gltf.scene;
        const centroComercialGroup = new THREE.Group();

        centroComercialGroup.position.set(centroComercialWorldX, 0, centroComercialWorldZ);
        normalizeModel(
          model,
          Math.max(centroComercialSize * tileSize, centroComercialDepth * tileSize)
        );
        applyModelShadowsAndMaterial(model, 0.18, 0.1);

        centroComercialGroup.add(model);
        centroComercialGroup.userData = {
          clickable: true,
          type: 'centro-comercial',
          gridX: centroComercialGridX,
          gridZ: centroComercialGridZ,
          sizeX: centroComercialSize,
          sizeZ: centroComercialDepth,
        };

        scene.add(centroComercialGroup);
        centroComercialGroupRef.current = centroComercialGroup;

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

const centroComunitarioSize = 4;
    const centroComunitarioDepth = 2;
    const centroComunitarioGridX = 32;
    const centroComunitarioGridZ = 5;
    const centroComunitarioCenterGridX = centroComunitarioGridX + centroComunitarioSize / 2;
    const centroComunitarioCenterGridZ = centroComunitarioGridZ + centroComunitarioDepth / 2;
    const centroComunitarioWorldX = startX + centroComunitarioCenterGridX * tileSize;
    const centroComunitarioWorldZ = startZ + centroComunitarioCenterGridZ * tileSize;

    blockTiles(
      centroComunitarioGridX,
      centroComunitarioGridZ,
      centroComunitarioSize,
      centroComunitarioDepth
    );

    gltfLoader.load(
      'https://static.wixstatic.com/3d/50f4bf_1641be50f6a74954848cfaae281d6b15.glb',
      (gltf) => {
        const model = gltf.scene;
        const centroComunitarioGroup = new THREE.Group();

        centroComunitarioGroup.position.set(centroComunitarioWorldX, 0, centroComunitarioWorldZ);
        normalizeModel(
          model,
          Math.max(centroComunitarioSize * tileSize, centroComunitarioDepth * tileSize)
        );
        applyModelShadowsAndMaterial(model, 0.18, 0.1);

        centroComunitarioGroup.add(model);
        centroComunitarioGroup.userData = {
          clickable: true,
          type: 'centro-comunitario',
          gridX: centroComunitarioGridX,
          gridZ: centroComunitarioGridZ,
          sizeX: centroComunitarioSize,
          sizeZ: centroComunitarioDepth,
        };

        scene.add(centroComunitarioGroup);
        centroComunitarioGroupRef.current = centroComunitarioGroup;

        if (aaa3dSystemRef.current) {
          aaa3dSystemRef.current.applyBuildingVisuals(
            centroComunitarioGroup,
            'centro-comunitario'
          );
          aaa3dSystemRef.current.addGroundShadow(centroComunitarioGroup, 4);
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load Centro Comunitário 3D model:', error);
      }
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    controls.zoomSpeed = 1.2;
    controls.rotateSpeed = 0.8;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.update();
    controlsRef.current = controls;

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMouseClick = () => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      if (delegaciaGroupRef.current) {
        const delegaciaIntersects = raycasterRef.current.intersectObject(
          delegaciaGroupRef.current,
          true
        );

        if (delegaciaIntersects.length > 0) {
          if (level < 10) {
            console.warn('Nível insuficiente para acessar a delegacia');
            return;
          }

          if (level >= 10 && level < 20) {
            navigate('/bribery-investigador');
          } else {
            navigate('/bribery-delegado');
          }
          return;
        }
      }

      if (centroComercialGroupRef.current) {
        const centroComercialIntersects = raycasterRef.current.intersectObject(
          centroComercialGroupRef.current,
          true
        );
        if (centroComercialIntersects.length > 0) {
          navigate('/centro-comercial');
          return;
        }
      }

      if (centroComunitarioGroupRef.current) {
        const centroComunitarioIntersects = raycasterRef.current.intersectObject(
          centroComunitarioGroupRef.current,
          true
        );
        if (centroComunitarioIntersects.length > 0) {
          navigate('/investment-center');
          return;
        }
      }

      if (giroAsfaltoGroupRef.current) {
        const giroIntersects = raycasterRef.current.intersectObject(
          giroAsfaltoGroupRef.current,
          true
        );
        if (giroIntersects.length > 0) {
          if (onGiroClick) {
            onGiroClick();
          } else {
            navigate('/giro-no-asfalto');
          }
          return;
        }
      }

      for (let i = 0; i < customObjects.length; i++) {
        const customObjGroup = customObjectsRef.current.get(i);
        if (customObjGroup) {
          const customIntersects = raycasterRef.current.intersectObject(customObjGroup, true);
          if (customIntersects.length > 0) {
            customObjects[i].onClickCallback?.();
            return;
          }
        }
      }

      if (qgGroupRef.current) {
        const qgIntersects = raycasterRef.current.intersectObject(qgGroupRef.current, true);
        if (qgIntersects.length > 0) {
          onQGClick?.();
          return;
        }
      }

      if (luxuryStoreGroupRef.current) {
        const storeIntersects = raycasterRef.current.intersectObject(
          luxuryStoreGroupRef.current,
          true
        );
        if (storeIntersects.length > 0) {
          onLuxuryStoreClick?.();
          return;
        }
      }

      const intersects = raycasterRef.current.intersectObject(instancedMesh);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const instanceId = intersection.instanceId;

        if (instanceId !== undefined) {
          const tileData = tilesRef.current.get(instanceId);
          if (!tileData) return;

          const tileKey = `${tileData.gridX}-${tileData.gridZ}`;
          if (blockedTilesRef.current.has(tileKey)) {
            return;
          }

          if (
            selectedTileRef.current !== null &&
            selectedTileRef.current !== instanceId &&
            instancedMesh.instanceColor
          ) {
            instancedMesh.setColorAt(selectedTileRef.current, new THREE.Color(0x6b5e4a));
          }

          selectedTileRef.current = instanceId;
          if (instancedMesh.instanceColor) {
            instancedMesh.setColorAt(instanceId, new THREE.Color(0x00eaff));
            instancedMesh.instanceColor.needsUpdate = true;
          }

          onTileSelect?.(instanceId, { x: tileData.x, z: tileData.z });
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);

    let animationFrameId = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      if (aaa3dSystemRef.current) {
        aaa3dSystemRef.current.update(0.016);
      }

      renderer.render(scene, camera);
    };

    animate();

    const onWindowResize = () => {
      if (!containerRef.current) return;

      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', onWindowResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onMouseClick);

      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }

      numberMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose());
        } else {
          mesh.material.dispose();
        }
      });

      numberTexturesCache.forEach((texture) => texture.dispose());

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

      if (aaa3dSystemRef.current) {
        aaa3dSystemRef.current.dispose();
      }
    };
  }, [
    gridWidth,
    gridHeight,
    tileSize,
    onTileSelect,
    onLuxuryStoreClick,
    onQGClick,
    onGiroClick,
    customObjects,
    level,
    navigate,
  ]);

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