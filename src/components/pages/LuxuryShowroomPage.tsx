import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';

export default function LuxuryShowroomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full max-w-[120rem] mx-auto px-4 md:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="font-heading text-5xl md:text-7xl text-amber-100 mb-4">
            Loja de Luxo
          </h1>
          <p className="font-paragraph text-lg md:text-xl text-amber-200/70 max-w-2xl mx-auto">
            Bem-vindo à nossa vitrine exclusiva de experiências premium
          </p>
        </motion.div>
      </section>

      {/* Content Area */}
      <main className="relative w-full max-w-[120rem] mx-auto px-4 md:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <p className="font-paragraph text-base md:text-lg text-gray-300">
            Esta página está pronta para ser personalizada com seus produtos e serviços de luxo.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
