
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Check } from 'lucide-react';
import { useState } from 'react';
import { useInvestmentSkillTreeStore } from '@/store/investmentSkillTreeStore';

export default function ResetInvestmentPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const { skills, dirtyMoney } = useInvestmentSkillTreeStore();

  const totalSkillLevels = Object.values(skills).reduce((sum, skill) => sum + skill.level, 0);

  const handleResetInvestment = async () => {
    setIsResetting(true);
    try {
      // Reset investment skill tree store
      const store = useInvestmentSkillTreeStore.getState();
      store.resetAllSkills();

      // Clear localStorage
      localStorage.removeItem('investment-skill-tree-store');

      setResetComplete(true);

      // Reset after 3 seconds
      setTimeout(() => {
        window.location.href = '/investment-center';
      }, 3000);
    } catch (err) {
      console.error('Erro ao resetar investimentos:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-black to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl opacity-25" />
      </div>

      <div className="relative z-10">


        <div className="flex-1 w-full max-w-[100rem] mx-auto px-4 py-12 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            {!resetComplete ? (
              <div className="relative">
                {/* Spotlight glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/20 to-blue-600/10 rounded-2xl blur-2xl opacity-50" />

                <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-black/95 border-2 border-blue-500/50 rounded-2xl overflow-hidden backdrop-blur-xl p-8">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

                  {/* Header Section */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 mb-8"
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-paragraph text-sm text-blue-300/70">Ação Irreversível</p>
                      <h2 className="font-heading text-3xl text-blue-100">Resetar Investimentos</h2>
                    </div>
                  </motion.div>

                  {/* Content Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6 mb-8"
                  >
                    <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="font-paragraph text-base text-blue-200/90 leading-relaxed">
                        Esta ação irá resetar <strong>TODAS</strong> as habilidades de investimento para o estado inicial e restaurar o dinheiro sujo.
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800/50 border border-blue-500/20 rounded-lg">
                        <p className="font-paragraph text-xs text-blue-200/60 uppercase tracking-wider mb-2">Níveis Totais</p>
                        <p className="font-heading text-2xl text-blue-400 font-bold">{totalSkillLevels}</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 border border-blue-500/20 rounded-lg">
                        <p className="font-paragraph text-xs text-blue-200/60 uppercase tracking-wider mb-2">Dinheiro Sujo</p>
                        <p className="font-heading text-2xl text-blue-400 font-bold">R$ {dirtyMoney.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="font-paragraph text-sm text-yellow-200/80">
                        ⚠️ Após o reset, você será redirecionado para o Centro de Investimentos. Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-4"
                  >
                    <button
                      onClick={() => window.history.back()}
                      disabled={isResetting}
                      className="flex-1 py-4 rounded-lg font-heading text-lg font-bold transition-all border border-slate-500/30 bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleResetInvestment}
                      disabled={isResetting}
                      className="flex-1 py-4 rounded-lg font-heading text-lg font-bold transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/50"
                    >
                      {isResetting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <RotateCcw className="w-5 h-5" />
                          </motion.div>
                          <span>Resetando...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-5 h-5" />
                          <span>Resetar Tudo</span>
                        </>
                      )}
                    </button>
                  </motion.div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Spotlight glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-b from-green-500/20 to-green-600/10 rounded-2xl blur-2xl opacity-50" />

                <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-black/95 border-2 border-green-500/50 rounded-2xl overflow-hidden backdrop-blur-xl p-8 text-center">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent" />

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-heading text-3xl text-green-100 mb-4">Reset Concluído!</h3>
                    <p className="font-paragraph text-green-200/70 mb-6">
                      Todos os investimentos foram resetados com sucesso. Você será redirecionado em breve...
                    </p>
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-green-500/30 border-t-green-400 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
