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
          src="https://static.wixstatic.com/media/50f4bf_f0f13bffd67f4487bbad4fec560e36e5~mv2.png?originWidth=1024&originHeight=1920"
          alt="Ultra-realistic cinematic slot machine arcade cabinet viewed straight from the front, facing the player directly, with empty blank display panel, bright LED neon panel displaying GIRO NO ASFALTO with glowing neon effect, in a Brazilian community bar with immersive atmosphere"
          width={1024}
          height={1920}
          className="w-full h-full object-cover"
        />
        {/* Empty container positioned inside the slot machine screen - TV display area */}
        <div className="absolute" style={{ top: '32%', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="w-[308px] h-[198px] bg-transparent border-2 border-[#00eaff] rounded-lg" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
