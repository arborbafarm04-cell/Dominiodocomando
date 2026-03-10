import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';

export default function GiroNoAsfaltoPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col">
      <Header />
      {/* Slot Machine Illustration Section */}
      <div className="flex-1 w-full relative overflow-hidden bg-gradient-to-b from-[#0a0d14] to-[#0f1419] flex items-center justify-center">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_12a920b63e0e4060b115e471c5396773~mv2.png?originWidth=1152&originHeight=1600"
          alt="Ultra-realistic cinematic slot machine arcade cabinet in a Brazilian community bar with neon LED display showing GIRO NO ASFALTO"
          width={1152}
          height={1600}
          className="w-full h-full object-cover"
        />
      </div>
      <Footer />
    </div>
  );
}
