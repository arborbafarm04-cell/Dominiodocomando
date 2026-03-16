import GameMap from './GameMap';

export default function GameMapScreen() {
  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
      {/* Map Container with 9:16 aspect ratio - Fixed dimensions */}
      <div 
        className="relative"
        style={{
          width: 'calc(100vh * 9 / 16)',
          height: '100vh',
          aspectRatio: '9 / 16',
          maxWidth: '100%',
        }}
      >
        <GameMap />
      </div>
    </div>
  );
}
