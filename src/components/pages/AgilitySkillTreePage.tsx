import { useState, useEffect } from 'react';
import { useAgilitySkillTreeStore } from '@/store/agilitySkillTreeStore';
import { usePlayerStore } from '@/store/playerStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, Zap } from 'lucide-react';

export default function AgilitySkillTreePage() {
  const {
    skills,
    startUpgrade,
    finalizeUpgrade,
    canUpgrade,
    getRemainingTime,
    getAgilityBonus,
    getUpgradeCost,
    getUpgradeDuration,
    isSkillUnlocked,
  } = useAgilitySkillTreeStore();

  const { playerMoney, setPlayerMoney } = usePlayerStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Update timers for upgrading skills
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      let hasActiveUpgrades = false;

      Object.values(skills).forEach((skill) => {
        if (skill.upgrading && skill.endTime) {
          const remaining = skill.endTime - Date.now();
          newTimers[skill.id] = Math.max(0, remaining);

          if (remaining <= 0) {
            finalizeUpgrade(skill.id);
          } else {
            hasActiveUpgrades = true;
          }
        }
      });

      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [skills, finalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    setIsLoading(true);
    const result = startUpgrade(skillId, playerMoney);

    if (result.success) {
      const cost = getUpgradeCost(skillId);
      setPlayerMoney(playerMoney - cost);
    } else {
      alert(result.error || 'Erro ao iniciar upgrade');
    }
    setIsLoading(false);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const skillOrder = ['agilidade_1', 'agilidade_2', 'agilidade_3', 'agilidade_4', 'agilidade_5'];
  const totalBonus = getAgilityBonus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                Árvore de Agilidade
              </h1>
              <p className="text-lg text-gray-300 font-paragraph">
                Domine a velocidade e a execução nas operações criminosas
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-cyan-400 mb-2">{totalBonus}</div>
              <p className="text-sm text-gray-400">Bônus Total</p>
            </div>
          </div>

          {/* Player Money Display */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Dinheiro Disponível:</span>
              <span className="text-2xl font-bold text-green-400">
                ${playerMoney.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Skills Tree */}
        <div className="space-y-6">
          {skillOrder.map((skillId, index) => {
            const skill = skills[skillId];
            if (!skill) return null;

            const isUnlocked = isSkillUnlocked(skillId);
            const canUpgradeSkill = canUpgrade(skillId, playerMoney);
            const cost = getUpgradeCost(skillId);
            const duration = getUpgradeDuration(skillId);
            const remainingTime = upgradeTimers[skillId] || 0;
            const progressPercent = skill.upgrading
              ? ((duration - remainingTime) / duration) * 100
              : 0;

            return (
              <motion.div
                key={skillId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {index < skillOrder.length - 1 && (
                  <div className="absolute left-12 top-full w-0.5 h-8 bg-gradient-to-b from-cyan-500 to-transparent"></div>
                )}

                <Card
                  className={`p-6 border-2 transition-all duration-300 ${
                    isUnlocked
                      ? 'border-cyan-500/50 bg-slate-700/50 hover:border-cyan-400 hover:bg-slate-700/70'
                      : 'border-gray-600/30 bg-slate-800/30 opacity-60'
                  } ${selectedSkill === skillId ? 'ring-2 ring-cyan-400' : ''}`}
                  onClick={() => setSelectedSkill(selectedSkill === skillId ? null : skillId)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Skill Icon */}
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                            : 'bg-gray-600'
                        }`}
                      >
                        {isUnlocked ? (
                          <Zap className="w-6 h-6" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>

                      {/* Skill Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold font-heading">{skill.name}</h3>
                          <span className="text-sm text-cyan-400 font-bold">
                            Nível {skill.level}/{skill.maxLevel}
                          </span>
                        </div>

                        {/* Skill Description */}
                        <p className="text-sm text-gray-300 mb-3">
                          {getSkillDescription(skillId, skill.level)}
                        </p>

                        {!isUnlocked && (
                          <p className="text-xs text-yellow-400">
                            🔒 Desbloqueado quando {getUnlockRequirement(skillId)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Level Progress Bar */}
                    <div className="w-24 flex-shrink-0">
                      <div className="bg-slate-600 rounded-full h-2 mb-1 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                          style={{
                            width: `${(skill.level / skill.maxLevel) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 text-right">
                        {Math.round((skill.level / skill.maxLevel) * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Progress */}
                  {skill.upgrading && (
                    <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-300">Upgrade em progresso...</span>
                        <span className="text-sm font-bold text-cyan-400">
                          {formatTime(remainingTime)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.1, ease: 'linear' }}
                        ></motion.div>
                      </div>
                    </div>
                  )}

                  {/* Upgrade Details */}
                  {selectedSkill === skillId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-slate-600/50 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Custo Próximo Nível:</p>
                          <p className="text-lg font-bold text-green-400">
                            ${cost.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Duração:</p>
                          <p className="text-lg font-bold text-cyan-400">
                            {formatTime(duration)}
                          </p>
                        </div>
                      </div>

                      {skill.level < skill.maxLevel && (
                        <Button
                          onClick={() => handleStartUpgrade(skillId)}
                          disabled={!canUpgradeSkill || isLoading}
                          className={`w-full py-2 rounded-lg font-bold transition-all ${
                            canUpgradeSkill
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isLoading ? (
                            <LoadingSpinner />
                          ) : canUpgradeSkill ? (
                            <>
                              <span>Fazer Upgrade</span>
                              <ChevronRight className="w-4 h-4 inline ml-2" />
                            </>
                          ) : !isUnlocked ? (
                            'Bloqueado'
                          ) : skill.level >= skill.maxLevel ? (
                            'Máximo Atingido'
                          ) : playerMoney < cost ? (
                            'Dinheiro Insuficiente'
                          ) : (
                            'Indisponível'
                          )}
                        </Button>
                      )}

                      {skill.level >= skill.maxLevel && (
                        <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/30 text-center">
                          <p className="text-green-400 font-bold">✓ Nível Máximo Atingido</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="p-6 border-cyan-500/30 bg-slate-700/50">
            <h4 className="font-bold text-cyan-400 mb-2">Efeito: Fuga de Viela</h4>
            <p className="text-sm text-gray-300">-1% tempo de operações por nível</p>
          </Card>
          <Card className="p-6 border-cyan-500/30 bg-slate-700/50">
            <h4 className="font-bold text-cyan-400 mb-2">Efeito: Direção Perigosa</h4>
            <p className="text-sm text-gray-300">+0.5% sucesso em fuga por nível</p>
          </Card>
          <Card className="p-6 border-cyan-500/30 bg-slate-700/50">
            <h4 className="font-bold text-cyan-400 mb-2">Efeito: Reflexo de Rua</h4>
            <p className="text-sm text-gray-300">-1.5% cooldown por nível</p>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function getSkillDescription(skillId: string, level: number): string {
  const descriptions: Record<string, string> = {
    agilidade_1: `Aprenda a fugir rapidamente pelas vielas. Reduz tempo de operações em ${level}%.`,
    agilidade_2: `Domine técnicas de direção perigosa. Aumenta sucesso em fugas em ${level * 0.5}%.`,
    agilidade_3: `Desenvolva reflexos de rua aguçados. Reduz cooldowns em ${level * 1.5}%.`,
    agilidade_4: `Mobilidade tática avançada. Aumenta velocidade geral em ${level}%.`,
    agilidade_5: `Velocidade estratégica máxima. Bônus global em tempo e execução: ${level}%.`,
  };
  return descriptions[skillId] || 'Skill desconhecida';
}

function getUnlockRequirement(skillId: string): string {
  const requirements: Record<string, string> = {
    agilidade_2: 'Fuga de Viela atinja nível 10',
    agilidade_3: 'Direção Perigosa atinja nível 15',
    agilidade_4: 'Reflexo de Rua atinja nível 20',
    agilidade_5: 'Mobilidade Tática atinja nível 25',
  };
  return requirements[skillId] || 'Requisitos desconhecidos';
}
