import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, GridHelper } from '@react-three/drei';
import { useRef } from 'react';

// Grid fixo, não mover nunca
function FixedGrid() {
  return <gridHelper args={[50, 50, 'white', 'gray']} position={[0, 0, 0]} />;
}

// Seus prédios já colocados permanecem intactos
function SceneObjects() {
  const ref = useRef<any>();
  useFrame(() => {
    // Aqui você pode animar objetos se quiser
    if (ref.current) ref.current.rotation.y += 0.001;
  });
  return (
    <>
      {/* Exemplo de prédio 1 */}
      <mesh position={[5, 5, 0]}>
        <boxGeometry args={[4, 10, 4]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>

      {/* Exemplo de prédio 2 */}
      <mesh position={[-5, 5, -5]}>
        <boxGeometry args={[3, 8, 3]} />
        <meshStandardMaterial color="darkgray" />
      </mesh>
    </>
  );
}

export default function CameraControlScene() {
  return (
    <Canvas camera={{ position: [30, 30, 30], fov: 60 }}>
      {/* Luz */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 40, 20]} intensity={1} />

      {/* Grid fixo */}
      <FixedGrid />

      {/* Objetos já colocados */}
      <SceneObjects />

      {/* Câmera inteligente */}
      <OrbitControls
        enablePan={true}          // movimenta lateralmente
        enableZoom={true}         // zoom in/out
        enableRotate={true}       // rotação ao redor do grid
        target={[0, 0, 0]}        // mantém foco no grid
        maxPolarAngle={Math.PI/2} // não deixa câmera passar pelo chão
        minDistance={10}          // zoom mínimo
        maxDistance={100}         // zoom máximo
      />
    </Canvas>
  );
}
