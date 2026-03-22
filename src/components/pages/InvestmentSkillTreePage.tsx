import React, { useState, useRef, useEffect } from 'react';
import { useSkillTreeStore, SkillNode } from '@/store/skillTreeStore';
import { useAgilitySkillTreeStore } from '@/store/agilitySkillTreeStore';
import { useAttackSkillTreeStore } from '@/store/attackSkillTreeStore';
import { useDefenseSkillTreeStore } from '@/store/defenseSkillTreeStore';
import { useRespeitSkillTreeStore } from '@/store/respeitSkillTreeStore';
import { useVigorSkillTreeStore } from '@/store/vigorSkillTreeStore';
import { usePlayerStore } from '@/store/playerStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Brain,
  Zap,
  Sword,
  Shield,
  Crown,
  Heart,
  Lock,
  Flame,
  Target,
  Ear,
  Cpu,
  Gauge,
  Users,
  AlertCircle,
  Check,
  ChevronUp,
  ChevronDown,
  Clock,
  CheckCircle,
} from 'lucide-react';

const TREE_COLORS = {
  inteligencia: { bg: '#1e3a8a', border: '#3b82f6', glow: '#60a5fa', icon: Brain },
  agilidade: { bg: '#7c2d12', border: '#ea580c', glow: '#fb923c', icon: Zap },
  ataque: { bg: '#7c1d1d', border: '#dc2626', glow: '#ef4444', icon: Sword },
  defesa: { bg: '#1e3a3a', border: '#14b8a6', glow: '#2dd4bf', icon: Shield },
  respeito: { bg: '#3f2d1f', border: '#d97706', glow: '#fbbf24', icon: Crown },
  vigor: { bg: '#2d1f3f', border: '#a855f7', glow: '#d8b4fe', icon: Heart },
};

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Brain,
  Ear,
  Cpu,
  Zap,
  Gauge,
  Sword,
  Flame,
  Target,
  Shield,
  Lock,
  Crown,
  Users,
  Heart,
};

interface SkillNodeProps {
  skill: SkillNode;
  canUpgrade: boolean;
  onUpgrade: (skillId: string) => void;
  isUpgrading: boolean;
  treeColor: (typeof TREE_COLORS)[keyof typeof TREE_COLORS];
}

