import { useEffect, useState } from 'react';
import { useIntelligenceSkillTreeStore } from '@/store/intelligenceSkillTreeStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Zap, TrendingUp } from 'lucide-react';

export default function IntelligenceSkillTreePage() {
  const {
    skills,
    playerMoney,
    setPlayerMoney,
    startUpgrade,
    finalizeUpgrade,
    canUpgrade,
    getRemainingTime,
    getIntelligenceBonus,
    getSkillRequirements,
    calculateUpgradeCost,
    calculateUpgradeDuration,
  } = useIntelligenceSkillTreeStore();

  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Simular atualização de tempo em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1);

      // Verificar e finalizar upgrades completados
      Object.keys(skills).forEach((skillId) => {
        const skill = skills[skillId];
        if (skill.upgrading && skill.endTime && Date.now() >= skill.endTime) {
          finalizeUpgrade(skillId);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [skills, finalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    const result = startUpgrade(skillId);
    if (!result.success) {
      alert(`Erro: ${result.error}`);
    }
  };

  const handleFinalizeUpgrade = (skillId: string) => {
    const result = finalizeUpgrade(skillId);
    if (!result.success) {
      alert(`Erro: ${result.error}`);
    }
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const skillOrder = ['inteligencia_1', 'inteligencia_2', 'inteligencia_3', 'inteligencia_4', 'inteligencia_5'];
  const intelligenceBonus = getIntelligenceBonus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 font-heading">
            Árvore de Inteligência
          </h1>
          <p className="text-lg text-slate-300 font-paragraph">
            Desenvolva suas habilidades de inteligência para dominar a operação
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-paragraph">Dinheiro Disponível</p>
                <p className="text-3xl font-bold text-white mt-2 font-heading">
                  ${playerMoney.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-paragraph">Bônus Total</p>
                <p className="text-3xl font-bold text-cyan-400 mt-2 font-heading">
                  +{intelligenceBonus.toFixed(2)}%
                </p>
              </div>
              <Zap className="w-12 h-12 text-cyan-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-paragraph">Progresso Total</p>
                <p className="text-3xl font-bold text-purple-400 mt-2 font-heading">
                  {Object.values(skills).reduce((sum, s) => sum + s.level, 0)}/
                  {Object.values(skills).reduce((sum, s) => sum + s.maxLevel, 0)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
          </div>
        </motion.div>

        {/* Skills Tree */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-6"
        >
          {skillOrder.map((skillId, index) => {
            const skill = skills[skillId];
            const requirements = getSkillRequirements(skillId);
            const cost = calculateUpgradeCost(skillId);
            const duration = calculateUpgradeDuration(skillId);
            const remainingTime = getRemainingTime(skillId);
            const canUpgradeSkill = canUpgrade(skillId);
            const progressPercent = (skill.level / skill.maxLevel) * 100;

            return (
              <motion.div
                key={skillId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSkill(selectedSkill === skillId ? null : skillId)}
                className="cursor-pointer"
              >
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/50 rounded-lg p-6 hover:border-slate-500/70 transition-all duration-300">
                  {/* Skill Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white font-heading">
                          {skill.name}
                        </h3>
                        <span className="text-sm bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full font-paragraph">
                          Nível {skill.level}/{skill.maxLevel}
                        </span>
                      </div>
                      <p className="text-slate-400 font-paragraph">{skill.description}</p>
                      <p className="text-cyan-400 text-sm mt-2 font-paragraph">
                        Efeito: {skill.effect}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4">
                      {skill.upgrading ? (
                        <div className="bg-yellow-900/40 border border-yellow-600/50 rounded-lg px-4 py-2">
                          <p className="text-yellow-400 text-sm font-bold font-heading">
                            UPGRADING
                          </p>
                          <p className="text-yellow-300 text-xs mt-1 font-paragraph">
                            {formatTime(remainingTime)}
                          </p>
                        </div>
                      ) : skill.level >= skill.maxLevel ? (
                        <div className="bg-green-900/40 border border-green-600/50 rounded-lg px-4 py-2">
                          <p className="text-green-400 text-sm font-bold font-heading">
                            MÁXIMO
                          </p>
                        </div>
                      ) : !requirements.met ? (
                        <div className="bg-red-900/40 border border-red-600/50 rounded-lg px-4 py-2">
                          <p className="text-red-400 text-sm font-bold font-heading">
                            BLOQUEADO
                          </p>
                        </div>
                      ) : (
                        <div className="bg-blue-900/40 border border-blue-600/50 rounded-lg px-4 py-2">
                          <p className="text-blue-400 text-sm font-bold font-heading">
                            DISPONÍVEL
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600/30">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-paragraph">
                      {skill.level}/{skill.maxLevel} níveis completos
                    </p>
                  </div>

                  {/* Upgrade Progress (if upgrading) */}
                  {skill.upgrading && skill.startTime && skill.endTime && (
                    <div className="mb-4 bg-slate-700/30 rounded-lg p-4 border border-yellow-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-yellow-400 font-paragraph">
                          Progresso do Upgrade
                        </span>
                        <span className="text-sm text-yellow-300 font-bold font-heading">
                          {formatTime(remainingTime)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-600/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, ((skill.startTime + (skill.endTime - skill.startTime) - Date.now()) / (skill.endTime - skill.startTime)) * -100 + 100)}%`,
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Expandable Details */}
                  {selectedSkill === skillId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-slate-600/30 space-y-4"
                    >
                      {/* Requirements */}
                      {skill.requires && skill.requires.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-300 mb-2 font-heading">
                            Requisitos
                          </h4>
                          <div className="space-y-2">
                            {!requirements.met && requirements.missing.length > 0 ? (
                              requirements.missing.map((req, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 text-red-400 text-sm font-paragraph"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  {req}
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center gap-2 text-green-400 text-sm font-paragraph">
                                <Zap className="w-4 h-4" />
                                Todos os requisitos atendidos
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Upgrade Info */}
                      {skill.level < skill.maxLevel && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-300 mb-2 font-heading">
                            Próximo Upgrade
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-700/30 rounded p-3">
                              <p className="text-xs text-slate-400 font-paragraph">Custo</p>
                              <p className="text-lg font-bold text-cyan-400 mt-1 font-heading">
                                ${cost.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-slate-700/30 rounded p-3">
                              <p className="text-xs text-slate-400 font-paragraph">Duração</p>
                              <p className="text-lg font-bold text-purple-400 mt-1 font-heading">
                                {formatTime(duration)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        {skill.upgrading ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFinalizeUpgrade(skillId);
                            }}
                            disabled={remainingTime > 0}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 font-heading"
                          >
                            {remainingTime > 0 ? 'Aguardando...' : 'Finalizar Upgrade'}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartUpgrade(skillId);
                            }}
                            disabled={!canUpgradeSkill}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 font-heading"
                          >
                            {skill.level >= skill.maxLevel
                              ? 'Máximo Atingido'
                              : !requirements.met
                              ? 'Requisitos Não Atendidos'
                              : playerMoney < cost
                              ? 'Dinheiro Insuficiente'
                              : 'Iniciar Upgrade'}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Debug Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-slate-800/50 border border-slate-600/30 rounded-lg p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 font-heading">
            Ferramentas de Desenvolvimento
          </h3>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setPlayerMoney(playerMoney + 10000)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all font-heading"
            >
              +10.000 Dinheiro
            </button>
            <button
              onClick={() => setPlayerMoney(playerMoney + 100000)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all font-heading"
            >
              +100.000 Dinheiro
            </button>
            <button
              onClick={() => setPlayerMoney(1000000)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all font-heading"
            >
              Definir 1M
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
