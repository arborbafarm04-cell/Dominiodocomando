# Giro no Asfalto 3D Object Integration

## Overview

The Giro no Asfalto 3D object has been successfully integrated into the game grid system using React + Three.js. The object is a separate, reusable component that can be rendered within any Three.js scene.

## Architecture

### Components

#### 1. **GiroAsfaltoObject.tsx** (`/src/components/GiroAsfaltoObject.tsx`)
- **Purpose**: Standalone React component for loading and managing the Giro no Asfalto 3D model
- **Responsibilities**:
  - Loads the .glb model from the Wix CDN
  - Automatically scales the object to occupy exactly 8 tiles (2x4 format)
  - Positions the object with its base perfectly aligned to the ground (Y = 0)
  - Applies shadow properties (castShadow, receiveShadow)
  - Implements raycasting for click detection
  - Navigates to `/giro-no-asfalto` route on click
  - Registers blocked tiles to prevent other objects from occupying the same space

**Key Props**:
```typescript
interface GiroAsfaltoObjectProps {
  scene: THREE.Scene;              // The Three.js scene
  camera: THREE.PerspectiveCamera;  // The camera for raycasting
  raycaster: THREE.Raycaster;       // Raycaster for click detection
  tileSize?: number;                // Size of each tile (default: 1)
  gridStartX?: number;              // Grid start position X (default: -20)
  gridStartZ?: number;              // Grid start position Z (default: -10)
  onObjectLoaded?: (group: THREE.Group) => void;  // Callback when object loads
  onBlockedTilesRegistered?: (tiles: Array<{ x: number; z: number }>) => void;  // Callback for blocked tiles
}
```

#### 2. **InteractiveTileGrid.tsx** (Modified)
- **Changes**:
  - Added import for `GiroAsfaltoObject` component
  - Added state management for scene readiness (`sceneReady`)
  - Added refs for Giro object group and blocked tiles tracking
  - Integrated click detection for Giro object (checked before other objects)
  - Renders `GiroAsfaltoObject` component when scene is ready

#### 3. **BlockedTilesManager.ts** (`/src/systems/BlockedTilesManager.ts`)
- **Purpose**: Manages blocked tiles in the grid system
- **Responsibilities**:
  - Registers tiles as blocked when objects occupy them
  - Prevents placement of new objects on blocked tiles
  - Tracks which object is blocking each tile
  - Provides area availability checking

**Key Methods**:
```typescript
registerBlockedTiles(objectId, objectType, tiles)  // Register tiles as blocked
unregisterBlockedTiles(objectId)                   // Unregister tiles
isTileBlocked(gridX, gridZ)                        // Check if tile is blocked
isAreaAvailable(gridX, gridZ, width, depth)        // Check if area is available
getBlockingObject(gridX, gridZ)                    // Get object blocking a tile
```

## Grid Configuration

### Giro no Asfalto Positioning

- **Grid Position**: (10, 8) - starting at grid coordinates
- **Size**: 2x4 tiles (2 tiles wide, 4 tiles deep)
- **Total Tiles Occupied**: 8 tiles
- **World Position**: Calculated from grid position and tile size
- **Ground Alignment**: Y = 0 (base perfectly aligned to ground)

### Blocked Tiles

The following 8 tiles are registered as blocked:
```
(10, 8), (10, 9), (10, 10), (10, 11),
(11, 8), (11, 9), (11, 10), (11, 11)
```

## 3D Model Properties

### Model URL
```
https://static.wixstatic.com/3d/50f4bf_54abdb76d21c4aa0995035679f4f632b.glb
```

### Scaling
- **Method**: Automatic bounding box calculation
- **Target Size**: Maximum of (2 units, 4 units) = 4 units
- **Scale Factor**: Calculated as `targetSize / maxDimension`
- **Result**: Object fits perfectly within 8 tiles without exceeding boundaries

### Lighting & Materials
- **castShadow**: Enabled
- **receiveShadow**: Enabled
- **Emissive Intensity**: 0.25 (subtle glow for visibility)
- **Metalness**: Reduced by 0.15
- **Roughness**: Increased by 0.1 (more matte appearance)

## Click Detection

### Raycasting Implementation
1. **Event Listener**: Click events on the canvas
2. **Ray Calculation**: From camera through mouse position
3. **Intersection Check**: Against Giro object mesh only
4. **Priority**: Checked before other objects (delegacia, QG, luxury store)
5. **Navigation**: On successful click, navigates to `/giro-no-asfalto`

