import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GiroNoAsfaltoPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      {/* Full-screen cinematic background */}
      <section className="flex-1 relative w-full overflow-hidden">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_253301667c0f429c8b664cf3c859950b~mv2.png"
          alt="Luxurious Brazilian casino with crime elements - cinematic background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </section>

      {/* Slot Machine Illustration Section */}
      <section className="w-full py-16 px-4 bg-black">
        <div className="max-w-[100rem] mx-auto flex justify-center">
          <Image
            src="https://static.wixstatic.com/media/50f4bf_9b1dcf790380438d9e86d081b1fd03d4~mv2.png"
            alt="Ultra realistic cinematic slot machine in Brazilian community bar with empty screen"
            width={1200}
            height={800}
            className="w-full max-w-4xl h-auto object-contain rounded-lg"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
