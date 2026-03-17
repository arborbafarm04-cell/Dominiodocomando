import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BaseCrudService } from '@/integrations';
import { Players, Characters } from '@/entities';
import { BRIBERY_ZONES, isInBriberyZone, isValidBarracoPosition } from '@/systems/briberyZoneSystem';
import { useNavigate } from 'react-router-dom';

interface Tile {
  id: number;
  x: number;
  z: number;
  occupied: boolean;
  playerId?: string;
  isQG?: boolean;
  briberyZoneId?: string;
}

interface Barraco {
  id: string;
  playerId: string;
  playerName: string;
  tiles: number[];
  position: { x: number; z: number };
  mesh?: THREE.Group;
  color: number;
}

interface Building {
  id: string;
  name: string;
  type: 'bribery' | 'qg' | 'business' | 'house';
  position: { x: number; z: number };
  mesh?: THREE.Group;
  color: number;
  npcType?: string;
  routePath?: string;
}

// 800 tiles = 32x25 grid
const GRID_SIZE = 32;
const GRID_HEIGHT = 25;
const TILE_SIZE = 1;
const TILES_PER_BARRACO = 4;

// QG do Complexo - Central area (8x8 tiles in the center)
const QG_SIZE = 8;
const QG_START_X = (GRID_SIZE - QG_SIZE) / 2;
const QG_START_Z = (GRID_HEIGHT - QG_SIZE) / 2;

