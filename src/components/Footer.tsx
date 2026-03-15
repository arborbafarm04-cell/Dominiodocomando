import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-700/50 mt-20">
      <div className="max-w-[100rem] mx-auto px-6 md:px-12 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h3 className="font-heading text-xl font-bold text-white">DOMÍNIO DO COMANDO</h3>
            <p className="font-paragraph text-sm text-slate-400">
              Mergulhe nas ruas escuras da cidade onde cada decisão conta.
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-widest">Navegação</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="font-paragraph text-sm text-slate-400 hover:text-secondary transition-colors duration-300">
                Início
              </Link>
              <Link to="/projects" className="font-paragraph text-sm text-slate-400 hover:text-secondary transition-colors duration-300">
                Projetos
              </Link>
              <Link to="/giro-no-asfalto" className="font-paragraph text-sm text-slate-400 hover:text-secondary transition-colors duration-300">
                Giro no Asfalto
              </Link>
            </nav>
          </motion.div>

          {/* Info */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-widest">Informações</h4>
            <div className="flex flex-col gap-2">
              <p className="font-paragraph text-sm text-slate-400">Contato: info@dominio.com</p>
              <p className="font-paragraph text-sm text-slate-400">Status: Online</p>
            </div>
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-widest">Redes</h4>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-secondary transition-colors duration-300">
                Twitter
              </a>
              <a href="#" className="text-slate-400 hover:text-secondary transition-colors duration-300">
                Discord
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8" />

        {/* Bottom */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="font-paragraph text-sm text-slate-500">
            © 2026 Domínio do Comando. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-paragraph text-sm text-slate-500 hover:text-slate-300 transition-colors duration-300">
              Privacidade
            </a>
            <a href="#" className="font-paragraph text-sm text-slate-500 hover:text-slate-300 transition-colors duration-300">
              Termos
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
