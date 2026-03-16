

import { useGameScreenStore } from '@/store/gameScreenStore';
import { useState, useEffect } from 'react';

import GameMapScreen from '@/components/game/GameMapScreen';
import GameLocationScreen from '@/components/game/GameLocationScreen';
import GameCharacterScreen from '@/components/game/GameCharacterScreen';
import GameInventoryScreen from '@/components/game/GameInventoryScreen';
import GameStatusScreen from '@/components/game/GameStatusScreen';
import CinematicSignboard from '@/components/CinematicSignboard';

export default function GamePage() {

const currentScreen = useGameScreenStore((state) => state.currentScreen);
const setScreen = useGameScreenStore((state) => state.setScreen);

const [showCinematic, setShowCinematic] = useState(true);

useEffect(() => {

// Começa direto no mapa
setScreen('map');

const timer = setTimeout(() => {
  setShowCinematic(false);
  }, 5000);

  return () => clearTimeout(timer);

  }, [setScreen]);

  if (showCinematic) {
  return (
  <div className="w-screen h-[calc(100vh-80px)] bg-black overflow-hidden">
  <CinematicSignboard />
  </div>
  );
  }

  return (

  <div className="w-screen h-[calc(100vh-80px)] bg-black overflow-hidden">

    {currentScreen === 'map' && <GameMapScreen />}

      {currentScreen === 'location' && <GameLocationScreen />}

        {currentScreen === 'character' && <GameCharacterScreen />}

          {currentScreen === 'inventory' && <GameInventoryScreen />}

            {currentScreen === 'status' && <GameStatusScreen />}

            </div>

            );

            }
