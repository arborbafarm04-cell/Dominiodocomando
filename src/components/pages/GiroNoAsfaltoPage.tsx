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
          src="https://static.wixstatic.com/media/50f4bf_6a837abacada4c34b3d189c576a51dbc~mv2.png?originWidth=768&originHeight=1152"
          alt="Máquina de slots de frente para a tela em posição retrato com título GIRO NO ASFALTO e tema de bar brasileiro"
          width={768}
          className="w-full h-full object-cover"
        />
      </div>
      <Footer />
    </div>
  );
}
