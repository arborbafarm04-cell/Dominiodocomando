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
  baseColor: number;
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

type TileMeshType = 'city' | 'favela';

interface SelectedTileState {
  meshType: TileMeshType;
  instanceId: number;
  baseColor: number;
}

const CITY_COLUMNS = 12;

const CITY_PUBLIC_URL =
  'https://static.wixstatic.com/3d/50f4bf_1a5a9a81968042478a64c8b5caeb21a3.glb';
const CITY_ESCAPE_URL =
  'https://static.wixstatic.com/3d/50f4bf_21ef47408bff4064941472d2d1c69e1f.glb';
const CITY_DELEGACIA_URL =
  'https://static.wixstatic.com/3d/50f4bf_6dad7dc336a548d1b45d2a925a05b458.glb';
const CITY_LUXURY_URL =
  'https://static.wixstatic.com/3d/50f4bf_a1c5504b55da47a68d0791f09a727c6d.glb';
const CITY_CASINO_URL =
  'https://static.wixstatic.com/3d/50f4bf_72a09eca48ec4c6f94800c544ce48b7c.glb';

const FAVELA_ARSENAL_URL =
  'https://static.wixstatic.com/3d/50f4bf_38998cb1b4504662bb1a4fdd04855a51.glb';
const FAVELA_CENTER_URL =
  'https://static.wixstatic.com/3d/50f4bf_c1767574dcea4e1496b78e40ca0bdb4a.glb';
const FAVELA_CREW_URL =
  'https://static.wixstatic.com/3d/50f4bf_511c2bd4c8234388a4cd1c98f4f3b2b5.glb';
const FAVELA_COMMERCIAL_URL =
  'https://static.wixstatic.com/3d/50f4bf_8b894931f3c241f285c4292c4842c4f0.glb';

const QG_URL =
  'https://static.wixstatic.com/3d/50f4bf_80e265d5ce944a9180d32c2e52a39179.glb';
