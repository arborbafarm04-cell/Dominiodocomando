import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GiroNoAsfaltoPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      {/* First cinematic illustration */}
      <section className="relative w-full overflow-hidden">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_253301667c0f429c8b664cf3c859950b~mv2.png"
          alt="Luxurious Brazilian casino with crime elements - cinematic background"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
        />
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </section>

      {/* Second cinematic illustration - Slot Machine */}
      <section className="relative w-full overflow-hidden">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_6ae61b811ca7476295ad2671cf3c098b~mv2.png"
          alt="Ultra-realistic slot machine with empty screen, Brazilian organized crime theme, money scattered around"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
        />
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </section>

      <Footer />
    </div>
  );
}
