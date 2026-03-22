import { useEffect, useState } from 'react';
import { useAttackSkillTreeStore } from '@/store/attackSkillTreeStore';
import { usePlayerStore } from '@/store/playerStore';
import { motion } from 'framer-motion';
import { Zap, Lock, CheckCircle, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AttackSkillTreePage() {
  const { skills, startUpgrade, finalizeUpgrade, canUpgrade, getRemainingTime, getAttackBonus, getSkillProgress } =
    useAttackSkillTreeStore();
  const { cleanMoney, dirtyMoney, updateMoney } = usePlayerStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeInProgress, setUpgradeInProgress] = useState<Record<string, boolean>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<string, number>>({});

  const totalMoney = cleanMoney + dirtyMoney;
  const attackBonus = getAttackBonus();

  // Atualizar tempos restantes
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes: Record<string, number> = {};
      Object.keys(skills).forEach((skillId) => {
        const skill = skills[skillId];
        if (skill.upgrading) {
          newTimes[skillId] = getRemainingTime(skillId);
        }
      });
      setRemainingTimes(newTimes);
    }, 100);

    return () => clearInterval(interval);
  }, [skills, getRemainingTime]);

  // Verificar upgrades completos
  useEffect(() => {
    Object.keys(skills).forEach((skillId) => {
      const skill = skills[skillId];
      if (skill.upgrading && remainingTimes[skillId] !== undefined && remainingTimes[skillId] <= 0) {
        const result = finalizeUpgrade(skillId);
        if (result.success) {
          setUpgradeInProgress((prev) => ({ ...prev, [skillId]: false }));
        }
      }
    });
  }, [remainingTimes, skills, finalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    const result = startUpgrade(skillId, totalMoney);

    if (result.success) {
      // Descontar dinheiro
      const cost = Math.floor(
        skills[skillId].baseCost * Math.pow(skills[skillId].level + 1, 1.8)
      );
      updateMoney(-cost);
      setUpgradeInProgress((prev) => ({ ...prev, [skillId]: true }));
    } else {
      alert(result.message);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const skillOrder = ['ataque_1', 'ataque_2', 'ataque_3', 'ataque_4', 'ataque_5'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="max-w-[100rem] mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-orange-500" />
            <h1 className="font-heading text-5xl font-bold text-orange-500">Árvore de Ataque</h1>
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
          <p className="font-paragraph text-lg text-slate-300 mb-4">
            Desenvolva suas habilidades ofensivas e domine o território
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-lg p-4"
            >
              <p className="font-paragraph text-sm text-slate-400 mb-1">Bônus de Ataque Total</p>
              <p className="font-heading text-3xl font-bold text-orange-400">+{attackBonus.toFixed(1)}%</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-4"
            >
              <p className="font-paragraph text-sm text-slate-400 mb-1">Dinheiro Disponível</p>
              <p className="font-heading text-3xl font-bold text-green-400">{formatCurrency(totalMoney)}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg p-4"
            >
              <p className="font-paragraph text-sm text-slate-400 mb-1">Nível Total</p>
              <p className="font-heading text-3xl font-bold text-cyan-400">
                {Object.values(skills).reduce((sum, skill) => sum + skill.level, 0)}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Skills Tree */}
        <div className="space-y-6">
          {skillOrder.map((skillId, index) => {
            const skill = skills[skillId];
            const isUpgrading = skill.upgrading;
            const remainingTime = remainingTimes[skillId] || 0;
            const progress = getSkillProgress(skillId);
            const canUpgradeSkill = canUpgrade(skillId, totalMoney);
            const upgradeCost = Math.floor(skill.baseCost * Math.pow(skill.level + 1, 1.8));

            return (
              <motion.div
                key={skillId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSkill(selectedSkill === skillId ? null : skillId)}
                className="cursor-pointer"
              >
                <div
                  className={`bg-gradient-to-r from-slate-800 to-slate-700 border-2 rounded-lg p-6 transition-all ${
                    selectedSkill === skillId
                      ? 'border-orange-500 shadow-lg shadow-orange-500/50'
                      : 'border-slate-600 hover:border-orange-500/50'
                  }`}
                >
                  {/* Skill Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="font-heading text-2xl font-bold text-orange-400">{skill.name}</h2>
                        {skill.level >= skill.maxLevel && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                        {skill.requires && skill.requires.length > 0 && skill.level === 0 && (
                          <Lock className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <p className="font-paragraph text-sm text-slate-400">{skill.effect}</p>
                    </div>

                    {/* Level Badge */}
                    <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-4 py-2 text-center">
                      <p className="font-heading text-2xl font-bold text-orange-400">{skill.level}</p>
                      <p className="font-paragraph text-xs text-slate-400">/ {skill.maxLevel}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Expandable Details */}
                  {selectedSkill === skillId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-slate-600 space-y-4"
                    >
                      {/* Requirements */}
                      {skill.requires && skill.requires.length > 0 && (
                        <div>
                          <p className="font-paragraph text-sm text-slate-400 mb-2">Requisitos:</p>
                          <div className="space-y-1">
                            {skill.requires.map((reqId) => {
                              const reqSkill = skills[reqId];
                              const requirementMap: Record<string, number> = {
                                ataque_1: 0,
                                ataque_2: 10,
                                ataque_3: 15,
                                ataque_4: 20,
                                ataque_5: 25,
                              };
                              const requiredLevel = requirementMap[skillId] || 0;
                              const isMet = reqSkill.level >= requiredLevel;

                              return (
                                <div
                                  key={reqId}
                                  className={`font-paragraph text-sm flex items-center gap-2 ${
                                    isMet ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {isMet ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <Lock className="w-4 h-4" />
                                  )}
                                  {reqSkill.name} nível {requiredLevel}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Upgrade Info */}
                      {skill.level < skill.maxLevel && (
                        <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="font-paragraph text-sm text-slate-400">Custo do Próximo Nível:</span>
                            <span className="font-heading text-sm font-bold text-green-400">
                              {formatCurrency(upgradeCost)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-paragraph text-sm text-slate-400">Duração:</span>
                            <span className="font-heading text-sm font-bold text-cyan-400">
                              {formatTime(skill.baseTime * Math.pow(skill.level + 1, 1.5))}
                            </span>
                          </div>

                          {/* Upgrade Button */}
                          {isUpgrading ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-paragraph text-sm text-slate-400 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  Tempo Restante:
                                </span>
                                <span className="font-heading text-sm font-bold text-orange-400">
                                  {formatTime(remainingTime)}
                                </span>
                              </div>
                              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 0.1 }}
                                />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartUpgrade(skillId);
                              }}
                              disabled={!canUpgradeSkill}
                              className={`w-full py-2 rounded-lg font-heading font-bold transition-all ${
                                canUpgradeSkill
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/50 cursor-pointer'
                                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {skill.level >= skill.maxLevel ? 'Máximo Atingido' : 'Iniciar Upgrade'}
                            </button>
                          )}
                        </div>
                      )}

                      {skill.level >= skill.maxLevel && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
                          <p className="font-heading text-sm font-bold text-green-400">✓ Nível Máximo Atingido</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600 rounded-lg p-6"
        >
          <h3 className="font-heading text-xl font-bold text-orange-400 mb-4">Sobre a Árvore de Ataque</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-paragraph text-sm text-slate-300 mb-3">
                A Árvore de Ataque representa sua força ofensiva no mundo do crime organizado. Cada nível aumenta suas
                chances de sucesso em ações agressivas e melhora o ganho de recursos.
              </p>
              <p className="font-paragraph text-sm text-slate-400">
                Progresso esperado: ~4 meses dentro da progressão total de 2 anos.
              </p>
            </div>
            <div>
              <p className="font-paragraph text-sm text-slate-300 mb-3">
                <strong>Dicas:</strong>
              </p>
              <ul className="font-paragraph text-sm text-slate-400 space-y-1">
                <li>• Comece com "Abordagem Rápida" para ganhos rápidos</li>
                <li>• Cumpra requisitos para desbloquear novas habilidades</li>
                <li>• Upgrades mais altos levam mais tempo e custam mais</li>
                <li>• Seu bônus total é exibido no topo da página</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