const SkillNodeComponent: React.FC<SkillNodeProps> = ({
  skill,
  canUpgrade,
  onUpgrade,
  isUpgrading,
  treeColor,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isLocked = !canUpgrade && skill.level === 0;
  const isCompleted = skill.level >= skill.maxLevel;
  const isAvailable = canUpgrade && !isCompleted;

  const getStateColor = () => {
    if (isCompleted) return 'from-green-500 to-green-600';
    if (isAvailable) return `from-${treeColor.border} to-${treeColor.glow}`;
    return 'from-gray-600 to-gray-700';
  };

  const IconComponent = ICON_MAP[skill.icon] || Brain;

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative"
        whileHover={!isLocked ? { scale: 1.05 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
      >
        <div
          className={`relative w-24 h-24 rounded-lg cursor-pointer transition-all duration-300 ${
            isLocked ? 'cursor-not-allowed opacity-60' : ''
          }`}
          style={{
            background: isCompleted
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : isAvailable
                ? `linear-gradient(135deg, ${treeColor.border} 0%, ${treeColor.glow} 100%)`
                : 'linear-gradient(135deg, #4b5563 0%, #2d3748 100%)',
            boxShadow: isCompleted
              ? '0 0 20px rgba(16, 185, 129, 0.6)'
              : isAvailable
                ? `0 0 20px ${treeColor.glow}80`
                : '0 0 10px rgba(0, 0, 0, 0.5)',
            border: `2px solid ${
              isCompleted ? '#10b981' : isAvailable ? treeColor.border : '#4b5563'
            }`,
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => {
            if (canUpgrade && !isCompleted) {
              onUpgrade(skill.id);
            }
          }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <IconComponent
              size={32}
              className={`${
                isCompleted ? 'text-white' : isAvailable ? 'text-white' : 'text-gray-400'
              }`}
            />
          </div>

          {isLocked && (
            <div className="absolute top-1 right-1 bg-red-600 rounded-full p-1">
              <Lock size={12} className="text-white" />
            </div>
          )}

          {isCompleted && (
            <div className="absolute top-1 right-1 bg-green-600 rounded-full p-1">
              <Check size={12} className="text-white" />
            </div>
          )}
        </div>
      </motion.div>

      <div className="mt-2 text-center">
        <p className="text-xs font-bold text-white truncate w-24">{skill.name}</p>
        <p
          className="text-xs font-semibold"
          style={{
            color: isCompleted ? '#10b981' : isAvailable ? treeColor.glow : '#9ca3af',
          }}
        >
          {skill.level}/{skill.maxLevel}
        </p>
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 w-48 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg"
          >
            <p className="text-xs font-bold text-white mb-1">{skill.name}</p>
            <p className="text-xs text-gray-300 mb-2">{skill.description}</p>

            {!isCompleted && (
              <div className="text-xs text-yellow-400 font-semibold mb-2">
                Custo: ${(skill.baseCost * (skill.level + 1)).toLocaleString()}
              </div>
            )}

            {skill.requires && skill.requires.length > 0 && (
              <div className="text-xs text-orange-400 mb-2">
                <p className="font-semibold">Requer:</p>
                {skill.requires.map((req) => (
                  <p key={req} className="text-orange-300">
                    • {req}
                  </p>
                ))}
              </div>
            )}

            {isCompleted && (
              <div className="text-xs text-green-400 font-semibold">✓ Completo</div>
            )}

            {isLocked && (
              <div className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <AlertCircle size={12} />
                Bloqueado
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SkillTreeProps {
  treeKey: keyof typeof TREE_COLORS;
  title: string;
}

const SkillTree: React.FC<SkillTreeProps> = ({ treeKey, title }) => {
  const {
    skills,
    getSkillsByTree,
    canUpgradeSkill,
    upgradeSkill,
    isUpgrading,
  } = useSkillTreeStore();

  const treeSkills = getSkillsByTree(treeKey);
  const treeColor = TREE_COLORS[treeKey];

  const handleUpgrade = (skillId: string) => {
    upgradeSkill(skillId);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-800">
      <div className="text-center">
        <h3
          className="text-2xl font-bold mb-2"
          style={{ color: treeColor.glow }}
        >
          {title}
        </h3>
        <div
          className="h-1 w-12 mx-auto rounded"
          style={{ backgroundColor: treeColor.glow }}
        />
      </div>

      <div className="flex flex-col gap-12 w-full">
        {treeSkills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            {index > 0 && (
              <div
                className="h-8 w-1 mb-4"
                style={{
                  background: `linear-gradient(180deg, ${treeColor.glow}80 0%, ${treeColor.glow}20 100%)`,
                }}
              />
            )}

            <SkillNodeComponent
              skill={skill}
              canUpgrade={canUpgradeSkill(skill.id)}
              onUpgrade={handleUpgrade}
              isUpgrading={isUpgrading}
              treeColor={treeColor}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Agility Skill Component
function AgilitySkillSection() {
  const {
    skills: agilitySkills,
    startUpgrade: agilityStartUpgrade,
    finalizeUpgrade: agilityFinalizeUpgrade,
    canUpgrade: agilityCanUpgrade,
    getRemainingTime: agilityGetRemainingTime,
    getAgilityBonus,
    getUpgradeCost: agilityGetUpgradeCost,
    getUpgradeDuration: agilityGetUpgradeDuration,
    isSkillUnlocked: agilityIsSkillUnlocked,
  } = useAgilitySkillTreeStore();

  const { playerMoney, setPlayerMoney } = usePlayerStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      let hasActiveUpgrades = false;

      Object.values(agilitySkills).forEach((skill) => {
        if (skill.upgrading && skill.endTime) {
          const remaining = skill.endTime - Date.now();
          newTimers[skill.id] = Math.max(0, remaining);

          if (remaining <= 0) {
            agilityFinalizeUpgrade(skill.id);
          } else {
            hasActiveUpgrades = true;
          }
        }
      });

      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [agilitySkills, agilityFinalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    setIsLoading(true);
    const result = agilityStartUpgrade(skillId, playerMoney);

    if (result.success) {
      const cost = agilityGetUpgradeCost(skillId);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-cyan-400">Árvore de Agilidade</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-400">{totalBonus}</div>
          <p className="text-xs text-gray-400">Bônus Total</p>
        </div>
      </div>

      {skillOrder.map((skillId, index) => {
        const skill = agilitySkills[skillId];
        if (!skill) return null;

        const isUnlocked = agilityIsSkillUnlocked(skillId);
        const canUpgradeSkill = agilityCanUpgrade(skillId, playerMoney);
        const cost = agilityGetUpgradeCost(skillId);
        const duration = agilityGetUpgradeDuration(skillId);
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
            {index < skillOrder.length - 1 && (
              <div className="absolute left-12 top-full w-0.5 h-8 bg-gradient-to-b from-cyan-500 to-transparent"></div>
            )}

            <Card
              className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                isUnlocked
                  ? 'border-cyan-500/50 bg-slate-700/50 hover:border-cyan-400 hover:bg-slate-700/70'
                  : 'border-gray-600/30 bg-slate-800/30 opacity-60'
              } ${selectedSkill === skillId ? 'ring-2 ring-cyan-400' : ''}`}
              onClick={() => setSelectedSkill(selectedSkill === skillId ? null : skillId)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
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

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold font-heading">{skill.name}</h3>
                      <span className="text-sm text-cyan-400 font-bold">
                        Nível {skill.level}/{skill.maxLevel}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mb-3">
                      {getAgilitySkillDescription(skillId, skill.level)}
                    </p>

                    {!isUnlocked && (
                      <p className="text-xs text-yellow-400">
                        🔒 Desbloqueado quando {getAgilityUnlockRequirement(skillId)}
                      </p>
                    )}
                  </div>
                </div>

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
  );
}

// Defense Skill Component
function DefenseSkillSection() {
  const {
    skills: defenseSkills,
    startUpgrade: defenseStartUpgrade,
    finalizeUpgrade: defenseFinalizeUpgrade,
    canUpgrade: defenseCanUpgrade,
    getRemainingTime: defenseGetRemainingTime,
    getUpgradeCost: defenseGetUpgradeCost,
    getUpgradeDuration: defenseGetUpgradeDuration,
    getDefenseBonus,
  } = useDefenseSkillTreeStore();

  const { cleanMoney, dirtyMoney } = usePlayerStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});

  const totalMoney = cleanMoney + dirtyMoney;

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      Object.keys(defenseSkills).forEach((skillId) => {
        const skill = defenseSkills[skillId];
        if (skill.upgrading) {
          const remaining = defenseGetRemainingTime(skillId);
          newTimers[skillId] = remaining;

          if (remaining <= 0) {
            defenseFinalizeUpgrade(skillId);
          }
        }
      });
      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [defenseSkills, defenseGetRemainingTime, defenseFinalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    const result = defenseStartUpgrade(skillId, totalMoney);
    if (result.success) {
      setSelectedSkill(skillId);
    }
  };

  const formatTime = (ms: number) => {
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

  const skillOrder = ['defesa_1', 'defesa_2', 'defesa_3', 'defesa_4', 'defesa_5'];
  const orderedSkills = skillOrder.map((id) => defenseSkills[id]).filter(Boolean);
  const defenseBonus = getDefenseBonus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-cyan-400">Árvore de Defesa</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-400">+{(defenseBonus * 100).toFixed(1)}%</div>
          <p className="text-xs text-gray-400">Bônus Total</p>
        </div>
      </div>

      {orderedSkills.map((skill, index) => {
        const isLocked =
          skill.requires && skill.requires.length > 0
            ? skill.requires.some((reqId) => {
                const reqSkill = defenseSkills[reqId];
                let requiredLevel = 0;
                if (reqId === 'defesa_1' && skill.id === 'defesa_2') requiredLevel = 10;
                if (reqId === 'defesa_2' && skill.id === 'defesa_3') requiredLevel = 15;
                if (reqId === 'defesa_3' && skill.id === 'defesa_4') requiredLevel = 20;
                if (reqId === 'defesa_4' && skill.id === 'defesa_5') requiredLevel = 25;
                return reqSkill.level < requiredLevel;
              })
            : false;

        const canUpgradeSkill = defenseCanUpgrade(skill.id, totalMoney);
        const upgradeCost = defenseGetUpgradeCost(skill.id);
        const upgradeDuration = defenseGetUpgradeDuration(skill.id);
        const remainingTime = upgradeTimers[skill.id] || 0;

        return (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {index < orderedSkills.length - 1 && (
              <div className="absolute left-12 top-full w-0.5 h-8 bg-gradient-to-b from-cyan-500 to-transparent"></div>
            )}

            <Card
              className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                isLocked
                  ? 'border-gray-600/30 bg-slate-800/30 opacity-60'
                  : 'border-cyan-500/50 bg-slate-700/50 hover:border-cyan-400 hover:bg-slate-700/70'
              } ${selectedSkill === skill.id ? 'ring-2 ring-cyan-400' : ''}`}
              onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      !isLocked
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                        : 'bg-gray-600'
                    }`}
                  >
                    {!isLocked ? (
                      <Shield className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold font-heading">{skill.name}</h3>
                      <span className="text-sm text-cyan-400 font-bold">
                        Nível {skill.level}/{skill.maxLevel}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mb-3">
                      {getDefenseSkillDescription(skill.id, skill.level)}
                    </p>

                    {isLocked && (
                      <p className="text-xs text-yellow-400">
                        🔒 Desbloqueado quando requisitos forem atendidos
                      </p>
                    )}
                  </div>
                </div>

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
                      animate={{ width: `${((upgradeDuration - remainingTime) / upgradeDuration) * 100}%` }}
                      transition={{ duration: 0.1, ease: 'linear' }}
                    ></motion.div>
                  </div>
                </div>
              )}

              {selectedSkill === skill.id && (
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
                        ${upgradeCost.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duração:</p>
                      <p className="text-lg font-bold text-cyan-400">
                        {formatTime(upgradeDuration)}
                      </p>
                    </div>
                  </div>

                  {skill.level < skill.maxLevel && (
                    <Button
                      onClick={() => handleStartUpgrade(skill.id)}
                      disabled={!canUpgradeSkill}
                      className={`w-full py-2 rounded-lg font-bold transition-all ${
                        canUpgradeSkill
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canUpgradeSkill ? 'Fazer Upgrade' : 'Requisitos Não Atendidos'}
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
  );
}

// Respect Skill Component
function RespeitSkillSection() {
  const {
    skills: respeitSkills,
    startUpgrade: respeitStartUpgrade,
    finalizeUpgrade: respeitFinalizeUpgrade,
    canUpgrade: respeitCanUpgrade,
    getRemainingTime: respeitGetRemainingTime,
    getRespectBonus,
    getSkillProgress,
  } = useRespeitSkillTreeStore();

  const { cleanMoney, dirtyMoney } = usePlayerStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});

  const totalMoney = cleanMoney + dirtyMoney;

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      Object.keys(respeitSkills).forEach((skillId) => {
        const remaining = respeitGetRemainingTime(skillId);
        if (remaining > 0) {
          newTimers[skillId] = remaining;
        } else if (respeitSkills[skillId].upgrading && remaining <= 0) {
          respeitFinalizeUpgrade(skillId);
        }
      });
      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [respeitSkills, respeitGetRemainingTime, respeitFinalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    const result = respeitStartUpgrade(skillId, totalMoney);
    if (result.success) {
      setSelectedSkill(skillId);
    }
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
    const skill = respeitSkills[skillId];
    return Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));
  };

  const getDuration = (skillId: string) => {
    const skill = respeitSkills[skillId];
    return Math.ceil(skill.baseTime * Math.pow(skill.level + 1, 1.5));
  };

  const totalRespect = getRespectBonus();
  const skillOrder = ['respeito_1', 'respeito_2', 'respeito_3', 'respeito_4', 'respeito_5'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-orange-400">Árvore de Respeito</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-400">{totalRespect}</div>
          <p className="text-xs text-gray-400">Nível Total</p>
        </div>
      </div>

      {skillOrder.map((skillId, index) => {
        const skill = respeitSkills[skillId];
        const cost = getCost(skillId);
        const duration = getDuration(skillId);
        const remainingTime = upgradeTimers[skillId] || 0;
        const canUpgradeSkill = respeitCanUpgrade(skillId, totalMoney);
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
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${
                      selectedSkill === skillId ? 'rotate-180' : ''
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
  );
}

// Vigor Skill Component
function VigorSkillSection() {
  const {
    skills: vigorSkills,
    startUpgrade: vigorStartUpgrade,
    finalizeUpgrade: vigorFinalizeUpgrade,
    canUpgrade: vigorCanUpgrade,
    getRemainingTime: vigorGetRemainingTime,
    getVigorStats,
    getUpgradeCost: vigorGetUpgradeCost,
    getUpgradeDuration: vigorGetUpgradeDuration,
    isSkillUnlocked: vigorIsSkillUnlocked,
  } = useVigorSkillTreeStore();

  const { playerMoney, setPlayerMoney } = usePlayerStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      let hasActiveUpgrades = false;

      Object.values(vigorSkills).forEach((skill) => {
        if (skill.upgrading && skill.endTime) {
          const remaining = skill.endTime - Date.now();
          newTimers[skill.id] = Math.max(0, remaining);

          if (remaining <= 0) {
            vigorFinalizeUpgrade(skill.id);
          } else {
            hasActiveUpgrades = true;
          }
        }
      });

      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [vigorSkills, vigorFinalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    setIsLoading(true);
    const result = vigorStartUpgrade(skillId, playerMoney);

    if (result.success) {
      const cost = vigorGetUpgradeCost(skillId);
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

  const skillOrder = ['vigor_1', 'vigor_2', 'vigor_3', 'vigor_4', 'vigor_5'];
  const vigorStats = getVigorStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-purple-400">Árvore de Vigor</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400">{vigorStats.maxEnergy.toFixed(0)}</div>
          <p className="text-xs text-gray-400">Energia Máxima</p>
        </div>
      </div>

      {skillOrder.map((skillId, index) => {
        const skill = vigorSkills[skillId];
        if (!skill) return null;

        const isUnlocked = vigorIsSkillUnlocked(skillId);
        const canUpgradeSkill = vigorCanUpgrade(skillId, playerMoney);
        const cost = vigorGetUpgradeCost(skillId);
        const duration = vigorGetUpgradeDuration(skillId);
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
            {index < skillOrder.length - 1 && (
              <div className="absolute left-12 top-full w-0.5 h-8 bg-gradient-to-b from-purple-500 to-transparent"></div>
            )}

            <Card
              className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                isUnlocked
                  ? 'border-purple-500/50 bg-slate-700/50 hover:border-purple-400 hover:bg-slate-700/70'
                  : 'border-gray-600/30 bg-slate-800/30 opacity-60'
              } ${selectedSkill === skillId ? 'ring-2 ring-purple-400' : ''}`}
              onClick={() => setSelectedSkill(selectedSkill === skillId ? null : skillId)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                        : 'bg-gray-600'
                    }`}
                  >
                    {isUnlocked ? (
                      <Heart className="w-6 h-6" />
                    ) : (
                      <Lock className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold font-heading">{skill.name}</h3>
                      <span className="text-sm text-purple-400 font-bold">
                        Nível {skill.level}/{skill.maxLevel}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mb-3">
                      {getVigorSkillDescription(skillId, skill.level)}
                    </p>

                    {!isUnlocked && (
                      <p className="text-xs text-yellow-400">
                        🔒 Desbloqueado quando {getVigorUnlockRequirement(skillId)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-24 flex-shrink-0">
                  <div className="bg-slate-600 rounded-full h-2 mb-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-full transition-all duration-300"
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

              {skill.upgrading && (
                <div className="mb-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-300">Upgrade em progresso...</span>
                    <span className="text-sm font-bold text-purple-400">
                      {formatTime(remainingTime)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.1, ease: 'linear' }}
                    ></motion.div>
                  </div>
                </div>
              )}

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
                      <p className="text-lg font-bold text-purple-400">
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
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : canUpgradeSkill ? (
                        <>
                          <span>Fazer Upgrade</span>
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
  );
}

// Attack Skill Component
function AttackSkillSection() {
  const { skills: attackSkills, startUpgrade: attackStartUpgrade, finalizeUpgrade: attackFinalizeUpgrade, canUpgrade: attackCanUpgrade, getRemainingTime: attackGetRemainingTime, getAttackBonus, getSkillProgress } =
    useAttackSkillTreeStore();
  const { cleanMoney, dirtyMoney, updateMoney } = usePlayerStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeInProgress, setUpgradeInProgress] = useState<Record<string, boolean>>({});
  const [remainingTimes, setRemainingTimes] = useState<Record<string, number>>({});

  const totalMoney = cleanMoney + dirtyMoney;
  const attackBonus = getAttackBonus();

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes: Record<string, number> = {};
      Object.keys(attackSkills).forEach((skillId) => {
        const skill = attackSkills[skillId];
        if (skill.upgrading) {
          newTimes[skillId] = attackGetRemainingTime(skillId);
        }
      });
      setRemainingTimes(newTimes);
    }, 100);

    return () => clearInterval(interval);
  }, [attackSkills, attackGetRemainingTime]);

  useEffect(() => {
    Object.keys(attackSkills).forEach((skillId) => {
      const skill = attackSkills[skillId];
      if (skill.upgrading && remainingTimes[skillId] !== undefined && remainingTimes[skillId] <= 0) {
        const result = attackFinalizeUpgrade(skillId);
        if (result.success) {
          setUpgradeInProgress((prev) => ({ ...prev, [skillId]: false }));
        }
      }
    });
  }, [remainingTimes, attackSkills, attackFinalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    const result = attackStartUpgrade(skillId, totalMoney);

    if (result.success) {
      const cost = Math.floor(
        attackSkills[skillId].baseCost * Math.pow(attackSkills[skillId].level + 1, 1.8)
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

  const skillOrder = ['ataque_1', 'ataque_2', 'ataque_3', 'ataque_4', 'ataque_5'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-orange-400">Árvore de Ataque</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-400">+{attackBonus.toFixed(1)}%</div>
          <p className="text-xs text-gray-400">Bônus Total</p>
        </div>
      </div>

      {skillOrder.map((skillId, index) => {
        const skill = attackSkills[skillId];
        const isUpgrading = skill.upgrading;
        const remainingTime = remainingTimes[skillId] || 0;
        const progress = getSkillProgress(skillId);
        const canUpgradeSkill = attackCanUpgrade(skillId, totalMoney);
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

                <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-4 py-2 text-center">
                  <p className="font-heading text-2xl font-bold text-orange-400">{skill.level}</p>
                  <p className="font-paragraph text-xs text-slate-400">/ {skill.maxLevel}</p>
                </div>
              </div>

              <div className="mb-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {selectedSkill === skillId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-slate-600 space-y-4"
                >
                  {skill.requires && skill.requires.length > 0 && (
                    <div>
                      <p className="font-paragraph text-sm text-slate-400 mb-2">Requisitos:</p>
                      <div className="space-y-1">
                        {skill.requires.map((reqId) => {
                          const reqSkill = attackSkills[reqId];
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

                  {skill.level < skill.maxLevel && (
                    <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="font-paragraph text-sm text-slate-400">Custo do Próximo Nível:</span>
                        <span className="font-heading text-sm font-bold text-green-400">
                          ${upgradeCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-sm text-slate-400">Duração:</span>
                        <span className="font-heading text-sm font-bold text-cyan-400">
                          {formatTime(skill.baseTime * Math.pow(skill.level + 1, 1.5))}
                        </span>
                      </div>

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
  );
}

export default function InvestmentSkillTreePage() {
  const { playerMoney, resetSkills } = useSkillTreeStore();
  const [expandedTrees, setExpandedTrees] = useState<Record<string, boolean>>({
    inteligencia: true,
    agilidade: true,
    ataque: true,
    defesa: true,
    respeito: true,
    vigor: true,
  });

  const toggleTree = (tree: string) => {
    setExpandedTrees((prev) => ({
      ...prev,
      [tree]: !prev[tree],
    }));
  };

  const treeLabels = {
    inteligencia: 'Inteligência',
    agilidade: 'Agilidade',
    ataque: 'Ataque',
    defesa: 'Defesa',
    respeito: 'Respeito',
    vigor: 'Vigor',
  };

  const AnimatePresence = ({ children }: any) => <>{children}</>;
  const ChevronRight = ({ className }: any) => <ChevronDown className={className} />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-[100rem] mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Centro de Investimento
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Desenvolva suas habilidades e domine o jogo. Cada upgrade aumenta suas capacidades.
          </p>

          {/* Player Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              className="bg-gradient-to-br from-yellow-900 to-yellow-950 border border-yellow-600 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-yellow-300 text-sm font-semibold mb-1">Dinheiro Disponível</p>
              <p className="text-3xl font-bold text-yellow-400">
                ${playerMoney.toLocaleString()}
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-900 to-green-950 border border-green-600 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-green-300 text-sm font-semibold mb-1">Status</p>
              <p className="text-2xl font-bold text-green-400">Ativo</p>
            </motion.div>

            <motion.button
              onClick={resetSkills}
              className="bg-gradient-to-br from-red-900 to-red-950 border border-red-600 rounded-lg p-4 hover:from-red-800 hover:to-red-900 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-red-300 text-sm font-semibold mb-1">Ação</p>
              <p className="text-lg font-bold text-red-400">Resetar Árvore</p>
            </motion.button>
          </div>
        </div>

        {/* Skill Trees Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agilidade Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleTree('agilidade')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900 transition-colors"
                style={{
                  backgroundColor: `${TREE_COLORS['agilidade'].bg}20`,
                  borderBottom: expandedTrees['agilidade']
                    ? `2px solid ${TREE_COLORS['agilidade'].border}`
                    : 'none',
                }}
              >
                <span className="text-lg font-bold">Agilidade</span>
                {expandedTrees['agilidade'] ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              <AnimatePresence>
                {expandedTrees['agilidade'] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <AgilitySkillSection />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Ataque Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleTree('ataque')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900 transition-colors"
                style={{
                  backgroundColor: `${TREE_COLORS['ataque'].bg}20`,
                  borderBottom: expandedTrees['ataque']
                    ? `2px solid ${TREE_COLORS['ataque'].border}`
                    : 'none',
                }}
              >
                <span className="text-lg font-bold">Ataque</span>
                {expandedTrees['ataque'] ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              <AnimatePresence>
                {expandedTrees['ataque'] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <AttackSkillSection />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Defesa Section */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
               <button
                 onClick={() => toggleTree('defesa')}
                 className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900 transition-colors"
                 style={{
                   backgroundColor: `${TREE_COLORS['defesa'].bg}20`,
                   borderBottom: expandedTrees['defesa']
                     ? `2px solid ${TREE_COLORS['defesa'].border}`
                     : 'none',
                 }}
               >
                 <span className="text-lg font-bold">Defesa</span>
                 {expandedTrees['defesa'] ? (
                   <ChevronUp size={20} />
                 ) : (
                   <ChevronDown size={20} />
                 )}
               </button>

               <AnimatePresence>
                 {expandedTrees['defesa'] && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     transition={{ duration: 0.3 }}
                     className="p-6"
                   >
                     <DefenseSkillSection />
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           </motion.div>

          {/* Other Trees */}
          {(Object.keys(TREE_COLORS) as Array<keyof typeof TREE_COLORS>)
            .filter((key) => key !== 'agilidade' && key !== 'ataque' && key !== 'defesa')
            .map((treeKey) => (
              <motion.div
                key={treeKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleTree(treeKey)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900 transition-colors"
                    style={{
                      backgroundColor: `${TREE_COLORS[treeKey].bg}20`,
                      borderBottom: expandedTrees[treeKey]
                        ? `2px solid ${TREE_COLORS[treeKey].border}`
                        : 'none',
                    }}
                  >
                    <span className="text-lg font-bold">{treeLabels[treeKey]}</span>
                    {expandedTrees[treeKey] ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedTrees[treeKey] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SkillTree
                          treeKey={treeKey}
                          title={treeLabels[treeKey]}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Info Section */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">Como Funciona</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-blue-400 mb-3">Estados das Habilidades</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-600" />
                  <span>Bloqueado - Requer pré-requisitos</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500" />
                  <span>Disponível - Pronto para upgrade</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span>Completo - Máximo nível atingido</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-orange-400 mb-3">Sistema de Custo</h3>
              <p className="text-sm text-gray-300 mb-3">
                Cada upgrade custa: <span className="text-yellow-400 font-bold">baseCost × (nível + 1)</span>
              </p>
              <p className="text-sm text-gray-300">
                Clique em uma habilidade para fazer upgrade se tiver dinheiro suficiente.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function getAgilitySkillDescription(skillId: string, level: number): string {
  const descriptions: Record<string, string> = {
    agilidade_1: `Aprenda a fugir rapidamente pelas vielas. Reduz tempo de operações em ${level}%.`,
    agilidade_2: `Domine técnicas de direção perigosa. Aumenta sucesso em fugas em ${level * 0.5}%.`,
    agilidade_3: `Desenvolva reflexos de rua aguçados. Reduz cooldowns em ${level * 1.5}%.`,
    agilidade_4: `Mobilidade tática avançada. Aumenta velocidade geral em ${level}%.`,
    agilidade_5: `Velocidade estratégica máxima. Bônus global em tempo e execução: ${level}%.`,
  };
  return descriptions[skillId] || 'Skill desconhecida';
}

function getAgilityUnlockRequirement(skillId: string): string {
  const requirements: Record<string, string> = {
    agilidade_2: 'Fuga de Viela atinja nível 10',
    agilidade_3: 'Direção Perigosa atinja nível 15',
    agilidade_4: 'Reflexo de Rua atinja nível 20',
    agilidade_5: 'Mobilidade Tática atinja nível 25',
  };
  return requirements[skillId] || 'Requisitos desconhecidos';
}

function getDefenseSkillDescription(skillId: string, level: number): string {
  const descriptions: Record<string, string> = {
    defesa_1: `Aprenda técnicas de fuga rápida para minimizar perdas quando as operações falham. Cada nível reduz perdas em ${level}%.`,
    defesa_2: `Invista em cofres blindados para proteger seu dinheiro. Cada nível aumenta proteção em ${level * 1.5}%.`,
    defesa_3: `Fortifique seu território contra invasões. Cada nível reduz dano recebido em ${level * 1.5}%.`,
    defesa_4: `Implemente sistemas de segurança avançados. Cada nível aumenta resistência geral em ${level}%.`,
    defesa_5: `Alcance o pico da proteção com blindagem total. Cada nível fornece bônus massivo de ${level * 5}%.`,
  };
  return descriptions[skillId] || 'Skill desconhecida';
}

function getVigorSkillDescription(skillId: string, level: number): string {
  const descriptions: Record<string, string> = {
    vigor_1: `Desenvolva o fôlego de rua. Aumenta energia máxima em ${level}%.`,
    vigor_2: `Fortaleça sua resistência física. Reduz consumo de energia em ${level}%.`,
    vigor_3: `Domine o ritmo de operações. Aumenta ações consecutivas em ${level * 1.5}%.`,
    vigor_4: `Acelere sua recuperação de energia. Aumenta regeneração em ${level}%.`,
    vigor_5: `Alcance energia inquebrável. Bônus massivo em stamina e recuperação: ${level}%.`,
  };
  return descriptions[skillId] || 'Skill desconhecida';
}

function getVigorUnlockRequirement(skillId: string): string {
  const requirements: Record<string, string> = {
    vigor_2: 'Fôlego de Rua atinja nível 10',
    vigor_3: 'Resistência Física atinja nível 15',
    vigor_4: 'Ritmo de Operação atinja nível 20',
    vigor_5: 'Recuperação Acelerada atinja nível 25',
  };
  return requirements[skillId] || 'Requisitos desconhecidos';
}
