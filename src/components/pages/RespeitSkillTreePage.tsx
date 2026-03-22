import { useState, useEffect } from 'react';
import { useRespeitSkillTreeStore } from '@/store/respeitSkillTreeStore';
import { usePlayerStore } from '@/store/playerStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, Zap, Clock, DollarSign } from 'lucide-react';

export default function RespeitSkillTreePage() {
  const {
    skills,
    startUpgrade,
    finalizeUpgrade,
    canUpgrade,
    getRemainingTime,
    getTotalRespectLevel,
    getSkillProgress,
    getUnlockedContent,
  } = useRespeitSkillTreeStore();

  const { money, addMoney } = usePlayerStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});

  // Timer para upgrades em progresso
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      Object.keys(skills).forEach((skillId) => {
        const remaining = getRemainingTime(skillId);
        if (remaining > 0) {
          newTimers[skillId] = remaining;
        } else if (skills[skillId].upgrading && remaining <= 0) {
          // Finalizar upgrade automaticamente
          finalizeUpgrade(skillId);
        }
      });
      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [skills, getRemainingTime, finalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    const result = startUpgrade(skillId, money);
    if (result.success) {
      // Descontar dinheiro
      const skill = skills[skillId];
      const cost = Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));
      addMoney(-cost);
    }
  };

  const handleFinalizeUpgrade = (skillId: string) => {
    finalizeUpgrade(skillId);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getCost = (skillId: string) => {
    const skill = skills[skillId];
    return Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));
  };

  const getDuration = (skillId: string) => {
    const skill = skills[skillId];
    return Math.ceil(skill.baseTime * Math.pow(skill.level + 1, 1.5));
  };

  const unlockedContent = getUnlockedContent();
  const totalRespect = getTotalRespectLevel();

  const skillOrder = ['respeito_1', 'respeito_2', 'respeito_3', 'respeito_4', 'respeito_5'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-4">
            Árvore de Respeito
          </h1>
          <p className="text-lg text-cyan-400 mb-6">
            Construa sua reputação e influência no crime organizado
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-cyan-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Nível Total de Respeito</p>
                  <p className="text-3xl font-bold text-cyan-400">{totalRespect}</p>
                </div>
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-orange-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Dinheiro Disponível</p>
                  <p className="text-3xl font-bold text-orange-400">${money.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-400" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-red-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Áreas Desbloqueadas</p>
                  <p className="text-3xl font-bold text-red-400">{unlockedContent.unlockedAreas.length}</p>
                </div>
                <Lock className="w-8 h-8 text-red-400" />
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Skills Tree */}
        <div className="space-y-6 mb-12">
          {skillOrder.map((skillId, index) => {
            const skill = skills[skillId];
            const cost = getCost(skillId);
            const duration = getDuration(skillId);
            const remainingTime = upgradeTimers[skillId] || 0;
            const canUpgradeSkill = canUpgrade(skillId, money);
            const progress = getSkillProgress(skillId);

            const isLocked = skill.requires && skill.requires.length > 0 && !canUpgradeSkill && skill.level === 0;

            return (
              <motion.div
                key={skillId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSkill(selectedSkill === skillId ? null : skillId)}
                className="cursor-pointer"
              >
                <Card
                  className={`bg-gradient-to-r p-6 border-2 transition-all ${
                    selectedSkill === skillId
                      ? 'border-cyan-400 shadow-lg shadow-cyan-400/50'
                      : isLocked
                        ? 'border-gray-600 opacity-60'
                        : 'border-orange-500/50 hover:border-orange-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {index === 0 && '🏘️'}
                        {index === 1 && '👥'}
                        {index === 2 && '🕸️'}
                        {index === 3 && '👑'}
                        {index === 4 && '⚡'}
                      </div>
                      <div>
                        <h3 className="font-heading text-2xl font-bold text-white">{skill.name}</h3>
                        <p className="text-sm text-gray-400">
                          Nível {skill.level} / {skill.maxLevel}
                        </p>
                      </div>
                    </div>

                    {isLocked && <Lock className="w-6 h-6 text-gray-500" />}
                    {!isLocked && skill.level === skill.maxLevel && (
                      <div className="text-2xl">✅</div>
                    )}
                    {!isLocked && skill.level < skill.maxLevel && (
                      <ChevronRight
                        className={`w-6 h-6 transition-transform ${
                          selectedSkill === skillId ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedSkill === skillId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-slate-600 space-y-4"
                    >
                      {/* Description */}
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Descrição:</p>
                        <p className="text-white">
                          {skillId === 'respeito_1' &&
                            'Desbloqueia áreas iniciais e pequenos bônus de influência'}
                          {skillId === 'respeito_2' &&
                            'Libera NPCs locais e missões básicas'}
                          {skillId === 'respeito_3' &&
                            'Acesso a contatos estratégicos e operações melhores'}
                          {skillId === 'respeito_4' &&
                            'Libera novas regiões do mapa e bônus de autoridade'}
                          {skillId === 'respeito_5' &&
                            'Desbloqueio global de conteúdo avançado e bônus massivo de influência'}
                        </p>
                      </div>

                      {/* Requirements */}
                      {skill.requires && skill.requires.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Requisitos:</p>
                          <div className="space-y-2">
                            {skill.requires.map((reqId) => {
                              const reqSkill = skills[reqId];
                              const reqLevel =
                                reqId === 'respeito_1'
                                  ? 10
                                  : reqId === 'respeito_2'
                                    ? 15
                                    : reqId === 'respeito_3'
                                      ? 20
                                      : 25;
                              const isMet = reqSkill.level >= reqLevel;

                              return (
                                <div
                                  key={reqId}
                                  className={`text-sm ${isMet ? 'text-green-400' : 'text-red-400'}`}
                                >
                                  {isMet ? '✓' : '✗'} {reqSkill.name} nível {reqLevel}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Upgrade Info */}
                      {skill.level < skill.maxLevel && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Custo do Próximo Upgrade</p>
                            <p className="text-xl font-bold text-orange-400">${cost.toLocaleString()}</p>
                          </div>
                          <div className="bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Tempo de Upgrade</p>
                            <p className="text-xl font-bold text-cyan-400">{formatTime(duration)}</p>
                          </div>
                        </div>
                      )}

                      {/* Upgrade Status */}
                      {skill.upgrading && remainingTime > 0 && (
                        <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <p className="text-sm text-blue-400">Upgrade em Progresso</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-300">{formatTime(remainingTime)}</p>
                          <div className="w-full bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${100 - (remainingTime / getDuration(skillId)) * 100}%`,
                              }}
                              transition={{ duration: 0.1 }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        {skill.level < skill.maxLevel && !skill.upgrading && (
                          <Button
                            onClick={() => handleStartUpgrade(skillId)}
                            disabled={!canUpgradeSkill}
                            className={`flex-1 ${
                              canUpgradeSkill
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                                : 'bg-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {canUpgradeSkill ? 'Iniciar Upgrade' : 'Requisitos Não Atendidos'}
                          </Button>
                        )}

                        {skill.upgrading && remainingTime <= 0 && (
                          <Button
                            onClick={() => handleFinalizeUpgrade(skillId)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            Finalizar Upgrade
                          </Button>
                        )}

                        {skill.level === skill.maxLevel && (
                          <Button disabled className="flex-1 bg-gray-600">
                            Nível Máximo Atingido
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Unlocked Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {/* Unlocked Areas */}
          <Card className="bg-slate-800/50 border-cyan-500/30 p-6">
            <h3 className="font-heading text-xl font-bold text-cyan-400 mb-4">Áreas Desbloqueadas</h3>
            <div className="space-y-2">
              {unlockedContent.unlockedAreas.length > 0 ? (
                unlockedContent.unlockedAreas.map((area, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="text-sm text-cyan-300 flex items-center gap-2"
                  >
                    <span className="text-cyan-400">✓</span> {area}
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma área desbloqueada ainda</p>
              )}
            </div>
          </Card>

          {/* Unlocked NPCs */}
          <Card className="bg-slate-800/50 border-orange-500/30 p-6">
            <h3 className="font-heading text-xl font-bold text-orange-400 mb-4">NPCs Disponíveis</h3>
            <div className="space-y-2">
              {unlockedContent.unlockedNPCs.length > 0 ? (
                unlockedContent.unlockedNPCs.map((npc, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="text-sm text-orange-300 flex items-center gap-2"
                  >
                    <span className="text-orange-400">✓</span> {npc}
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum NPC disponível ainda</p>
              )}
            </div>
          </Card>

          {/* Unlocked Missions */}
          <Card className="bg-slate-800/50 border-red-500/30 p-6">
            <h3 className="font-heading text-xl font-bold text-red-400 mb-4">Missões Disponíveis</h3>
            <div className="space-y-2">
              {unlockedContent.unlockedMissions.length > 0 ? (
                unlockedContent.unlockedMissions.map((mission, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="text-sm text-red-300 flex items-center gap-2"
                  >
                    <span className="text-red-400">✓</span> {mission}
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma missão disponível ainda</p>
              )}
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
