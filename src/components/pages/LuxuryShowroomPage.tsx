import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Luxury3DShowroom from '@/components/Luxury3DShowroom';

export default function LuxuryShowroomPage() {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header />
      
      {/* 3D Showroom Section - Full Screen */}
      <div className="flex-1 w-full h-full">
        <Luxury3DShowroom />
      </div>

      <Footer />
    </div>
  );
}
