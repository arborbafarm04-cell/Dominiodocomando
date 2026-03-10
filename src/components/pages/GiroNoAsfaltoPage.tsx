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
          src="https://static.wixstatic.com/media/50f4bf_4024b14d54574e54a5be90b532a1181a~mv2.png?originWidth=1920&originHeight=1024"
          alt="Máquina de slots cinematográfica GIRO NO ASFALTO em um bar de comunidade brasileiro"
          width={1920}
          className="w-full h-full object-cover shadow-[12px_12px_4px_0px_#d9d9d9]"
        />
      </div>
      <Footer />
    </div>
  );
}
