import { Image } from '@/components/ui/image';

export default function HomePage() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0d14] relative" style={{
      aspectRatio: '9/16',
      backgroundImage: 'url(https://static.wixstatic.com/media/50f4bf_1e5ca7c3774d48e6b010a1a723fd4c9f~mv2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Logo Section - First 1/4 of screen */}
      <div className="w-full h-1/4 flex items-center justify-center bg-gradient-to-b from-black/40 to-transparent">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_f2a8c161a4404b8a90919814997ac5b2~mv2.png"
          alt="Dominio do Comando Logo"
          width={200}
          height={200}
          className="object-contain"
        />
      </div>
    </div>
  );
}
