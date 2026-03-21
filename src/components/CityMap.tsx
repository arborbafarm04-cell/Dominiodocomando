import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '@/store/playerStore';

interface Tile {
  id: string;
  x: number;
  y: number;
  occupied: boolean;
  mesh?: THREE.Mesh;
}

interface BlockedTile {
  x: number;
  y: number;
}

export default function CityMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const tilesRef = useRef<Map<string, Tile>>(new Map());
  const tilesGroupRef = useRef<THREE.Group | null>(null);
  const selectedTileMeshRef = useRef<THREE.Mesh | null>(null);
  const policeStationGroupRef = useRef<THREE.Group | null>(null);
  const blockedTilesRef = useRef<Set<string>>(new Set());
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const navigate = useNavigate();
  const playerLevel = usePlayerStore((state) => state.level);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f141e);
    sceneRef.current = scene;

    // Create PerspectiveCamera
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // Create WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create tiles group for better organization
    const tilesGroup = new THREE.Group();
    scene.add(tilesGroup);
    tilesGroupRef.current = tilesGroup;

    // Create police station group
    const policeStationGroup = new THREE.Group();
    scene.add(policeStationGroup);
    policeStationGroupRef.current = policeStationGroup;

    // Generate tiles (32x25 = 800 tiles)
    const tileSize = 0.5;
    const gridWidth = 32;
    const gridHeight = 25;
    const tiles = new Map<string, Tile>();

    // Define blocked tiles for police station (8 tiles: 2x4)
    const policeStationCenterX = 10;
    const policeStationCenterY = 10;
    const policeStationWidthTiles = 2;
    const policeStationDepthTiles = 4;

    const policeStationStartX = policeStationCenterX - Math.floor(policeStationWidthTiles / 2);
    const policeStationStartY = policeStationCenterY - Math.floor(policeStationDepthTiles / 2);

    for (let x = policeStationStartX; x < policeStationStartX + policeStationWidthTiles; x++) {
      for (let y = policeStationStartY; y < policeStationStartY + policeStationDepthTiles; y++) {
        blockedTilesRef.current.add(`${x},${y}`);
      }
    }

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tileId = `tile-${x}-${y}`;
        const isBlocked = blockedTilesRef.current.has(`${x},${y}`);
        const occupied = isBlocked || Math.random() > 0.7; // 30% chance of being occupied (or blocked by police station)

        // Create tile geometry (using PlaneGeometry for better performance)
        const geometry = new THREE.PlaneGeometry(tileSize, tileSize);
        const material = new THREE.MeshPhongMaterial({
          color: occupied ? 0xff4500 : 0x1a3a52,
          emissive: 0x000000,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Position tile in grid
        const posX = (x - gridWidth / 2) * tileSize;
        const posY = (y - gridHeight / 2) * tileSize;
        mesh.position.set(posX, posY, 0);

        // Store tile data on mesh for raycasting
        (mesh as any).tileData = { id: tileId, x, y, occupied };

        tilesGroup.add(mesh);

        const tile: Tile = {
          id: tileId,
          x,
          y,
          occupied,
          mesh,
        };

        tiles.set(tileId, tile);
      }
    }

    tilesRef.current = tiles;

    // Load and add police station model
    const loadPoliceStation = async () => {
      try {
        const loader = new GLTFLoader();

        loader.load(
          'https://static.wixstatic.com/3d/50f4bf_55eda8581fc04c02a39a33c94b588afc.glb',
          (gltf) => {
            const model = gltf.scene;

            // Calculate world position for police station center
            const worldX = (policeStationCenterX - gridWidth / 2) * tileSize;
            const worldY = (policeStationCenterY - gridHeight / 2) * tileSize;

            // Position at Y=0 (ground level)
            model.position.set(worldX, 0, worldY);

            // Enable shadows
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            policeStationGroup.add(model);

            // Create invisible clickable mesh for raycasting
            const boundingBox = new THREE.Box3().setFromObject(model);
            const size = boundingBox.getSize(new THREE.Vector3());
            const center = boundingBox.getCenter(new THREE.Vector3());

            const clickGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
            const clickMaterial = new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
            });
            const clickMesh = new THREE.Mesh(clickGeometry, clickMaterial);
            clickMesh.position.copy(center);
            (clickMesh as any).isPoliceStation = true;

            policeStationGroup.add(clickMesh);
          },
          undefined,
          (error) => {
            console.error('Error loading police station model:', error);
          }
        );
      } catch (error) {
        console.error('Failed to load GLTFLoader:', error);
      }
    };

    loadPoliceStation();

    // Handle tile selection (mouse and touch)
    const handleTileSelection = (clientX: number, clientY: number) => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Check for police station click first
      if (policeStationGroupRef.current) {
        const policeStationMeshes = policeStationGroupRef.current.children.filter(
          (child) => child instanceof THREE.Mesh
        ) as THREE.Mesh[];

        const policeIntersects = raycasterRef.current.intersectObjects(policeStationMeshes);

        if (policeIntersects.length > 0) {
          const clickedMesh = policeIntersects[0].object as THREE.Mesh;
          if ((clickedMesh as any).isPoliceStation) {
            // Handle police station click based on player level
            if (playerLevel < 10) {
              console.log('Access denied: Player level too low');
              return;
            } else if (playerLevel >= 10 && playerLevel <= 19) {
              navigate('/bribery-investigador');
              return;
            } else if (playerLevel >= 20) {
              navigate('/bribery-delegado');
              return;
            }
          }
        }
      }

      // Get all tile meshes
      const tilesMeshes = Array.from(tiles.values())
        .map((t) => t.mesh)
        .filter((m): m is THREE.Mesh => m !== undefined);

      const intersects = raycasterRef.current.intersectObjects(tilesMeshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const tileData = (clickedMesh as any).tileData as Tile;

        // Reset previous selection
        if (selectedTileMeshRef.current && selectedTileMeshRef.current !== clickedMesh) {
          const prevTile = (selectedTileMeshRef.current as any).tileData as Tile;
          const prevMaterial = selectedTileMeshRef.current.material as THREE.MeshPhongMaterial;
          prevMaterial.color.setHex(prevTile.occupied ? 0xff4500 : 0x1a3a52);
          prevMaterial.emissive.setHex(0x000000);
        }

        // Highlight selected tile
        const material = clickedMesh.material as THREE.MeshPhongMaterial;
        material.color.setHex(0x00eaff);
        material.emissive.setHex(0x00eaff);

        selectedTileMeshRef.current = clickedMesh;
        setSelectedTile(tileData);

        // Log to console
        console.log('Tile Selected:', {
          id: tileData.id,
          x: tileData.x,
          y: tileData.y,
          occupied: tileData.occupied,
        });

        // Open luxury shop if tile is occupied
        if (tileData.occupied) {
          navigate('/luxury-showroom');
        }
      }
    };

    // Handle mouse click for tile selection
    const handleMouseClick = (event: MouseEvent) => {
      handleTileSelection(event.clientX, event.clientY);
    };

    // Handle touch for tile selection
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        handleTileSelection(touch.clientX, touch.clientY);
      }
    };

    renderer.domElement.addEventListener('click', handleMouseClick);
    renderer.domElement.addEventListener('touchstart', handleTouchStart);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleMouseClick);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose all tile geometries and materials
      tiles.forEach((tile) => {
        if (tile.mesh) {
          tile.mesh.geometry.dispose();
          const material = tile.mesh.material as THREE.Material;
          material.dispose();
        }
      });

      // Dispose police station
      if (policeStationGroupRef.current) {
        policeStationGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      renderer.dispose();
    };
  }, [navigate, playerLevel]);

  return (
    <div className="w-full h-screen flex flex-col">
      <div
        ref={containerRef}
        className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800"
      />
      {selectedTile && (
        <div className="bg-slate-800 border-t border-cyan-500 p-4 text-white font-paragraph">
          <div className="max-w-[100rem] mx-auto">
            <h3 className="text-lg font-heading text-cyan-500 mb-2">Tile Selecionado</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">ID</p>
                <p className="text-base">{selectedTile.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Coordenadas</p>
                <p className="text-base">
                  X: {selectedTile.x}, Y: {selectedTile.y}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-base">{selectedTile.occupied ? 'Ocupado' : 'Disponível'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
