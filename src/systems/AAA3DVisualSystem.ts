import * as THREE from 'three';

/**
 * AAA 3D Visual System
 * Transforms game buildings into AAA mobile game quality (GTA-style)
 * Handles: PBR materials, neon lighting, dynamic effects, cinematic atmosphere
 */

interface BuildingConfig {
  type: 'luxury' | 'casino' | 'qg' | 'delegacia' | 'commercial';
  neonColor: THREE.Color;
  emissiveIntensity: number;
  metalness: number;
  roughness: number;
  glowIntensity: number;
}

const BUILDING_CONFIGS: Record<string, BuildingConfig> = {
  luxury: {
    type: 'luxury',
    neonColor: new THREE.Color(0xFFD700), // Gold elegant
    emissiveIntensity: 0.8,
    metalness: 0.7,
    roughness: 0.3,
    glowIntensity: 1.2,
  },
  casino: {
    type: 'casino',
    neonColor: new THREE.Color(0xFF1493), // Deep pink + purple
    emissiveIntensity: 1.0,
    metalness: 0.8,
    roughness: 0.2,
    glowIntensity: 1.5,
  },
  qg: {
    type: 'qg',
    neonColor: new THREE.Color(0xFF0000), // Intense red
    emissiveIntensity: 1.0,
    metalness: 0.9,
    roughness: 0.15,
    glowIntensity: 1.8,
  },
  delegacia: {
    type: 'delegacia',
    neonColor: new THREE.Color(0x00BFFF), // Cold blue
    emissiveIntensity: 0.7,
    metalness: 0.6,
    roughness: 0.35,
    glowIntensity: 1.3,
  },
  commercial: {
    type: 'commercial',
    neonColor: new THREE.Color(0x00FF00), // Neon green
    emissiveIntensity: 0.9,
    metalness: 0.75,
    roughness: 0.25,
    glowIntensity: 1.4,
  },
};

