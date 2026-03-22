import React, { useState, useRef, useEffect } from 'react';
import { useSkillTreeStore, SkillNode } from '@/store/skillTreeStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
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
  Fortress: Shield,
  Crown,
  Users,
  Heart,
  Armor,
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
          {(Object.keys(TREE_COLORS) as Array<keyof typeof TREE_COLORS>).map((treeKey) => (
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
