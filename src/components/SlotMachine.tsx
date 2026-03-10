import React, { useState } from 'react';
import { Image } from '@/components/ui/image';

const SLOT_ITEMS = [
  {
    id: 'pistol',
    name: 'Pistola',
    image: 'https://static.wixstatic.com/media/50f4bf_7ceb0938617b41bbb7a55bb15b81510b~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'money',
    name: 'Dinheiro',
    image: 'https://static.wixstatic.com/media/50f4bf_c9d630f7a9084448858f4688d5fd2422~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'bank',
    name: 'Prédio de Banco',
    image: 'https://static.wixstatic.com/media/50f4bf_cdd14c9f000248668e089d213a781cc9~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'diamond',
    name: 'Diamante',
    image: 'https://static.wixstatic.com/media/50f4bf_6def4b759743405d9569d1492b237a35~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'police',
    name: 'Viatura de Polícia',
    image: 'https://static.wixstatic.com/media/50f4bf_c23536e6564e4839a021f9beee0bf22c~mv2.png?originWidth=384&originHeight=384'
  }
];

export default function SlotMachine() {
  const [slots, setSlots] = useState<number[]>([0, 1, 2]);

  return (
    <div className="w-full max-w-[100rem] mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Slot Machine Container */}
        <div className="bg-gradient-to-b from-gray-900 to-black border-4 border-primary rounded-lg p-6 shadow-2xl">
          {/* Slot Display - 3 slots centered */}
          <div className="flex gap-4 justify-center items-center">
            {slots.map((slotIndex, position) => (
              <div
                key={position}
                className="w-28 h-36 bg-gradient-to-b from-gray-800 to-black border-2 border-secondary rounded-lg flex items-center justify-center overflow-hidden shadow-inner"
              >
                <Image
                  src={SLOT_ITEMS[slotIndex].image}
                  alt={SLOT_ITEMS[slotIndex].name}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            ))}
          </div>

          {/* Slot Item Labels */}
          <div className="flex gap-4 justify-center mt-4 text-secondary text-xs font-heading">
            {slots.map((slotIndex, position) => (
              <div key={position} className="w-28 text-center truncate">
                {SLOT_ITEMS[slotIndex].name}
              </div>
            ))}
          </div>
        </div>

        {/* Available Items Display */}
        <div className="w-full max-w-2xl">
          <h3 className="text-xl font-heading text-secondary mb-4">Itens Disponíveis</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {SLOT_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900 border border-secondary rounded-lg p-3 flex flex-col items-center gap-2 hover:border-primary transition-colors"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <p className="text-xs text-secondary text-center font-paragraph">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
