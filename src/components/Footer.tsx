import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="w-full bg-background/80 backdrop-blur-sm border-t border-secondary/30 mt-auto">
      <div className="w-full max-w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"
        >
          <div className="text-center sm:text-left">
            <p className="font-heading text-sm font-bold text-secondary">
              COMPLEXO
            </p>
            <p className="font-paragraph text-xs text-white/60">
              Servidor Online
            </p>
          </div>

          <p className="font-paragraph text-xs text-white/50 text-center">
            © 2026 Complexo. Todos os direitos reservados.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