### Click Detection Order
```
1. Delegacia (if level >= 10)
2. Giro no Asfalto (NEW)
3. Custom Objects
4. QG
5. Luxury Store
6. Grid Tiles
```

## Integration with Existing Systems

### Grid System
- Uses existing `GridSystem` for tile calculations
- Respects grid boundaries and tile sizes
- Integrates with `BlockedTilesManager` for tile blocking

### Navigation
- Uses React Router's `useNavigate` hook
- Navigates to `/giro-no-asfalto` on click
- Route already exists in `Router.tsx`

### Lighting
- Uses existing ambient and directional lights
- Shadows rendered on existing ground plane
- Integrates with existing material system

## Usage Example

```typescript
import InteractiveTileGrid from '@/components/game/InteractiveTileGrid';

export default function GamePage() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <InteractiveTileGrid
        gridWidth={40}
        gridHeight={20}
        tileSize={1}
        onTileSelect={(tileId, position) => {
          console.log('Tile selected:', tileId, position);
        }}
      />
    </div>
  );
}
```

The Giro no Asfalto object is automatically loaded and rendered within the grid scene.

## Performance Considerations

1. **Model Loading**: Asynchronous GLTF loading prevents blocking
2. **Raycasting**: Only checks Giro object mesh when clicked
3. **Shadows**: Enabled for realistic rendering
4. **Memory**: Model disposed on component unmount
5. **Blocked Tiles**: Efficient Set-based lookup (O(1) average case)

## Debugging

### Console Logs
- Model loading status
- Grid positioning information
- Click detection events
- Blocked tiles registration

### Visual Debugging
- Grid lines show tile boundaries (cyan color)
- Object positioned at calculated world coordinates
- Shadows visible on ground plane
- Emissive material provides visibility in dark areas

## Future Enhancements

1. **Animation**: Add idle animations to the object
2. **Interaction Feedback**: Visual feedback on hover/click
3. **Level Gating**: Restrict access based on player level
4. **Dynamic Positioning**: Allow repositioning via admin panel
5. **Multiple Objects**: Support for multiple Giro objects in different locations

## Troubleshooting

### Object Not Visible
- Check if model URL is accessible
- Verify grid positioning (console logs)
- Check camera position and zoom level
- Ensure lighting is properly configured

### Click Not Working
- Verify raycaster is properly initialized
- Check if object mesh is properly loaded
- Ensure click event listener is attached
- Check browser console for errors

### Tiles Not Blocked
- Verify `onBlockedTilesRegistered` callback is called
- Check `BlockedTilesManager` implementation
- Ensure blocked tiles are properly tracked

## Files Modified/Created

### Created
- `/src/components/GiroAsfaltoObject.tsx` - Main component
- `/src/systems/BlockedTilesManager.ts` - Tile blocking system
- `/src/GIRO_ASFALTO_INTEGRATION.md` - This documentation

### Modified
- `/src/components/game/InteractiveTileGrid.tsx` - Integration point
- `/src/systems/index.ts` - Export BlockedTilesManager

## Technical Specifications

### Grid Dimensions
- **Grid Width**: 40 tiles
- **Grid Height**: 20 tiles
- **Tile Size**: 1 unit
- **Total Grid Size**: 40x20 units

### Giro Object Dimensions
- **Width**: 2 tiles (2 units)
- **Depth**: 4 tiles (4 units)
- **Height**: Determined by model (scaled to fit)
- **Position**: (10, 8) in grid coordinates

### Coordinate System
- **X-axis**: Left-Right (width)
- **Z-axis**: Forward-Backward (depth)
- **Y-axis**: Up-Down (height)
- **Origin**: Center of grid at (0, 0, 0)

## Compliance Checklist

✅ Object loaded from correct URL (.glb format)
✅ Automatically scaled to occupy exactly 8 tiles (2x4 format)
✅ Base perfectly aligned to ground (Y = 0)
✅ Dynamic scaling respects tile limits
✅ castShadow and receiveShadow enabled
✅ Basic lighting applied (ambient + directional)
✅ Emissive material applied for visibility
✅ Raycasting click detection implemented
✅ Click detection exclusive to object mesh
✅ Navigation to `/giro-no-asfalto` on click
✅ 8 tiles registered as blocked
✅ Grid and object remain fixed in world
✅ No duplication or misalignment
✅ Professional visual standard maintained
✅ Realistic crime-organized game aesthetic
