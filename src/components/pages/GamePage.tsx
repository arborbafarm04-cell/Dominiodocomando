import { useGameScreenStore } from '@/store/gameScreenStore'
import { useState, useEffect } from 'react'

import GameMenuScreen from '@/components/game/GameMenuScreen'
import GameMapScreen from '@/components/game/GameMapScreen'
import GameLocationScreen from '@/components/game/GameLocationScreen'
import GameCharacterScreen from '@/components/game/GameCharacterScreen'
import GameInventoryScreen from '@/components/game/GameInventoryScreen'
import GameStatusScreen from '@/components/game/GameStatusScreen'

import CinematicSignboard from '@/components/CinematicSignboard'

export default function GamePage() {

  const currentScreen = useGameScreenStore((state) => state.currentScreen)
    const setScreen = useGameScreenStore((state) => state.setScreen)

      const [showCinematic, setShowCinematic] = useState(true)

        useEffect(() => {

            // define menu como tela inicial
                setScreen('menu')

                    // controla a intro cinematográfica
                        const timer = setTimeout(() => {

                              setShowCinematic(false)

                                    // garante que após a intro vá para o menu
                                          setScreen('menu')

                                              }, 5000)

                                                  return () => clearTimeout(timer)

                                                    }, [])

                                                      // tela da intro
                                                        if (showCinematic) {
                                                            return (
                                                                  <div className="w-screen h-screen bg-black overflow-hidden relative">
                                                                          <CinematicSignboard />
                                                                                </div>
                                                                                    )
                                                                                      }

                                                                                        // jogo
                                                                                          return (

                                                                                              <div className="w-screen h-screen bg-black overflow-hidden relative">

                                                                                                    {currentScreen === 'menu' && (
                                                                                                            <GameMenuScreen />
                                                                                                                  )}

                                                                                                                        {currentScreen === 'map' && (
                                                                                                                                <GameMapScreen />
                                                                                                                                      )}

                                                                                                                                            {currentScreen === 'location' && (
                                                                                                                                                    <GameLocationScreen />
                                                                                                                                                          )}

                                                                                                                                                                {currentScreen === 'character' && (
                                                                                                                                                                        <GameCharacterScreen />
                                                                                                                                                                              )}

                                                                                                                                                                                    {currentScreen === 'inventory' && (
                                                                                                                                                                                            <GameInventoryScreen />
                                                                                                                                                                                                  )}

                                                                                                                                                                                                        {currentScreen === 'status' && (
                                                                                                                                                                                                                <GameStatusScreen />
                                                                                                                                                                                                                      )}

                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                            )
                                                                                                                                                                                                                            }
