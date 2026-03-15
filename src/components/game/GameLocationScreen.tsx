import { useGameScreenStore } from '@/store/gameScreenStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function GameLocationScreen() {
  const setScreen = useGameScreenStore((state) => state.setScreen);
  const selectedLocation = useGameScreenStore((state) => state.selectedLocation);

  const locationDetails: Record<string, any> = {
    qg: {
      name: 'Seu QG',
      desc: 'Domínio da Favela',
      image: 'https://static.wixstatic.com/media/50f4bf_86c3183c0550490fab41c5a8a8f6184b~mv2.png',
      actions: ['Descansar', 'Contar Dinheiro', 'Planejar'],
    },
    viatura: {
      name: 'Viatura PM',
      desc: 'NPC: Sgt. Rocha',
      image: 'https://static.wixstatic.com/media/50f4bf_73f5f22017304e5198d1a876f1537486~mv2.png',
      actions: ['Negociar', 'Subornar', 'Fugir'],
    },
    boca: {
      name: 'Boca de Fumo',
      desc: 'Ponto de Venda',
      image: 'https://static.wixstatic.com/media/50f4bf_b23aee963b00465fa534f7705505b5b9~mv2.png',
      actions: ['Vender', 'Comprar', 'Recrutar'],
    },
    banco: {
      name: 'Banco',
      desc: 'Lavar Dinheiro',
      image: 'https://static.wixstatic.com/media/50f4bf_1776337cd2dc4ff1982d01b0079a48d2~mv2.png',
      actions: ['Depositar', 'Sacar', 'Lavar Dinheiro'],
    },
  };

  const location = locationDetails[selectedLocation || 'qg'];

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${location.image})` }}
      ></div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-2xl px-6"
      >
        <h1 className="font-heading text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
          {location.name}
        </h1>
        <p className="font-paragraph text-xl text-cyan-400 mb-8">{location.desc}</p>

        {/* Location image */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mb-8 rounded-lg overflow-hidden border-2 border-cyan-400 shadow-lg shadow-cyan-400/50"
        >
          <Image src={location.image} alt={location.name} className="w-full h-64 object-cover" />
        </motion.div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {location.actions.map((action: string, index: number) => (
            <motion.div
              key={action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-heading rounded-lg border-2 border-cyan-400 shadow-lg shadow-orange-500/50">
                {action}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScreen('map')}
          className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 text-cyan-400 font-heading rounded-lg border-2 border-cyan-400"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Mapa
        </motion.button>
      </motion.div>
    </div>
  );
}
