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

interface InteractiveTileGridProps {
  onTileSelect?: (tileId: number, position: { x: number; z: number }) => void;
  onLuxuryStoreClick?: () => void;
  onQGClick?: () => void;
  gridWidth?: number;
  gridHeight?: number;
  tileSize?: number;
}

const InteractiveTileGrid: React.FC<InteractiveTileGridProps> = ({
  onTileSelect,
  onLuxuryStoreClick,
  onQGClick,
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
    const ambientLight = new THREE.AmbientLight(0xffccaa, 1.2);
    scene.add(ambientLight);

    // Directional light for better object visibility
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(gridTotalWidth / 2, maxDim * 0.8, gridTotalHeight / 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Point light for additional illumination
    const pointLight = new THREE.PointLight(0xffffff, 2.0);
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

    // ===== LOAD LUXURY STORE 3D MODEL =====
    const gltfLoader = new GLTFLoader();
    
    // Calculate position for 4x4 luxury store (16 tiles) - REPOSITIONED to upper-left area
    const storeSize = 4; // 4x4 tiles
    
    // Position the store in the upper-left quadrant (leaving center for another building)
    // Grid is 40x20, so we place it at approximately grid position (6, 3)
    const storeGridX = 6;
    const storeGridZ = 3;
    
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
      },
      undefined,
      (error) => {
        console.warn('Failed to load QG 3D model:', error);
      }
    );

    // ===== ORBIT CONTROLS WITH CUSTOM CONFIGURATION =====
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // ===== DAMPING CONFIGURATION (Smooth Movement) =====
    controls.enableDamping = true;
    controls.dampingFactor = 0.08; // Smooth deceleration
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    
    // ===== ZOOM CONFIGURATION =====
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2; // Sensitivity for scroll/pinch
    controls.minDistance = maxDim * 0.4; // Zoom in limit (close to platform)
    controls.maxDistance = maxDim * 2.5; // Zoom out limit (overview)
    
    // ===== PAN CONFIGURATION =====
    controls.enablePan = false; // Disable panning to keep focus on center
    
    // ===== ROTATION CONFIGURATION =====
    controls.enableRotate = true;
    controls.rotateSpeed = 0.8; // Rotation sensitivity
    
    // ===== CAMERA TARGET (Fixed at platform center) =====
    const platformCenterX = gridTotalWidth / 2;
    const platformCenterY = 0; // Ground level - FIXED, cannot change
    const platformCenterZ = gridTotalHeight / 2;
    controls.target.set(platformCenterX, platformCenterY, platformCenterZ);
    
    // ===== VERTICAL AXIS LOCK (Y-axis completely blocked) =====
    // Block all vertical movement by restricting polar angle to a very narrow range
    // This prevents the camera from moving up or down while still allowing horizontal rotation
    const fixedPolarAngle = Math.PI * 0.5; // 90 degrees - camera at same height as target
    controls.minPolarAngle = fixedPolarAngle - 0.01; // ~89.4 degrees
    controls.maxPolarAngle = fixedPolarAngle + 0.01; // ~90.6 degrees
    
    // ===== HORIZONTAL ROTATION (Y-axis only) =====
    // Allow free rotation around the vertical axis (azimuth)
    // No restrictions on azimuth angle
    controls.autoRotateSpeed = 0;
    
    // ===== TOUCH SUPPORT =====
    controls.touchDollyRotate = true; // Enable pinch-to-zoom on mobile
    controls.touchDollySpeed = 8; // Pinch zoom sensitivity
    
    controls.update();
    controlsRef.current = controls;
    
    // ===== CUSTOM CAMERA POSITION LOCK =====
    // Store the initial camera Y position and enforce it every frame
    const initialCameraY = camera.position.y;
    const originalUpdate = controls.update.bind(controls);
    
    // Override the update method to lock Y-axis after each update
    controls.update = function() {
      originalUpdate();
      // Lock camera Y position to prevent vertical movement
      camera.position.y = initialCameraY;
      // Ensure target Y remains at ground level
      this.target.y = platformCenterY;
    };

    // ===== MOUSE INTERACTION FOR TILE SELECTION =====
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    const onMouseClick = (event: MouseEvent) => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

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
  }, [gridWidth, gridHeight, tileSize, onTileSelect, onLuxuryStoreClick, onQGClick]);

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
