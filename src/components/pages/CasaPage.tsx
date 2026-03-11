import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlayerStore } from '@/store/playerStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';

// Level to dirty money mapping
const LEVEL_TO_MONEY: Record<number, number> = {
  9: 10000,
  19: 50000,
  29: 60000,
  39: 70000,
  49: 100000,
  59: 500000,
  69: 1000000,
  79: 2000000,
  89: 20000000,
};

export default function CasaPage() {
  const { level, setLevel } = usePlayerStore();
  const { removeDirtyMoney, dirtyMoney } = useDirtyMoneyStore();
  const [backgroundImage, setBackgroundImage] = useState('https://static.wixstatic.com/media/50f4bf_33be6b8d7dcf42169f78328d168a8ec4~mv2.png');
  const [inputLevel, setInputLevel] = useState(level.toString());

  const getMoneyForLevel = (playerLevel: number): number => {
    // Find the appropriate amount based on player level
    const sortedLevels = Object.keys(LEVEL_TO_MONEY)
      .map(Number)
      .sort((a, b) => a - b);

    for (const levelThreshold of sortedLevels) {
      if (playerLevel >= levelThreshold) {
        return LEVEL_TO_MONEY[levelThreshold];
      }
    }

    return 0; // No money for levels below 9
  };

  const handleButtonClick = () => {
    const moneyToRemove = getMoneyForLevel(level);
    
    if (moneyToRemove > 0) {
      if (dirtyMoney >= moneyToRemove) {
        removeDirtyMoney(moneyToRemove);
        
        // If player is level 9, upgrade to level 10 and change background
        if (level === 9) {
          setLevel(10);
          setInputLevel('10');
          setBackgroundImage('https://static.wixstatic.com/media/50f4bf_d78defb80b9247beb0e9c91a333507bc~mv2.png');
          alert(`Parabéns! Você atingiu o nível 10! R$ ${moneyToRemove.toLocaleString('pt-BR')} retirado do cofre!`);
        } else if (level === 19) {
          setLevel(20);
          setInputLevel('20');
          setBackgroundImage('https://static.wixstatic.com/media/50f4bf_2feb9c93a34a4b849f52b5461ea4f2cb~mv2.png');
          alert(`Parabéns! Você atingiu o nível 20! R$ ${moneyToRemove.toLocaleString('pt-BR')} retirado do cofre!`);
        } else {
          alert(`Nível ${level}: R$ ${moneyToRemove.toLocaleString('pt-BR')} retirado do cofre!`);
        }
      } else {
        alert(`Nível ${level}: Você não tem dinheiro suficiente no cofre. Disponível: R$ ${dirtyMoney.toLocaleString('pt-BR')}`);
      }
    } else {
      alert(`Nível ${level}: Você precisa atingir o nível 9 para retirar dinheiro sujo.`);
    }
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputLevel(value);
    
    const newLevel = parseInt(value, 10);
    if (!isNaN(newLevel) && newLevel >= 0) {
      setLevel(newLevel);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col transition-all duration-500"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: '120%',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header />
      <div className="w-full flex justify-center items-center gap-4 pt-32">
        <Input
          type="number"
          value={inputLevel}
          onChange={handleLevelChange}
          placeholder="Nível"
          className="w-24 px-4 py-2 text-lg text-center"
          min="0"
        />
        <Button onClick={handleButtonClick} className="px-8 py-3 text-lg">
          Clique aqui
        </Button>
      </div>
      <main className="flex-1 flex items-center justify-center">
        {/* Content area - you can add content here */}
      </main>
      <Footer />
    </div>
  );
}
