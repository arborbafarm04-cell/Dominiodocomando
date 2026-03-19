import { useState } from 'react';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LuxuryShowroomPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simulação do nível do jogador
  const playerLevel = 1;

  // Gerador de itens por nível
  const generateItems = (level: number) => {
    const basePrice = 120;
    return Array.from({ length: 5 }).map((_, i) => {
      const price = basePrice * Math.pow(1.1, level + i);
      return {
        id: i,
        name: `Item de Luxo Nível ${level} - ${i + 1}`,
        price: price.toFixed(2),
      };
    });
  };

  const items = generateItems(playerLevel);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 relative w-full overflow-hidden bg-black">
        {/* BACKGROUND */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_e591cecf171a471cbfa4c0d91653f072~mv2.png"
          alt="Luxury Showroom Background"
          className="absolute w-full h-full object-cover"
          width={1920}
          height={1080}
        />

        {/* NPC 2D */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_8dc3c6fde14f4e06b7937591bf2c203d~mv2.png"
          alt="NPC"
          onClick={() => setIsModalOpen(true)}
          className="absolute right-10 bottom-0 h-[80%] cursor-pointer transition-transform hover:scale-105"
          width={400}
          height={800}
        />

        {/* MODAL */}
        {isModalOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-black/80 border border-yellow-500 p-6 rounded-xl w-[80%] max-w-4xl text-white">
              <h2 className="text-2xl text-center mb-6 text-yellow-400">
                Seleção Exclusiva Nível {playerLevel} 💎
              </h2>

              {/* GRID DE ITENS */}
              <div className="grid grid-cols-5 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-black/70 border border-gray-700 p-4 rounded-lg text-center hover:scale-105 transition"
                  >
                    <div className="h-20 bg-gray-800 mb-2 rounded"></div>

                    <p className="text-sm">{item.name}</p>
                    <p className="text-yellow-400 font-bold">
                      R$ {item.price}
                    </p>

                    <button className="mt-2 bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400">
                      Comprar
                    </button>
                  </div>
                ))}
              </div>

              {/* FECHAR */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-6 block mx-auto text-gray-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
