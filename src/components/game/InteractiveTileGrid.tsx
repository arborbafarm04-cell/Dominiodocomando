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

  const luxuryStoreGroupRef = useRef<THREE.Group | null>(null);
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
    scene.fog = new THREE.Fog(0xaecbff, 300, 1200);
    sceneRef.current = scene;

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
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const light = new THREE.DirectionalLight(0xffffff, 1.8);
    light.position.set(30, 60, 30);
    light.castShadow = true;
    scene.add(light);

    const aaa3dSystem = new AAA3DVisualSystem(scene, camera, renderer);
    aaa3dSystemRef.current = aaa3dSystem;
const totalTiles = gridWidth * gridHeight;

    const geometry = new THREE.BoxGeometry(tileSize * 0.9, tileSize * 0.05, tileSize * 0.9);

    const material = new THREE.MeshStandardMaterial({
      color: 0x6b5e4a,
      roughness: 0.9,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, totalTiles);
    instancedMeshRef.current = instancedMesh;

    const dummy = new THREE.Object3D();

    const startX = -(gridWidth * tileSize) / 2;
    const startZ = -(gridHeight * tileSize) / 2;

    let tileIndex = 0;

    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const x = startX + col * tileSize + tileSize / 2;
        const z = startZ + row * tileSize + tileSize / 2;

        dummy.position.set(x, tileSize * 0.025, z);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(tileIndex, dummy.matrix);

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

    scene.add(instancedMesh);
const loader = new GLTFLoader();

    // 🔥 EXEMPLO: BARRACO DO JOGADOR (4 tiles)
    const playerLot = {
      gridX: 10,
      gridZ: 10,
      size: 2,
    };

    const worldX = startX + (playerLot.gridX + playerLot.size / 2) * tileSize;
    const worldZ = startZ + (playerLot.gridZ + playerLot.size / 2) * tileSize;

    loader.load(
      'https://static.wixstatic.com/3d/50f4bf_a1a58716fad74a4999b6a3aba5cddf58.glb',
      (gltf) => {
        const model = gltf.scene;
        const group = new THREE.Group();

        group.position.set(worldX, 0, worldZ);

        group.add(model);

        group.userData = {
          type: 'player-house',
        };

        scene.add(group);
        customObjectsRef.current.set(999, group);
      }
    );
const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const onMouseClick = () => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      customObjectsRef.current.forEach((obj) => {
        const hit = raycasterRef.current.intersectObject(obj, true);
        if (hit.length > 0) {
          if (obj.userData.type === 'player-house') {
            navigate('/barraco');
          }
        }
      });
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default InteractiveTileGrid;