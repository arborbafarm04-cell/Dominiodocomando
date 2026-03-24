import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SlotMachine from '@/components/SlotMachine';
import SpinVaultNotification from '@/components/SpinVaultNotification';
import { Image } from '@/components/ui/image';
import { useSpinVault } from '@/hooks/useSpinVault';
import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { getBackgroundByLevel } from '@/data/luxoItems';

export default function GiroNoAsfaltoPage() {
  const { showNotification, lastGainAmount } = useSpinVault();
  const barracoLevel = usePlayerStore((state) => state.barracoLevel);
  const [dynamicBackground, setDynamicBackground] = useState('');

  useEffect(() => {
    const level = barracoLevel ?? 1;
    setDynamicBackground(getBackgroundByLevel(level));
  }, [barracoLevel]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: dynamicBackground }}>
      <Header />
      
      {/* Spin Vault Notification */}
      <SpinVaultNotification show={showNotification} amount={lastGainAmount} />

      {/* Slot Machine Section */}
      <div className="w-full relative overflow-hidden bg-gradient-to-b from-[#0a0d14] to-[#0f1419] flex items-center justify-center min-h-screen bg-fixed">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_f0f13bffd67f4487bbad4fec560e36e5~mv2.png?originWidth=1024&originHeight=1920"
          alt="Ultra-realistic cinematic slot machine arcade cabinet viewed straight from the front, facing the player directly, with empty blank display panel, bright LED neon panel displaying GIRO NO ASFALTO with glowing neon effect, in a Brazilian community bar with immersive atmosphere"
          width={1024}
          height={1920}
          className="w-full h-full object-cover fixed top-0 left-0 brightness-125 contrast-110"
        />
        {/* Slot Machine Component positioned inside the slot machine screen - TV display area */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-18 relative z-10">
          <div className="bg-transparent flex items-center justify-center">
            <SlotMachine />
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="w-full bg-gradient-to-b from-[#0f1419] to-[#0a0d14] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-heading text-center mb-12 text-white">Galeria do Giro</h2>
          {/* Gallery Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Image 1 */}
            <div className="flex justify-center">
              <div className="rounded-lg overflow-hidden border border-[#00eaff]/30 hover:border-[#00eaff] transition-all">
                <Image
                  src="https://static.wixstatic.com/media/50f4bf_1e9f8c8b124e420eaa037f646b4b8b94~mv2.png?originWidth=256&originHeight=256"
                  alt="Giro no Asfalto - Galeria 1"
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Image 2 */}
            <div className="flex justify-center">
              <div className="rounded-lg overflow-hidden border border-[#00eaff]/30 hover:border-[#00eaff] transition-all">
                <Image
                  src="https://static.wixstatic.com/media/50f4bf_c68cec853fba4cb7876e5b468cc192ba~mv2.png?originWidth=256&originHeight=256"
                  alt="Giro no Asfalto - Galeria 2"
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Image 3 */}
            <div className="flex justify-center">
              <div className="rounded-lg overflow-hidden border border-[#00eaff]/30 hover:border-[#00eaff] transition-all">
                <Image
                  src="https://static.wixstatic.com/media/50f4bf_c5d8ef227002464f8a17cfd8053b0cb1~mv2.png?originWidth=256&originHeight=256"
                  alt="Giro no Asfalto - Galeria 3"
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
