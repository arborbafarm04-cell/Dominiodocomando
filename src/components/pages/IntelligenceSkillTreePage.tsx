import { useEffect, useState } from 'react';
import { useIntelligenceSkillTree } from '@/store/intelligenceSkillTreeStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Zap, Lock, CheckCircle, Clock, DollarSign } from 'lucide-react';

export default function IntelligenceSkillTreePage() {
  const {
    skills,
    playerMoney,
    startUpgrade,
    finalizeUpgrade,
    canUpgrade,
    getRemainingTime,
    getUpgradeDetails,
    isSkillUnlocked,
    getSkillRequirements,
    getSkillProgress,
    resetAllSkills,
  } = useIntelligenceSkillTree();

  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeProgress, setUpgradeProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Atualizar progresso de upgrades em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const newProgress: Record<string, number> = {};
      Object.keys(skills).forEach((skillId) => {
        newProgress[skillId] = getSkillProgress(skillId);
      });
      setUpgradeProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [skills, getSkillProgress]);

  // Auto-finalizar upgrades quando prontos
  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(skills).forEach((skillId) => {
        const skill = skills[skillId];
        if (skill.upgrading && skill.endTime && Date.now() >= skill.endTime) {
          const result = finalizeUpgrade(skillId);
          if (result.success) {
            setSuccess(`${skill.name} foi aprimorada para nível ${skill.level + 1}!`);
            setTimeout(() => setSuccess(null), 3000);
          }
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [skills, finalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    setError(null);
    setSuccess(null);

    const result = startUpgrade(skillId);
    if (result.success) {
      setSuccess(`Upgrade iniciado para ${skills[skillId].name}!`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Erro ao iniciar upgrade');
      setTimeout(() => setError(null), 5000);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-heading font-bold text-white mb-4">
            Árvore de Inteligência
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Desenvolva suas habilidades de inteligência para melhorar lucros, reduzir falhas e desbloquear operações avançadas.
          </p>

          {/* Player Money Display */}
          <div className="bg-gradient-to-r from-amber-900 to-amber-800 rounded-lg p-6 border border-amber-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-sm text-amber-200">Dinheiro Disponível</p>
                  <p className="text-3xl font-bold text-white">
                    ${playerMoney.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => resetAllSkills()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                Reset (Dev)
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg text-green-200"
          >
            {success}
          </motion.div>
        )}

        {/* Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {skillOrder.map((skillId, index) => {
            const skill = skills[skillId];
            const unlocked = isSkillUnlocked(skillId);
            const canUpgradeSkill = canUpgrade(skillId);
            const upgradeDetails = getUpgradeDetails(skillId);
            const remainingTime = getRemainingTime(skillId);
            const progress = upgradeProgress[skillId] || 0;
            const requirements = getSkillRequirements(skillId);

            return (
              <motion.div
                key={skillId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSkill(selectedSkill === skillId ? null : skillId)}
                className={`cursor-pointer rounded-lg border-2 transition-all ${
                  selectedSkill === skillId
                    ? 'border-cyan-400 bg-slate-700'
                    : unlocked
                    ? 'border-slate-600 bg-slate-800 hover:border-cyan-400'
                    : 'border-slate-700 bg-slate-900 opacity-60'
                }`}
              >
                <div className="p-6">
                  {/* Skill Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-heading font-bold text-white">
                          {skill.name}
                        </h3>
                        {!unlocked && <Lock className="w-5 h-5 text-slate-500" />}
                        {unlocked && skill.level >= skill.maxLevel && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{skill.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-400">
                        {skill.level}/{skill.maxLevel}
                      </p>
                    </div>
                  </div>

                  {/* Effect */}
                  <div className="mb-4 p-3 bg-slate-700 rounded border border-slate-600">
                    <p className="text-sm text-slate-300">
                      <span className="text-cyan-400 font-semibold">Efeito:</span> {skill.effect}
                    </p>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Upgrade Progress */}
                  {skill.upgrading && (
                    <div className="mb-4 p-3 bg-blue-900 rounded border border-blue-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-200">Upgrade em progresso</span>
                        </div>
                        <span className="text-sm font-bold text-blue-400">
                          {formatTime(remainingTime)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {!unlocked && (
                    <div className="mb-4 p-3 bg-slate-700 rounded border border-slate-600">
                      <p className="text-xs font-semibold text-slate-300 mb-2">Requisitos:</p>
                      {requirements.details.map((detail, i) => (
                        <p key={i} className="text-xs text-slate-400">
                          {detail}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Upgrade Details */}
                  {unlocked && skill.level < skill.maxLevel && (
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-700 rounded border border-slate-600">
                        <p className="text-xs text-slate-400">Custo</p>
                        <p className="text-lg font-bold text-amber-400">
                          ${upgradeDetails?.cost?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700 rounded border border-slate-600">
                        <p className="text-xs text-slate-400">Tempo</p>
                        <p className="text-lg font-bold text-cyan-400">
                          {formatTime(upgradeDetails?.duration || 0)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {unlocked && skill.level < skill.maxLevel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartUpgrade(skillId);
                      }}
                      disabled={!canUpgradeSkill || skill.upgrading}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        canUpgradeSkill && !skill.upgrading
                          ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white cursor-pointer'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-5 h-5" />
                      {skill.upgrading ? 'Atualizando...' : 'Iniciar Upgrade'}
                    </button>
                  )}

                  {skill.level >= skill.maxLevel && (
                    <div className="w-full py-3 rounded-lg font-semibold text-center bg-green-900 text-green-200 border border-green-700">
                      ✓ Máximo Atingido
                    </div>
                  )}

                  {!unlocked && (
                    <div className="w-full py-3 rounded-lg font-semibold text-center bg-slate-700 text-slate-400 border border-slate-600">
                      🔒 Bloqueado
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">
            Sobre a Árvore de Inteligência
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Progressão</h3>
              <p className="text-sm">
                A árvore de inteligência é projetada para ser completada em aproximadamente 4 meses de jogo ativo, 
                contribuindo para a meta de 2 anos de progressão total.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Impacto no Gameplay</h3>
              <p className="text-sm">
                Cada nível aumenta seus lucros, reduz chances de falha e melhora a eficiência geral das operações.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Requisitos</h3>
              <p className="text-sm">
                Cada skill requer que a anterior atinja um nível específico. Não é possível pular etapas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Balanceamento</h3>
              <p className="text-sm">
                Early game é rápido, mid game moderado, e late game extremamente lento para manter o desafio.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
