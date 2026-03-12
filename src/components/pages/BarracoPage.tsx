import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';

export default function BarracoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 w-full">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_4ea933881d42464384aaa9eceefe37eb~mv2.png"
          alt="Barraco Background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
      </main>

      <Footer />
    </div>
  );
}