const VIATURA_URL =
  'https://static.wixstatic.com/3d/50f4bf_1719b6e671e54eb8af6706753ffa77dc.glb';

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
  const cityMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const favelaMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const tilesRef = useRef<Map<string, TileData>>(new Map());
  const selectedTileRef = useRef<SelectedTileState | null>(null);
  const blockedTilesRef = useRef<Set<string>>(new Set());
  const controlsRef = useRef<OrbitControls | null>(null);
  const aaa3dSystemRef = useRef<AAA3DVisualSystem | null>(null);

  const qgGroupRef = useRef<THREE.Group | null>(null);
  const delegaciaGroupRef = useRef<THREE.Group | null>(null);
  const publicBuildingGroupRef = useRef<THREE.Group | null>(null);
  const luxuryStoreGroupRef = useRef<THREE.Group | null>(null);
  const casinoGroupRef = useRef<THREE.Group | null>(null);
  const viaturaGroupRef = useRef<THREE.Group | null>(null);
  const favelaCenterGroupRef = useRef<THREE.Group | null>(null);
  const commercialGroupRef = useRef<THREE.Group | null>(null);
  const customObjectsRef = useRef<Map<number, THREE.Group>>(new Map());

  const navigate = useNavigate();
  const player = usePlayerStore((state) => state.player);
  const level = player?.level ?? 1;

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080d);
    // BLOCO 9 — FOG (PROFUNDO)
    scene.fog = new THREE.Fog(0x09111a, 25, 110);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const gridTotalWidth = gridWidth * tileSize;
    const gridTotalHeight = gridHeight * tileSize;
    const startX = -gridTotalWidth / 2;
    const startZ = -gridTotalHeight / 2;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // NOVA CÂMERA (mais próxima e cinematográfica)
    camera.position.set(6, 16, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    containerRef.current.appendChild(renderer.domElement);

    // BLOCO 7 — LUZ GLOBAL (ESSENCIAL)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xcfe8ff, 3.5);
    moonLight.position.set(20, 40, 20);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.left = -60;
    moonLight.shadow.camera.right = 60;
    moonLight.shadow.camera.top = 60;
    moonLight.shadow.camera.bottom = -60;
    moonLight.shadow.camera.far = 150;
    moonLight.shadow.bias = -0.00012;
    scene.add(moonLight);

    const blueLight = new THREE.DirectionalLight(0x00eaff, 1.5);
    blueLight.position.set(-20, 10, -10);
    scene.add(blueLight);

    const warmLight = new THREE.DirectionalLight(0xffa64d, 2);
    warmLight.position.set(10, 10, 10);
    scene.add(warmLight);

    // ... keep existing code (rimLight and other lights)

    const centerGlow = new THREE.PointLight(0x00eaff, 3.0, 28, 2);
    centerGlow.position.set(0, 5, 0);
    scene.add(centerGlow);

    const warmCenterAccent = new THREE.PointLight(0xff9a3d, 1.6, 18, 2);
    warmCenterAccent.position.set(0, 3, 0);
    scene.add(warmCenterAccent);

    const aaa3dSystem = new AAA3DVisualSystem(scene, camera, renderer);
    aaa3dSystemRef.current = aaa3dSystem;

    // BLOCO 2 — SKYLINE (ACABA COM O FUNDO PRETO)
    const skylineGroup = new THREE.Group();

    for (let i = 0; i < 25; i++) {
      const height = 10 + Math.random() * 25;

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(2 + Math.random() * 2, height, 2 + Math.random() * 2),
        new THREE.MeshStandardMaterial({
          color: 0x111826,
          roughness: 1,
          metalness: 0,
          emissive: 0x05080f,
          emissiveIntensity: 0.2,
        })
      );

      building.position.set(
        -60 + i * 5,
        height / 2,
        -40
      );

      skylineGroup.add(building);
    }

    scene.add(skylineGroup);

    // ... keep existing code (createUrbanSkyline function)

    // BLOCO 3 — GLOW URBANO (ATMOSFERA)
    const createGlow = (color: number, x: number) => {
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 40),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        })
      );

      glow.position.set(x, 20, -30);
      scene.add(glow);
    };

    // cidade (frio)
    createGlow(0x00cfff, -10);

    // favela (quente)
    createGlow(0xff7a2f, 20);

    // central leve
    createGlow(0x00eaff, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.target.set(0, 0, 0);
    
    // BLOCO 1 — CÂMERA CINEMATOGRÁFICA (ESSENCIAL)
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.minDistance = 12;
    controls.maxDistance = 38;

    controls.minPolarAngle = Math.PI / 4.5;
    controls.maxPolarAngle = Math.PI / 2.2;
    
    // ... keep existing code (zoomSpeed, rotateSpeed, azimuth angles)
    controls.zoomSpeed = 1.15;
    controls.rotateSpeed = 0.75;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.update();
    controlsRef.current = controls;

    const createGroundCanvas = (mode: 'dirt' | 'asphalt') => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      if (!ctx) return canvas;

      if (mode === 'asphalt') {
        ctx.fillStyle = '#2a2d32';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 350; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 4 + 1;
          const shade = Math.floor(Math.random() * 60 + 60);
          ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.22)`;
          ctx.fillRect(x, y, size, size);
        }

        for (let i = 0; i < 30; i++) {
          const y = Math.random() * canvas.height;
          const w = Math.random() * 180 + 90;
          const x = Math.random() * (canvas.width - w);
          ctx.fillStyle = 'rgba(15,15,15,0.18)';
          ctx.fillRect(x, y, w, 3);
        }
      } else {
        ctx.fillStyle = '#6b5e4a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 200; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 40 + 10;
          const variation = Math.random() * 0.15 - 0.075;
          ctx.fillStyle = `rgba(107, 94, 74, ${0.3 + variation})`;
          ctx.fillRect(x, y, size, size);
        }

        for (let i = 0; i < 120; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const grassLength = Math.random() * 10 + 3;
          ctx.strokeStyle = `rgba(84, 104, 62, ${0.35 + Math.random() * 0.3})`;
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
          ctx.fillStyle = `rgba(${stoneShade}, ${stoneShade - 5}, ${stoneShade - 10}, ${
            0.6 + Math.random() * 0.3
          })`;
          ctx.beginPath();
          ctx.arc(x, y, stoneSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      return canvas;
    };

    const makeTexture = (canvas: HTMLCanvasElement) => {
      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };

    const dirtTexture = makeTexture(createGroundCanvas('dirt'));
    const asphaltTexture = makeTexture(createGroundCanvas('asphalt'));

    const tileGeometry = new THREE.BoxGeometry(tileSize * 0.92, tileSize * 0.08, tileSize * 0.92);

    // BLOCO 5 — ASFALTO MAIS VIVO (CIDADE)
    const cityMaterial = new THREE.MeshStandardMaterial({
      map: asphaltTexture,
      color: 0x3a3f46,
      roughness: 0.55,
      metalness: 0.28,
      emissive: 0x11151a,
      emissiveIntensity: 0.25,
    });

    // BLOCO 6 — FAVELA MAIS ORGÂNICA
    const favelaMaterial = new THREE.MeshStandardMaterial({
      map: dirtTexture,
      color: 0x5a4c3b,
      roughness: 0.95,
      metalness: 0.05,
      emissive: 0x120d08,
      emissiveIntensity: 0.12,
    });

    const cityTileCount = CITY_COLUMNS * gridHeight;
    const favelaTileCount = (gridWidth - CITY_COLUMNS) * gridHeight;

    const cityMesh = new THREE.InstancedMesh(tileGeometry, cityMaterial, cityTileCount);
    const favelaMesh = new THREE.InstancedMesh(tileGeometry, favelaMaterial, favelaTileCount);

    cityMesh.castShadow = true;
    cityMesh.receiveShadow = true;
    favelaMesh.castShadow = true;
    favelaMesh.receiveShadow = true;

    cityMesh.userData.meshType = 'city';
    favelaMesh.userData.meshType = 'favela';

    cityMeshRef.current = cityMesh;
    favelaMeshRef.current = favelaMesh;

    const asphaltStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(CITY_COLUMNS * tileSize, gridTotalHeight),
      new THREE.MeshStandardMaterial({
        map: asphaltTexture,
        color: 0x1f2329,
        roughness: 0.45,
        metalness: 0.4,
        emissive: new THREE.Color(0x0a0f15),
        emissiveIntensity: 0.25,
      })
    );
    asphaltStrip.rotation.x = -Math.PI / 2;
    asphaltStrip.position.set(
      startX + (CITY_COLUMNS * tileSize) / 2,
      -0.03,
      startZ + gridTotalHeight / 2
    );
    asphaltStrip.receiveShadow = true;
    scene.add(asphaltStrip);

    // BLOCO 4 — RODOVIA ENTRE CIDADE E FAVELA
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(4, gridHeight * tileSize),
      new THREE.MeshStandardMaterial({
        color: 0x1a1d22,
        roughness: 0.6,
        metalness: 0.3,
        emissive: 0x0a0f14,
        emissiveIntensity: 0.2,
      })
    );

    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, 0);

    scene.add(road);

    const cityGlowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(CITY_COLUMNS * tileSize, gridTotalHeight),
      new THREE.MeshBasicMaterial({
        color: 0x00bfff,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    cityGlowPlane.rotation.x = -Math.PI / 2;
    cityGlowPlane.position.set(
      startX + (CITY_COLUMNS * tileSize) / 2,
      0.02,
      startZ + gridTotalHeight / 2
    );
    scene.add(cityGlowPlane);

    const favelaBase = new THREE.Mesh(
      new THREE.PlaneGeometry((gridWidth - CITY_COLUMNS) * tileSize, gridTotalHeight),
      new THREE.MeshStandardMaterial({
        map: dirtTexture,
        color: 0x7a6d52,
        roughness: 0.98,
        metalness: 0,
        emissive: new THREE.Color(0x2a1f15),
        emissiveIntensity: 0.15,
      })
    );
    favelaBase.rotation.x = -Math.PI / 2;
    favelaBase.position.set(
      startX + CITY_COLUMNS * tileSize + ((gridWidth - CITY_COLUMNS) * tileSize) / 2,
      -0.04,
      startZ + gridTotalHeight / 2
    );
    favelaBase.receiveShadow = true;
    scene.add(favelaBase);

    const centerDisc = new THREE.Mesh(
      new THREE.CircleGeometry(6, 32),
      new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    centerDisc.rotation.x = -Math.PI / 2;
    centerDisc.position.set(0, 0.03, 0);
    scene.add(centerDisc);

    const dummy = new THREE.Object3D();
    let cityIndex = 0;
    let favelaIndex = 0;

    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        const x = startX + col * tileSize + tileSize / 2;
        const z = startZ + row * tileSize + tileSize / 2;
        const y = tileSize * 0.04;
        const isCity = col < CITY_COLUMNS;

        dummy.position.set(x, y, z);
        dummy.updateMatrix();

        const baseColor = isCity ? 0x4b5159 : 0x6b5e4a;

        if (isCity) {
          cityMesh.setMatrixAt(cityIndex, dummy.matrix);
          cityMesh.setColorAt(cityIndex, new THREE.Color(baseColor));
          tilesRef.current.set(`city-${cityIndex}`, {
            id: cityIndex,
            x,
            z,
            gridX: col,
            gridZ: row,
            baseColor,
          });
          cityIndex++;
        } else {
          favelaMesh.setMatrixAt(favelaIndex, dummy.matrix);
          favelaMesh.setColorAt(favelaIndex, new THREE.Color(baseColor));
          tilesRef.current.set(`favela-${favelaIndex}`, {
            id: favelaIndex,
            x,
            z,
            gridX: col,
            gridZ: row,
            baseColor,
          });
          favelaIndex++;
        }
      }
    }

    cityMesh.instanceMatrix.needsUpdate = true;
    favelaMesh.instanceMatrix.needsUpdate = true;
    if (cityMesh.instanceColor) cityMesh.instanceColor.needsUpdate = true;
    if (favelaMesh.instanceColor) favelaMesh.instanceColor.needsUpdate = true;

    scene.add(cityMesh);
    scene.add(favelaMesh);
const gridLinesGeometry = new THREE.BufferGeometry();
    const gridLinesMaterial = new THREE.LineBasicMaterial({
      color: 0x8ec6ff,
      transparent: true,
      opacity: 0.15,
    });
    const gridLinesPoints: number[] = [];

    for (let i = 0; i <= gridWidth; i++) {
      const pos = startX + i * tileSize;
      gridLinesPoints.push(pos, 0.03, startZ);
      gridLinesPoints.push(pos, 0.03, startZ + gridTotalHeight);
    }

    for (let i = 0; i <= gridHeight; i++) {
      const pos = startZ + i * tileSize;
      gridLinesPoints.push(startX, 0.03, pos);
      gridLinesPoints.push(startX + gridTotalWidth, 0.03, pos);
    }

    gridLinesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(gridLinesPoints), 3)
    );
    const gridLines = new THREE.LineSegments(gridLinesGeometry, gridLinesMaterial);
    scene.add(gridLines);

    const createLampPost = (x: number, z: number) => {
      const postGroup = new THREE.Group();

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 3.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x2d2d2d, roughness: 0.9 })
      );
      post.position.y = 1.6;
      post.castShadow = true;
      postGroup.add(post);

      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xffd27a,
          emissive: 0xffbb55,
          emissiveIntensity: 3.2,
        })
      );
      lamp.position.set(0, 3.15, 0);
      postGroup.add(lamp);

      const pointLight = new THREE.PointLight(0xffd48a, 3.8, 20, 2);
      pointLight.position.set(0, 3.1, 0);
      postGroup.add(pointLight);

      postGroup.position.set(x, 0, z);
      scene.add(postGroup);

      return postGroup;
    };

    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x121212,
      transparent: true,
      opacity: 0.7,
    });

    const postPositions: THREE.Vector3[] = [];
    for (let i = 0; i < 6; i++) {
      const px = startX + (CITY_COLUMNS + 2 + i * 4) * tileSize;
      const pz = startZ + 2.5 * tileSize;
      postPositions.push(new THREE.Vector3(px, 3.1, pz));
      createLampPost(px, startZ + 2.5 * tileSize);

      const px2 = startX + (CITY_COLUMNS + 3 + i * 4) * tileSize;
      const pz2 = startZ + 16.5 * tileSize;
      postPositions.push(new THREE.Vector3(px2, 3.1, pz2));
      createLampPost(px2, startZ + 16.5 * tileSize);
    }

    for (let i = 0; i < postPositions.length - 1; i++) {
      const a = postPositions[i];
      const b = postPositions[i + 1];
      const curve = new THREE.CatmullRomCurve3([
        a.clone(),
        a.clone().add(new THREE.Vector3(0, -0.35 - Math.random() * 0.35, 0)),
        b.clone().add(new THREE.Vector3(0, -0.25 - Math.random() * 0.45, 0)),
        b.clone(),
      ]);
      const points = curve.getPoints(18);
      const wireGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const wire = new THREE.Line(wireGeometry, wireMaterial);
      scene.add(wire);
    }

    const addGrassTuft = (x: number, z: number) => {
      const tuft = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.28 + Math.random() * 0.12, 0.03),
          new THREE.MeshStandardMaterial({
            color: 0x5b7d44,
            roughness: 1,
          })
        );
        blade.position.set(
          (Math.random() - 0.5) * 0.18,
          0.12 + Math.random() * 0.08,
          (Math.random() - 0.5) * 0.18
        );
        blade.rotation.z = (Math.random() - 0.5) * 0.35;
        tuft.add(blade);
      }
      tuft.position.set(x, 0.06, z);
      scene.add(tuft);
    };

    for (let i = 0; i < 90; i++) {
      const gx = CITY_COLUMNS + Math.floor(Math.random() * (gridWidth - CITY_COLUMNS));
      const gz = Math.floor(Math.random() * gridHeight);
      addGrassTuft(startX + gx * tileSize + tileSize / 2, startZ + gz * tileSize + tileSize / 2);
    }

    // TAREFA 7 — MELHORAR O CHÃO (Detritos e variação visual)
    const addDebris = (x: number, z: number) => {
      const debrisGroup = new THREE.Group();
      const debrisSize = 0.15 + Math.random() * 0.1;
      const debrisMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0, 0, 0.15 + Math.random() * 0.1),
        roughness: 0.95,
        metalness: 0,
      });

      const debris = new THREE.Mesh(
        new THREE.BoxGeometry(debrisSize, debrisSize * 0.3, debrisSize),
        debrisMaterial
      );
      debris.rotation.z = Math.random() * Math.PI;
      debrisGroup.add(debris);
      debrisGroup.position.set(x, 0.08, z);
      scene.add(debrisGroup);
    };

    // Adicionar detritos na favela
    for (let i = 0; i < 60; i++) {
      const gx = CITY_COLUMNS + Math.floor(Math.random() * (gridWidth - CITY_COLUMNS));
      const gz = Math.floor(Math.random() * gridHeight);
      addDebris(startX + gx * tileSize + tileSize / 2, startZ + gz * tileSize + tileSize / 2);
    }

    // TAREFA 8 — JANELAS E VIDA NOS PRÉDIOS (Point lights para simular atividade)
    const addBuildingLights = (groupRef: React.MutableRefObject<THREE.Group | null>) => {
      if (!groupRef.current) return;

      const lightCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < lightCount; i++) {
        const light = new THREE.PointLight(
          Math.random() > 0.5 ? 0xffdd99 : 0x00ccff,
          1.2 + Math.random() * 0.8,
          12,
          2
        );
        light.position.set(
          (Math.random() - 0.5) * 2,
          2 + Math.random() * 3,
          (Math.random() - 0.5) * 2
        );
        groupRef.current.add(light);
      }
    };

    const gltfLoader = new GLTFLoader();

    const blockTiles = (startGridX: number, startGridZ: number, sizeX: number, sizeZ: number) => {
      for (let x = 0; x < sizeX; x++) {
        for (let z = 0; z < sizeZ; z++) {
          blockedTilesRef.current.add(`${startGridX + x}-${startGridZ + z}`);
        }
      }
    };

    const normalizeModel = (
      model: THREE.Group,
      targetX: number,
      targetZ: number,
      rotateY = 0
    ) => {
      const bbox = new THREE.Box3().setFromObject(model);
      const size = bbox.getSize(new THREE.Vector3());

      const scaleX = targetX / Math.max(size.x, 0.001);
      const scaleZ = targetZ / Math.max(size.z, 0.001);
      const scale = Math.min(scaleX, scaleZ);

      model.scale.set(scale, scale, scale);

      bbox.setFromObject(model);
      const center = bbox.getCenter(new THREE.Vector3());
      model.position.sub(center);

      bbox.setFromObject(model);
      model.position.y -= bbox.min.y;

      model.rotation.y = rotateY;
    };

    const applyModelLook = (model: THREE.Group, emissiveIntensity = 0.3) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissiveIntensity = emissiveIntensity;
            child.material.metalness = Math.max(0, child.material.metalness - 0.12);
            child.material.roughness = Math.min(1, child.material.roughness + 0.08);
          }
        }
      });
    };

    const addBuilding = ({
      url,
      gridX,
      gridZ,
      sizeX,
      sizeZ,
      rotateY,
      clickable,
      onLoaded,
    }: {
      url: string;
      gridX: number;
      gridZ: number;
      sizeX: number;
      sizeZ: number;
      rotateY: number;
      clickable: boolean;
      onLoaded?: (group: THREE.Group) => void;
    }) => {
      blockTiles(gridX, gridZ, sizeX, sizeZ);

      const worldX = startX + (gridX + sizeX / 2) * tileSize;
      const worldZ = startZ + (gridZ + sizeZ / 2) * tileSize;

      gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          const group = new THREE.Group();

          normalizeModel(model, sizeX * tileSize, sizeZ * tileSize, rotateY);
          applyModelLook(model);

          group.add(model);
          group.position.set(worldX, 0, worldZ);
          group.userData = { clickable };

          scene.add(group);

          if (aaa3dSystemRef.current) {
            aaa3dSystemRef.current.applyBuildingVisuals(group, 'building');
            aaa3dSystemRef.current.addGroundShadow(group, Math.max(sizeX, sizeZ));
          }

          // BLOCO 8 — PRÉDIOS COM VIDA
          const light = new THREE.PointLight(0xffffff, 1.2, 6);
          light.position.set(0, 2, 0);
          group.add(light);

          const neon = new THREE.PointLight(0x00eaff, 0.8, 5);
          neon.position.set(0, 1.5, 0);
          group.add(neon);

          onLoaded?.(group);
        },
        undefined,
        (error) => {
          console.warn('Erro carregando prédio:', url, error);
        }
      );
    };

    // CIDADE - ESQUERDA
    addBuilding({
      url: CITY_PUBLIC_URL,
      gridX: 1,
      gridZ: 1,
      sizeX: 2,
      sizeZ: 4,
      rotateY: Math.PI / 2,
      clickable: true,
      onLoaded: (group) => {
        publicBuildingGroupRef.current = group;
        addBuildingLights(publicBuildingGroupRef);
      },
    });

    addBuilding({
      url: CITY_ESCAPE_URL,
      gridX: 1,
      gridZ: 6,
      sizeX: 2,
      sizeZ: 4,
      rotateY: Math.PI / 2,
      clickable: false,
      onLoaded: (group) => {
        addBuildingLights({ current: group });
      },
    });

    addBuilding({
      url: CITY_DELEGACIA_URL,
      gridX: 1,
      gridZ: 11,
      sizeX: 2,
      sizeZ: 4,
      rotateY: Math.PI / 2,
      clickable: true,
      onLoaded: (group) => {
        delegaciaGroupRef.current = group;
        addBuildingLights(delegaciaGroupRef);
      },
    });

    addBuilding({
      url: CITY_LUXURY_URL,
      gridX: 5,
      gridZ: 2,
      sizeX: 2,
      sizeZ: 4,
      rotateY: Math.PI / 2,
      clickable: true,
      onLoaded: (group) => {
        luxuryStoreGroupRef.current = group;
        addBuildingLights(luxuryStoreGroupRef);
      },
    });

    addBuilding({
      url: CITY_CASINO_URL,
      gridX: 5,
      gridZ: 9,
      sizeX: 2,
      sizeZ: 4,
      rotateY: Math.PI / 2,
      clickable: true,
      onLoaded: (group) => {
        casinoGroupRef.current = group;
        addBuildingLights(casinoGroupRef);
      },
    });

    addBuilding({
      url: VIATURA_URL,
      gridX: 9,
      gridZ: 7,
      sizeX: 2,
      sizeZ: 2,
      rotateY: Math.PI / 2,
      clickable: true,
      onLoaded: (group) => {
        viaturaGroupRef.current = group;
        addBuildingLights(viaturaGroupRef);
      },
    });

    // FAVELA - DIREITA
    addBuilding({
      url: FAVELA_ARSENAL_URL,
      gridX: 37,
      gridZ: 1,
      sizeX: 2,
      sizeZ: 4,
      rotateY: -Math.PI / 2,
      clickable: false,
      onLoaded: (group) => {
        addBuildingLights({ current: group });
      },
    });

    addBuilding({
      url: FAVELA_CENTER_URL,
      gridX: 37,
      gridZ: 6,
      sizeX: 2,
      sizeZ: 4,
      rotateY: -Math.PI / 2,
      clickable: true,
      onLoaded: (group) => {
        favelaCenterGroupRef.current = group;
        addBuildingLights(favelaCenterGroupRef);
      },
    });

    addBuilding({
      url: FAVELA_CREW_URL,
      gridX: 37,
      gridZ: 11,
      sizeX: 2,
      sizeZ: 4,
      rotateY: -Math.PI / 2,
      clickable: false,
      onLoaded: (group) => {
        addBuildingLights({ current: group });
      },
    });

    addBuilding({
      url: FAVELA_COMMERCIAL_URL,
      gridX: 33,
      gridZ: 8,
      sizeX: 2,
      sizeZ: 4,
      rotateY: -Math.PI / 2,
      clickable: true,
      onLoaded: (group) => {
        commercialGroupRef.current = group;
        addBuildingLights(commercialGroupRef);
      },
    });

    // QG NO CENTRO
    addBuilding({
      url: QG_URL,
      gridX: 18,
      gridZ: 8,
      sizeX: 4,
      sizeZ: 4,
      rotateY: 0,
      clickable: true,
      onLoaded: (group) => {
        qgGroupRef.current = group;
        addBuildingLights(qgGroupRef);
      },
    });

    // BARRACO DO JOGADOR / CUSTOM OBJECTS
    customObjects.forEach((customObj, index) => {
      const sizeX = customObj.size;
      const sizeZ = customObj.size;

      blockTiles(customObj.gridX, customObj.gridZ, sizeX, sizeZ);

      const worldX = startX + (customObj.gridX + sizeX / 2) * tileSize;
      const worldZ = startZ + (customObj.gridZ + sizeZ / 2) * tileSize;

      gltfLoader.load(
        customObj.modelUrl,
        (gltf) => {
          const model = gltf.scene;
          const group = new THREE.Group();

          normalizeModel(model, sizeX * tileSize, sizeZ * tileSize, 0);
          applyModelLook(model, 0.22);

          group.add(model);
          group.position.set(worldX, 0, worldZ);
          group.userData = {
            clickable: customObj.isClickable,
            type: customObj.onClickCallback ? 'custom-object' : 'player-house',
          };

          scene.add(group);
          customObjectsRef.current.set(index, group);

          if (aaa3dSystemRef.current) {
            aaa3dSystemRef.current.applyBuildingVisuals(group, 'house');
            aaa3dSystemRef.current.addGroundShadow(group, Math.max(sizeX, sizeZ));
          }
        },
        undefined,
        (error) => {
          console.warn('Erro carregando custom object:', error);
        }
      );
    });

    const getMeshByType = (type: TileMeshType) => (type === 'city' ? cityMesh : favelaMesh);

    const restoreSelectedTile = () => {
      if (!selectedTileRef.current) return;

      const prevMesh = getMeshByType(selectedTileRef.current.meshType);
      if (prevMesh.instanceColor) {
        prevMesh.setColorAt(
          selectedTileRef.current.instanceId,
          new THREE.Color(selectedTileRef.current.baseColor)
        );
        prevMesh.instanceColor.needsUpdate = true;
      }
    };

    const setSelectedTile = (meshType: TileMeshType, instanceId: number, baseColor: number) => {
      restoreSelectedTile();

      const mesh = getMeshByType(meshType);
      if (mesh.instanceColor) {
        mesh.setColorAt(instanceId, new THREE.Color(0x00eaff));
        mesh.instanceColor.needsUpdate = true;
      }

      selectedTileRef.current = { meshType, instanceId, baseColor };
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

const onMouseClick = () => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      if (viaturaGroupRef.current) {
        const hit = raycasterRef.current.intersectObject(viaturaGroupRef.current, true);
        if (hit.length > 0) {
          navigate('/bribery-guard');
          return;
        }
      }

      if (delegaciaGroupRef.current) {
        const hit = raycasterRef.current.intersectObject(delegaciaGroupRef.current, true);
        if (hit.length > 0) {
          if (level < 10) return;
          if (level >= 10 && level < 20) {
            navigate('/bribery-investigador');
          } else {
            navigate('/bribery-delegado');
          }
          return;
        }
      }

      if (publicBuildingGroupRef.current) {
        const hit = raycasterRef.current.intersectObject(publicBuildingGroupRef.current, true);
        if (hit.length > 0) {
          if (level >= 90) navigate('/bribery-presidente');
          else if (level >= 80) navigate('/bribery-governador');
          else if (level >= 70) navigate('/bribery-secretario');
          else if (level >= 60) navigate('/bribery-juiz');
          else if (level >= 50) navigate('/bribery-promotor');
          else if (level >= 40) navigate('/bribery-prefeito');
          else if (level >= 30) navigate('/bribery-vereador');
          return;
        }
      }

      if (luxuryStoreGroupRef.current) {
        const hit = raycasterRef.current.intersectObject(luxuryStoreGroupRef.current, true);
        if (hit.length > 0) {
          onLuxuryStoreClick?.();
          return;
        }
      }

      if (casinoGroupRef.current) {
        const hit = raycasterRef.current.intersectObject(casinoGroupRef.current, true);
        if (hit.length > 0) {
          onGiroClick?.();
          return;
        }
      }

      if (favelaCenterGroupRef.current) {
        const hit = raycasterRef.current.intersectObject(favelaCenterGroupRef.current, true);
        if (hit.length > 0) {
          navigate('/investment-center');
          return;
        }
      }

      if (commercialGroupRef.current) {
        const hit = raycasterRef.current.intersectObject(commercialGroupRef.current, true);
        if (hit.length > 0) {
          navigate('/money-laundering');
          return;
        }
      }

      if (qgGroupRef.current) {
        const hit = raycasterRef.current.intersectObject(qgGroupRef.current, true);
        if (hit.length > 0) {
          onQGClick?.();
          return;
        }
      }

      for (let i = 0; i < customObjects.length; i++) {
        const group = customObjectsRef.current.get(i);
        if (!group) continue;

        const hit = raycasterRef.current.intersectObject(group, true);
        if (hit.length > 0) {
          if (group.userData.type === 'player-house') {
            navigate('/barraco');
            return;
          }

          if (group.userData.type === 'custom-object') {
            customObjects[i].onClickCallback?.();
            return;
          }
        }
      }

      const cityHits = raycasterRef.current.intersectObject(cityMesh);
      const favelaHits = raycasterRef.current.intersectObject(favelaMesh);
      const hit = cityHits[0] || favelaHits[0];

      if (!hit || hit.instanceId === undefined) return;

      const meshType = (hit.object.userData.meshType || 'favela') as TileMeshType;
      const tileData = tilesRef.current.get(`${meshType}-${hit.instanceId}`);

      if (!tileData) return;
      if (blockedTilesRef.current.has(`${tileData.gridX}-${tileData.gridZ}`)) return;

      setSelectedTile(meshType, hit.instanceId, tileData.baseColor);
      onTileSelect?.(hit.instanceId, { x: tileData.x, z: tileData.z });
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

      controls.dispose();
      renderer.dispose();
      tileGeometry.dispose();
      cityMaterial.dispose();
      favelaMaterial.dispose();
      gridLinesGeometry.dispose();
      gridLinesMaterial.dispose();
      dirtTexture.dispose();
      asphaltTexture.dispose();

      if (aaa3dSystemRef.current) {
        aaa3dSystemRef.current.dispose();
      }
    };
  }, [
    customObjects,
    gridHeight,
    gridWidth,
    level,
    navigate,
    onGiroClick,
    onLuxuryStoreClick,
    onQGClick,
    onTileSelect,
    tileSize,
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