export class AAA3DVisualSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private buildingLights: Map<THREE.Group, THREE.Light[]> = new Map();
  private buildingAnimations: Map<THREE.Group, { time: number; type: string }> = new Map();
  private particleSystems: THREE.Points[] = [];
  private bloomPass: any = null;

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.setupCinematicLighting();
    this.setupAtmosphere();
  }

  /**
   * Setup cinematic global lighting system
   */
  private setupCinematicLighting() {
    // Remove default lights
    this.scene.children.forEach((child) => {
      if (child instanceof THREE.Light) {
        this.scene.remove(child);
      }
    });

    // 1. Dark blue ambient light (night urban)
    const ambientLight = new THREE.AmbientLight(0x1a2a4a, 0.3);
    this.scene.add(ambientLight);

    // 2. Lateral directional light for dramatic shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(30, 40, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.bias = -0.0001;
    this.scene.add(directionalLight);

    // 3. Warm fill light (orange/gold) for neon aesthetic
    const fillLight = new THREE.DirectionalLight(0xFF6B35, 0.4);
    fillLight.position.set(-30, 30, -20);
    this.scene.add(fillLight);

    // 4. Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0x00EAFF, 0.3);
    rimLight.position.set(0, 20, -50);
    this.scene.add(rimLight);
  }

  /**
   * Setup atmospheric effects (fog, environment)
   */
  private setupAtmosphere() {
    // Dark fog for night urban scenery
    this.scene.fog = new THREE.Fog(0x0a0f1a, 80, 200);
    this.scene.background = new THREE.Color(0x0a0f1a);

    // Add subtle ground fog effect via particle system
    this.createGroundFog();
  }

  /**
   * Create ground fog particle effect
   */
  private createGroundFog() {
    const fogGeometry = new THREE.BufferGeometry();
    const fogCount = 200;
    const positions = new Float32Array(fogCount * 3);
    const velocities = new Float32Array(fogCount * 3);

    for (let i = 0; i < fogCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    fogGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fogGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const fogMaterial = new THREE.PointsMaterial({
      color: 0x1a3a5a,
      size: 0.5,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true,
    });

    const fogParticles = new THREE.Points(fogGeometry, fogMaterial);
    this.scene.add(fogParticles);
    this.particleSystems.push(fogParticles);
  }

  /**
   * Apply AAA visual transformation to a building
   */
  applyBuildingVisuals(
    buildingGroup: THREE.Group,
    buildingType: 'luxury' | 'casino' | 'qg' | 'delegacia' | 'commercial'
  ) {
    const config = BUILDING_CONFIGS[buildingType];
    if (!config) return;

    // Apply PBR materials
    this.applyPBRMaterials(buildingGroup, config);

    // Add neon emissive details
    this.addNeonEmissive(buildingGroup, config);

    // Add dynamic point lights
    this.addDynamicLighting(buildingGroup, config);

    // Setup animation state
    this.buildingAnimations.set(buildingGroup, {
      time: 0,
      type: buildingType,
    });

    // Add interaction data
    buildingGroup.userData.aaa3d = {
      config,
      originalScale: buildingGroup.scale.clone(),
      isHovered: false,
      glowIntensity: config.glowIntensity,
    };
  }

  /**
   * Apply PBR material simulation
   */
  private applyPBRMaterials(group: THREE.Group, config: BuildingConfig) {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        const material = child.material as THREE.MeshStandardMaterial;

        // Enhance metalness and roughness
        material.metalness = Math.min(1, (material.metalness || 0) + config.metalness);
        material.roughness = Math.max(0, (material.roughness || 0.5) - (1 - config.roughness));

        // Add subtle emissive base
        material.emissive = config.neonColor;
        material.emissiveIntensity = config.emissiveIntensity * 0.3;

        // Increase map intensity for better contrast
        if (material.map) {
          material.map.magFilter = THREE.LinearFilter;
        }

        material.needsUpdate = true;
      }
    });
  }

  /**
   * Add neon emissive details to windows and architectural elements
   */
  private addNeonEmissive(group: THREE.Group, config: BuildingConfig) {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;

        // Detect window-like materials (usually lighter or with specific names)
        const isWindow =
          child.name.toLowerCase().includes('window') ||
          child.name.toLowerCase().includes('glass') ||
          child.name.toLowerCase().includes('light');

        if (isWindow) {
          material.emissive = config.neonColor;
          material.emissiveIntensity = config.emissiveIntensity;
          material.metalness = 0.3;
          material.roughness = 0.1;
        }

        // Add glow to edges and details
        const isDetail =
          child.name.toLowerCase().includes('sign') ||
          child.name.toLowerCase().includes('detail') ||
          child.name.toLowerCase().includes('edge');

        if (isDetail) {
          material.emissive = config.neonColor;
          material.emissiveIntensity = config.emissiveIntensity * 0.7;
        }

        material.needsUpdate = true;
      }
    });
  }

  /**
   * Add dynamic point lights to buildings
   */
  private addDynamicLighting(group: THREE.Group, config: BuildingConfig) {
    // Main building light
    const mainLight = new THREE.PointLight(config.neonColor, 2, 50);
    mainLight.position.set(0, 5, 0);
    mainLight.castShadow = true;
    group.add(mainLight);

    // Secondary accent light
    const accentLight = new THREE.PointLight(config.neonColor, 1.5, 40);
    accentLight.position.set(3, 3, 3);
    group.add(accentLight);

    // Store lights for animation
    this.buildingLights.set(group, [mainLight, accentLight]);
  }

  /**
   * Update animations and dynamic effects
   */
  update(deltaTime: number) {
    // Update building animations
    this.buildingAnimations.forEach((anim, group) => {
      anim.time += deltaTime;

      const lights = this.buildingLights.get(group);
      if (lights) {
        // Random blinking effect (0.5s - 2s)
        const blinkCycle = 0.5 + (Math.sin(anim.time * 0.5) * 0.5 + 0.5) * 1.5;
        const blinkPhase = (anim.time % blinkCycle) / blinkCycle;

        // Pulsing intensity
        const pulse = Math.sin(anim.time * 2) * 0.3 + 0.7;

        lights.forEach((light) => {
          if (light instanceof THREE.PointLight) {
            // Apply blink
            if (blinkPhase < 0.1 || (blinkPhase > 0.5 && blinkPhase < 0.6)) {
              light.intensity *= 0.5;
            }

            // Apply pulse
            light.intensity *= pulse;
          }
        });
      }

      // Idle animation (subtle breathing)
      const breathe = Math.sin(anim.time * 0.5) * 0.02 + 1;
      group.scale.copy(group.userData.aaa3d.originalScale).multiplyScalar(breathe);
    });

    // Update fog particles
    this.particleSystems.forEach((particles) => {
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const velocities = particles.geometry.attributes.velocity.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Wrap around
        if (Math.abs(positions[i]) > 50) positions[i] *= -1;
        if (Math.abs(positions[i + 2]) > 50) positions[i + 2] *= -1;
      }

      particles.geometry.attributes.position.needsUpdate = true;
    });
  }

  /**
   * Handle hover effect (GTA-style)
   */
  onBuildingHover(group: THREE.Group, isHovering: boolean) {
    if (!group.userData.aaa3d) return;

    const aaa3d = group.userData.aaa3d;
    aaa3d.isHovered = isHovering;

    if (isHovering) {
      // Scale up
      group.scale.multiplyScalar(1.05);

      // Increase glow
      const lights = this.buildingLights.get(group);
      if (lights) {
        lights.forEach((light) => {
          if (light instanceof THREE.PointLight) {
            light.intensity *= 1.3;
          }
        });
      }

      // Enhance emissive
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity *= 1.2;
        }
      });
    } else {
      // Scale back
      group.scale.copy(aaa3d.originalScale);

      // Restore glow
      const lights = this.buildingLights.get(group);
      if (lights) {
        lights.forEach((light) => {
          if (light instanceof THREE.PointLight) {
            light.intensity /= 1.3;
          }
        });
      }

      // Restore emissive
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity /= 1.2;
        }
      });
    }
  }

  /**
   * Handle click effect (GTA-style)
   */
  onBuildingClick(group: THREE.Group) {
    if (!group.userData.aaa3d) return;

    const originalScale = group.userData.aaa3d.originalScale.clone();

    // Scale down
    group.scale.multiplyScalar(0.95);

    // Flash effect
    const lights = this.buildingLights.get(group);
    if (lights) {
      lights.forEach((light) => {
        if (light instanceof THREE.PointLight) {
          light.intensity *= 1.5;
        }
      });
    }

    // Micro rotation
    group.rotation.z += 0.05;

    // Animate back
    setTimeout(() => {
      group.scale.copy(originalScale);
      group.rotation.z -= 0.05;

      if (lights) {
        lights.forEach((light) => {
          if (light instanceof THREE.PointLight) {
            light.intensity /= 1.5;
          }
        });
      }
    }, 100);
  }

  /**
   * Add shadow plane under building
   */
  addGroundShadow(group: THREE.Group, size: number = 4) {
    const shadowGeometry = new THREE.PlaneGeometry(size, size);
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
    });

    const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.1;
    group.add(shadowPlane);
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.buildingLights.clear();
    this.buildingAnimations.clear();
    this.particleSystems.forEach((particles) => {
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
    });
    this.particleSystems = [];
  }
}
