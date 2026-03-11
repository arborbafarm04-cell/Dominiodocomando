import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CasaPage() {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: 'url(https://static.wixstatic.com/media/50f4bf_c6c96e5e7b0c4b8b963f4138fdc7a35c~mv2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header />
      <main className="flex-1 flex items-center justify-center">
        {/* Content area - you can add content here */}
      </main>
      <Footer />
    </div>
  );
}