export default function Multiplayer3DMap() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tilesRef = useRef<Map<number, Tile>>(new Map());
  const barracosRef = useRef<Map<string, Barraco>>(new Map());
  const buildingsRef = useRef<Map<string, Building>>(new Map());
  const playersRef = useRef<Map<string, any>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  
  // Camera controls state
  const [cameraControls, setCameraControls] = useState({
    isRotating: false,
    isPanning: false,
    isZooming: false,
    lastX: 0,
    lastY: 0,
    rotationX: 0,
    rotationY: 0,
    distance: 50,
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 100, 200);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(GRID_SIZE / 2, 30, GRID_HEIGHT / 2 + 20);
    camera.lookAt(GRID_SIZE / 2, 0, GRID_HEIGHT / 2);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Create tiles
    createTiles(scene);

    // Create buildings (bribery zones and QG)
    createBuildings(scene);

    // Handle mouse click for building selection
    const handleMouseClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const buildingMeshes = Array.from(buildingsRef.current.values())
        .map((b) => b.mesh)
        .filter((m): m is THREE.Group => m !== undefined);

      const intersects = raycasterRef.current.intersectObjects(buildingMeshes, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        let parent = clickedObject.parent;
        while (parent && !(parent as any).buildingData) {
          parent = parent.parent;
        }

        if (parent && (parent as any).buildingData) {
          const building = (parent as any).buildingData as Building;
          setSelectedBuilding(building);
          if (building.routePath) {
            navigate(building.routePath);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleMouseClick);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Mouse controls
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click - rotate
        setCameraControls(prev => ({
          ...prev,
          isRotating: true,
          lastX: e.clientX,
          lastY: e.clientY,
        }));
      } else if (e.button === 2) { // Right click - pan
        setCameraControls(prev => ({
          ...prev,
          isPanning: true,
          lastX: e.clientX,
          lastY: e.clientY,
        }));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setCameraControls(prev => {
        const deltaX = e.clientX - prev.lastX;
        const deltaY = e.clientY - prev.lastY;

        let newControls = { ...prev, lastX: e.clientX, lastY: e.clientY };

        if (prev.isRotating) {
          newControls.rotationY += deltaX * 0.01;
          newControls.rotationX += deltaY * 0.01;
          newControls.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newControls.rotationX));
        } else if (prev.isPanning) {
          const panSpeed = 0.1;
          const centerX = GRID_SIZE / 2;
          const centerZ = GRID_HEIGHT / 2;
          
          const panX = -deltaX * panSpeed * Math.cos(prev.rotationY);
          const panZ = -deltaX * panSpeed * Math.sin(prev.rotationY);
          const panY = deltaY * panSpeed;

          if (camera) {
            camera.position.x += panX;
            camera.position.z += panZ;
            camera.position.y += panY;
          }
        }

        return newControls;
      });
    };

    const handleMouseUp = () => {
      setCameraControls(prev => ({
        ...prev,
        isRotating: false,
        isPanning: false,
      }));
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCameraControls(prev => {
        const zoomSpeed = 2;
        const newDistance = Math.max(10, Math.min(100, prev.distance + e.deltaY * 0.1));
        return { ...prev, distance: newDistance };
      });
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update camera position based on controls
      if (camera) {
        const centerX = GRID_SIZE / 2;
        const centerZ = GRID_HEIGHT / 2;
        const centerY = 10;

        const x = centerX + cameraControls.distance * Math.sin(cameraControls.rotationY) * Math.cos(cameraControls.rotationX);
        const y = centerY + cameraControls.distance * Math.sin(cameraControls.rotationX);
        const z = centerZ + cameraControls.distance * Math.cos(cameraControls.rotationY) * Math.cos(cameraControls.rotationX);

        camera.position.set(x, y, z);
        camera.lookAt(centerX, centerY, centerZ);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('click', handleMouseClick);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [cameraControls, navigate]);

  // Create grid tiles
  const createTiles = (scene: THREE.Scene) => {
    const tileGroup = new THREE.Group();
    let tileId = 0;

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_HEIGHT; z++) {
        // Check if tile is in QG area
        const isQG = x >= QG_START_X && x < QG_START_X + QG_SIZE && 
                     z >= QG_START_Z && z < QG_START_Z + QG_SIZE;

        // Check if tile is in a bribery zone
        const briberyZone = isInBriberyZone(x, z);
        const zoneColor = briberyZone ? briberyZone.color : 0x2a2a3e;
        const emissiveColor = isQG ? 0x00ff00 : (briberyZone ? briberyZone.color : 0x000000);
        const emissiveIntensity = isQG ? 0.3 : (briberyZone ? 0.2 : 0);

        const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
        const material = new THREE.MeshStandardMaterial({
          color: isQG ? 0x1a4d2e : zoneColor,
          roughness: 0.8,
          metalness: 0.2,
          emissive: emissiveColor,
          emissiveIntensity: emissiveIntensity,
        });

        const tile = new THREE.Mesh(geometry, material);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(x * TILE_SIZE, 0, z * TILE_SIZE);
        tile.receiveShadow = true;
        tileGroup.add(tile);

        // Store tile info
        tilesRef.current.set(tileId, {
          id: tileId,
          x,
          z,
          occupied: false,
          isQG,
          briberyZoneId: briberyZone?.id,
        });

        tileId++;
      }
    }

    scene.add(tileGroup);

    // Add QG boundary visualization
    const qgGeometry = new THREE.BufferGeometry();
    const qgVertices = new Float32Array([
      QG_START_X * TILE_SIZE, 0.01, QG_START_Z * TILE_SIZE,
      (QG_START_X + QG_SIZE) * TILE_SIZE, 0.01, QG_START_Z * TILE_SIZE,
      (QG_START_X + QG_SIZE) * TILE_SIZE, 0.01, (QG_START_Z + QG_SIZE) * TILE_SIZE,
      QG_START_X * TILE_SIZE, 0.01, (QG_START_Z + QG_SIZE) * TILE_SIZE,
      QG_START_X * TILE_SIZE, 0.01, QG_START_Z * TILE_SIZE,
    ]);
    qgGeometry.setAttribute('position', new THREE.BufferAttribute(qgVertices, 3));
    const qgLine = new THREE.Line(qgGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 }));
    scene.add(qgLine);

    // Add bribery zone boundaries
    BRIBERY_ZONES.forEach((zone) => {
      const minX = zone.centerX - zone.width / 2;
      const maxX = zone.centerX + zone.width / 2;
      const minZ = zone.centerZ - zone.height / 2;
      const maxZ = zone.centerZ + zone.height / 2;

      const zoneGeometry = new THREE.BufferGeometry();
      const zoneVertices = new Float32Array([
        minX * TILE_SIZE, 0.02, minZ * TILE_SIZE,
        maxX * TILE_SIZE, 0.02, minZ * TILE_SIZE,
        maxX * TILE_SIZE, 0.02, maxZ * TILE_SIZE,
        minX * TILE_SIZE, 0.02, maxZ * TILE_SIZE,
        minX * TILE_SIZE, 0.02, minZ * TILE_SIZE,
      ]);
      zoneGeometry.setAttribute('position', new THREE.BufferAttribute(zoneVertices, 3));
      const zoneLine = new THREE.Line(
        zoneGeometry,
        new THREE.LineBasicMaterial({ color: zone.color, linewidth: 2 })
      );
      scene.add(zoneLine);
    });

    // Add grid lines
    const gridHelper = new THREE.GridHelper(
      Math.max(GRID_SIZE, GRID_HEIGHT),
      Math.max(GRID_SIZE, GRID_HEIGHT),
      0x444444,
      0x222222
    );
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
  };

  // Create buildings for bribery zones and QG
  const createBuildings = (scene: THREE.Scene) => {
    // Create QG building
    const qgBuilding = createBuildingMesh(
      { x: QG_START_X + QG_SIZE / 2, z: QG_START_Z + QG_SIZE / 2 },
      0x1a4d2e,
      'QG do Complexo',
      'qg'
    );
    scene.add(qgBuilding);
    buildingsRef.current.set('qg', {
      id: 'qg',
      name: 'QG do Complexo',
      type: 'qg',
      position: { x: QG_START_X + QG_SIZE / 2, z: QG_START_Z + QG_SIZE / 2 },
      mesh: qgBuilding,
      color: 0x1a4d2e,
    });

    // Create bribery zone buildings
    BRIBERY_ZONES.forEach((zone) => {
      const buildingMesh = createBuildingMesh(
        { x: zone.centerX, z: zone.centerZ },
        zone.color,
        zone.name,
        'bribery'
      );
      scene.add(buildingMesh);
      
      const routeMap: Record<string, string> = {
        'guard': '/bribery-guard',
        'delegado': '/bribery-delegado',
        'investigador': '/bribery-investigador',
        'vereador': '/bribery-vereador',
        'prefeito': '/bribery-prefeito',
        'promotor': '/bribery-promotor',
        'juiz': '/bribery-juiz',
        'secretario': '/bribery-secretario',
        'governador': '/bribery-governador',
        'ministro': '/bribery-ministro',
        'presidente': '/bribery-presidente',
      };

      buildingsRef.current.set(zone.id, {
        id: zone.id,
        name: zone.name,
        type: 'bribery',
        position: { x: zone.centerX, z: zone.centerZ },
        mesh: buildingMesh,
        color: zone.color,
        npcType: zone.npcType,
        routePath: routeMap[zone.npcType],
      });
    });
  };

  // Create a building mesh
  const createBuildingMesh = (
    position: { x: number; z: number },
    color: number,
    name: string,
    type: string
  ): THREE.Group => {
    const group = new THREE.Group();
    (group as any).buildingData = {
      name,
      type,
      position,
      color,
    };

    // Base
    const baseGeometry = new THREE.BoxGeometry(2.5, 0.3, 2.5);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Main structure
    const structureGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const structureMaterial = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
    });
    const structure = new THREE.Mesh(structureGeometry, structureMaterial);
    structure.position.y = 1.5;
    structure.castShadow = true;
    structure.receiveShadow = true;
    group.add(structure);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(1.8, 1.2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xd2691e });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 3.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.2, 1.3);
    door.castShadow = true;
    group.add(door);

    // Windows
    for (let i = 0; i < 2; i++) {
      const windowGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.05);
      const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87CEEB });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(-0.6 + i * 1.2, 2.2, 1.3);
      window.castShadow = true;
      group.add(window);
    }

    group.position.set(
      position.x * TILE_SIZE,
      0,
      position.z * TILE_SIZE
    );

    return group;
  };

  // Generate random barraco position (4 contiguous tiles) - avoiding QG area and bribery zones
  const generateBarracoPosition = (): { tiles: number[]; x: number; z: number } | null => {
    const maxAttempts = 200;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const startX = Math.floor(Math.random() * (GRID_SIZE - 1));
      const startZ = Math.floor(Math.random() * (GRID_HEIGHT - 1));

      // Use the validation function from briberyZoneSystem
      if (!isValidBarracoPosition(startX, startZ, 2, 2)) {
        continue;
      }

      const tiles: number[] = [];
      let canPlace = true;

      // Try 2x2 configuration
      for (let dx = 0; dx < 2; dx++) {
        for (let dz = 0; dz < 2; dz++) {
          const x = startX + dx;
          const z = startZ + dz;
          const tileId = z * GRID_SIZE + x;

          const tile = tilesRef.current.get(tileId);
          if (!tile || tile.occupied) {
            canPlace = false;
            break;
          }
          tiles.push(tileId);
        }
        if (!canPlace) break;
      }

      if (canPlace) {
        return {
          tiles,
          x: startX,
          z: startZ,
        };
      }
    }
    return null;
  };

  // Create barraco mesh
  const createBarracoMesh = (position: { x: number; z: number }, color: number): THREE.Group => {
    const group = new THREE.Group();

    // Base
    const baseGeometry = new THREE.BoxGeometry(1.8, 0.2, 1.8);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Walls
    const wallGeometry = new THREE.BoxGeometry(1.8, 1.5, 1.8);
    const wallMaterial = new THREE.MeshStandardMaterial({ color });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 1;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(1.3, 1, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xd2691e });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(0.6, 1, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.8, 0.95);
    door.castShadow = true;
    group.add(door);

    group.position.set(
      position.x * TILE_SIZE + TILE_SIZE / 2,
      0,
      position.z * TILE_SIZE + TILE_SIZE / 2
    );

    return group;
  };

  // Load players and create barracos
  useEffect(() => {
    const loadPlayersAndBarracos = async () => {
      try {
        const result = await BaseCrudService.getAll<Players>('players', [], { limit: 100 });
        const players = result.items;

        if (!sceneRef.current) return;

        const colors = [0xff4500, 0x00eaff, 0x00ff00, 0xff00ff, 0xffff00, 0xff8800];

        players.forEach((player, index) => {
          const position = generateBarracoPosition();
          if (!position) return;

          const color = colors[index % colors.length];
          const barraco: Barraco = {
            id: player._id,
            playerId: player.playerId || player._id,
            playerName: player.playerName || 'Unknown',
            tiles: position.tiles,
            position: { x: position.x, z: position.z },
            color,
          };

          // Mark tiles as occupied
          position.tiles.forEach((tileId) => {
            const tile = tilesRef.current.get(tileId);
            if (tile) {
              tile.occupied = true;
              tile.playerId = player._id;
            }
          });

          // Create mesh
          const mesh = createBarracoMesh(position, color);
          barraco.mesh = mesh;
          sceneRef.current!.add(mesh);

          barracosRef.current.set(player._id, barraco);
          playersRef.current.set(player._id, player);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading players:', error);
        setIsLoading(false);
      }
    };

    loadPlayersAndBarracos();
  }, []);

  // Real-time player updates (polling for now, can be replaced with WebSocket)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await BaseCrudService.getAll<Players>('players', [], { limit: 100 });
        const players = result.items;

        players.forEach((player) => {
          if (!playersRef.current.has(player._id)) {
            // New player - create barraco
            const position = generateBarracoPosition();
            if (position && sceneRef.current) {
              const colors = [0xff4500, 0x00eaff, 0x00ff00, 0xff00ff, 0xffff00, 0xff8800];
              const color = colors[Object.keys(playersRef.current).length % colors.length];
              
              const barraco: Barraco = {
                id: player._id,
                playerId: player.playerId || player._id,
                playerName: player.playerName || 'Unknown',
                tiles: position.tiles,
                position: { x: position.x, z: position.z },
                color,
              };

              position.tiles.forEach((tileId) => {
                const tile = tilesRef.current.get(tileId);
                if (tile) {
                  tile.occupied = true;
                  tile.playerId = player._id;
                }
              });

              const mesh = createBarracoMesh(position, color);
              barraco.mesh = mesh;
              sceneRef.current.add(mesh);

              barracosRef.current.set(player._id, barraco);
              playersRef.current.set(player._id, player);
            }
          }
        });

        // Remove players that are no longer in the database
        const playerIds = new Set(players.map((p) => p._id));
        for (const [id, barraco] of barracosRef.current.entries()) {
          if (!playerIds.has(id) && sceneRef.current && barraco.mesh) {
            sceneRef.current.remove(barraco.mesh);
            barracosRef.current.delete(id);
            playersRef.current.delete(id);

            // Mark tiles as unoccupied
            barraco.tiles.forEach((tileId) => {
              const tile = tilesRef.current.get(tileId);
              if (tile) {
                tile.occupied = false;
                tile.playerId = undefined;
              }
            });
          }
        }
      } catch (error) {
        console.error('Error updating players:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-2xl">Carregando mapa 3D...</div>
        </div>
      )}
      
      {/* Info Panel */}
      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-70 p-4 rounded max-h-96 overflow-y-auto z-10">
        <h2 className="text-xl font-bold mb-2">Mapa Multiplayer 3D - Complexo</h2>
        <p>Total de Tiles: {GRID_SIZE * GRID_HEIGHT}</p>
        <p>QG do Complexo: {QG_SIZE * QG_SIZE} tiles (área central)</p>
        <p>Barracos: {barracosRef.current.size}</p>
        <p>Edifícios: {buildingsRef.current.size}</p>
        <p>Tiles por Barraco: {TILES_PER_BARRACO}</p>
        
        <div className="mt-4 border-t border-gray-600 pt-2">
          <h3 className="text-lg font-bold mb-2">Zonas de Suborno:</h3>
          <div className="space-y-1 text-sm">
            {BRIBERY_ZONES.map((zone) => (
              <div key={zone.id} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: `#${zone.color.toString(16).padStart(6, '0')}` }}
                />
                <span>{zone.name}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedBuilding && (
          <div className="mt-4 border-t border-gray-600 pt-2">
            <h3 className="text-lg font-bold mb-2 text-secondary">Selecionado:</h3>
            <p className="text-sm">{selectedBuilding.name}</p>
            <p className="text-xs text-gray-400">Clique para entrar</p>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-70 p-4 rounded z-10">
        <h3 className="text-lg font-bold mb-2">Controles:</h3>
        <div className="space-y-1 text-sm">
          <p>🖱️ <strong>Clique esquerdo + Arraste:</strong> Rotacionar câmera</p>
          <p>🖱️ <strong>Clique direito + Arraste:</strong> Mover câmera</p>
          <p>🔍 <strong>Scroll do mouse:</strong> Zoom in/out</p>
        </div>
      </div>

      {/* Pinça (Zoom Controls) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setCameraControls(prev => ({ ...prev, distance: Math.max(10, prev.distance - 5) }))}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition"
          title="Zoom In"
        >
          🔍+
        </button>
        <button
          onClick={() => setCameraControls(prev => ({ ...prev, distance: Math.min(100, prev.distance + 5) }))}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition"
          title="Zoom Out"
        >
          🔍−
        </button>
        <button
          onClick={() => setCameraControls({
            isRotating: false,
            isPanning: false,
            isZooming: false,
            lastX: 0,
            lastY: 0,
            rotationX: 0,
            rotationY: 0,
            distance: 50,
          })}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition"
          title="Reset View"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
