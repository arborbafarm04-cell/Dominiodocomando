import Footer from '@/components/Footer';
import LocalLoginForm from '@/components/LocalLoginForm';
import { motion } from 'framer-motion';

export default function LoginPage() {

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-[120rem] mx-auto px-4 py-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {/* Login Tabs */}
          <div className="bg-background/50 backdrop-blur-sm border-2 border-secondary/30 rounded-lg p-8 shadow-2xl">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="font-heading text-5xl font-bold text-foreground mb-2">
                Bem-vindo
              </h1>
              <p className="font-paragraph text-lg text-secondary">
                ao Jogo Multiplayer
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="font-paragraph text-foreground text-center mb-4">
                Faça login com sua conta de email para começar a jogar.
              </p>
              <div className="bg-primary/10 border-l-4 border-primary rounded px-4 py-3">
                <p className="font-paragraph text-sm text-foreground">
                  ✓ Acesso seguro com email e senha<br />
                  ✓ Sincronize seu progresso<br />
                  ✓ Jogue com amigos
                </p>
              </div>
            </div>

            {/* Local Login Form */}
            <LocalLoginForm />

            {/* Footer Text */}
            <p className="font-paragraph text-xs text-foreground/50 text-center mt-6">
              Ao fazer login, você concorda com nossos Termos de Serviço
            </p>
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-background/30 backdrop-blur-sm border border-secondary/20 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="font-heading text-sm font-bold text-foreground mb-1">
                Multiplayer
              </h3>
              <p className="font-paragraph text-xs text-foreground/70">
                Jogue com outros jogadores em tempo real
              </p>
            </div>

            <div className="bg-background/30 backdrop-blur-sm border border-secondary/20 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-heading text-sm font-bold text-foreground mb-1">
                Ranking
              </h3>
              <p className="font-paragraph text-xs text-foreground/70">
                Suba no ranking e ganhe recompensas
              </p>
            </div>

            <div className="bg-background/30 backdrop-blur-sm border border-secondary/20 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-heading text-sm font-bold text-foreground mb-1">
                Conquistas
              </h3>
              <p className="font-paragraph text-xs text-foreground/70">
                Desbloqueie conquistas e badges
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
