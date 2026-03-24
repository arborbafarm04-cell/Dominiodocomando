import { useState, useEffect, useRef } from 'react';
import { useInvestmentSkillTreeStore, type Skill } from '@/store/investmentSkillTreeStore';
import { useDirtyMoneyStore } from '@/store/dirtyMoneyStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import Footer from '@/components/Footer';
import { SkillUpgradeAnimations, AnimatedConnection, CompletionBackgroundGlow } from '@/components/SkillUpgradeAnimations';

const CATEGORIES = [
  { id: 'Inteligência', label: 'INTELIGÊNCIA', color: '#00eaff', icon: '🧠' },
  { id: 'Agilidade', label: 'AGILIDADE', color: '#FFD700', icon: '⚡' },
  { id: 'Ataque', label: 'ATAQUE', color: '#FF4500', icon: '💥' },
  { id: 'Defesa', label: 'DEFESA', color: '#00FF00', icon: '🛡️' },
  { id: 'Respeito', label: 'RESPEITO', color: '#FF69B4', icon: '👑' },
  { id: 'Vigor', label: 'VIGOR', color: '#FF0000', icon: '❤️' },
];

type SkillModalData = {
  skill: Skill;
  category: string;
  cost: number;
  duration: number;
  canUpgrade: boolean;
  remainingTime: number;
};

export default function InvestmentSkillTreePage() {
  const {
    skills,
    upgradeSkill,
    finalizeUpgrade,
    canUpgrade,
    getRemainingTime,
    getSkill,
  } = useInvestmentSkillTreeStore();
  
  const { dirtyMoney } = useDirtyMoneyStore();

  const [selectedSkill, setSelectedSkill] = useState<SkillModalData | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});
  const [completedSkills, setCompletedSkills] = useState<Set<string>>(new Set());
  const [showCompletionGlow, setShowCompletionGlow] = useState(false);

  // Update timers for upgrading skills
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      Object.values(skills).forEach((skill) => {
        if (skill.upgrading && skill.endTime) {
          const remaining = Math.max(0, skill.endTime - Date.now());
          newTimers[skill.id] = remaining;

          if (remaining === 0) {
            // Mark skill as completed for animation
            setCompletedSkills((prev) => new Set(prev).add(skill.id));
            setShowCompletionGlow(true);
            setTimeout(() => setShowCompletionGlow(false), 600);
            
            finalizeUpgrade(skill.id);
          }
        }
      });
      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [skills, finalizeUpgrade]);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 2) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPan = { ...pan };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPan({
        x: startPan.x + (moveEvent.clientX - startX),
        y: startPan.y + (moveEvent.clientY - startY),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSkillClick = (skill: Skill) => {
    const cost = skill.baseCost * Math.pow(skill.level + 1, 1.8);
    const duration = skill.baseTime * Math.pow(skill.level + 1, 1.5);
    const canUpgradeSkill = canUpgrade(skill.id);
    const remainingTime = getRemainingTime(skill);

    setSelectedSkill({
      skill,
      category: skill.category,
      cost: Math.floor(cost),
      duration: Math.floor(duration),
      canUpgrade: canUpgradeSkill,
      remainingTime,
    });
  };

  const handleUpgradeClick = () => {
    if (selectedSkill && canUpgrade(selectedSkill.skill.id)) {
      upgradeSkill(selectedSkill.skill.id);
      // Trigger upgrade start animation
      setCompletedSkills((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedSkill.skill.id);
        return newSet;
      });
      setSelectedSkill(null);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  const getSkillState = (skill: Skill) => {
    if (skill.upgrading) return 'upgrading';
    if (skill.level >= skill.maxLevel) return 'complete';
    if (canUpgrade(skill.id)) return 'available';
    return 'locked';
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'complete':
        return '#00FF00';
      case 'available':
        return '#FFD700';
      case 'upgrading':
        return '#00eaff';
      default:
        return '#666666';
    }
  };

  const getCategorySkills = (categoryName: string) => {
    return Object.values(skills)
      .filter((s) => s.category === categoryName)
      .sort((a, b) => {
        const aNum = parseInt(a.id.split('-')[1]);
        const bNum = parseInt(b.id.split('-')[1]);
        return aNum - bNum;
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">


      <div className="relative w-full overflow-hidden bg-black/40">
        {/* Background glow effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        {/* Completion glow background */}
        <CompletionBackgroundGlow isActive={showCompletionGlow} />

        {/* Main content */}
        <div
          ref={containerRef}
          className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          <motion.div
            style={{
              scale,
              x: pan.x,
              y: pan.y,
            }}
            className="w-full max-w-7xl"
          >
            {/* SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="grad-locked" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#666666" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#666666" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="grad-available" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="grad-complete" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00FF00" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00FF00" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative z-10 px-8 py-16">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-20"
              >
                <h1 className="font-heading text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 mb-4">
                  IMPÉRIO DO CRIME
                </h1>
                <p className="text-cyan-400 text-lg font-paragraph">
                  Árvore de Investimento - Meta de 2 Anos de Progressão
                </p>
              </motion.div>

              {/* Money Display and Reset Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-6 mb-12"
              >
                <div className="bg-black/60 border border-cyan-400/50 rounded-lg px-8 py-4 backdrop-blur-sm">
                  <p className="text-cyan-400 font-paragraph text-sm">Dinheiro Sujo Disponível</p>
                  <p className="text-2xl font-bold text-yellow-400 font-heading">
                    {formatMoney(dirtyMoney)}
                  </p>
                </div>
                <a
                  href="/reset-investment"
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-heading font-bold rounded-lg border border-blue-400/50 transition-all shadow-lg shadow-blue-500/50"
                >
                  🔄 Resetar
                </a>
              </motion.div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
                {CATEGORIES.map((category, idx) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    {/* Category Header */}
                    <div className="text-center mb-8">
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <h2
                        className="font-heading text-2xl font-bold"
                        style={{ color: category.color }}
                      >
                        {category.label}
                      </h2>
                    </div>

                    {/* Skills Column */}
                    <div className="space-y-4">
                      {getCategorySkills(category.id).map((skill, skillIdx) => {
                        const state = getSkillState(skill);
                        const stateColor = getStateColor(state);
                        const isUpgrading = skill.upgrading;
                        const remainingTime = upgradeTimers[skill.id] || 0;

                        return (
                          <motion.button
                            key={skill.id}
                            onClick={() => handleSkillClick(skill)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: skillIdx * 0.05 }}
                            className="w-full relative group"
                          >
                            {/* Upgrade animations */}
                            <SkillUpgradeAnimations
                              skillId={skill.id}
                              isUpgrading={isUpgrading}
                              isComplete={completedSkills.has(skill.id)}
                              remainingTime={remainingTime}
                              stateColor={stateColor}
                            />

                            {/* Glow effect */}
                            <div
                              className="absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                backgroundColor: stateColor,
                                animation: isUpgrading ? 'pulse 2s infinite' : 'none',
                              }}
                            ></div>

                            {/* Card */}
                            <div
                              className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-2 rounded-lg p-4 transition-all group-hover:scale-105 cursor-pointer"
                              style={{
                                borderColor: stateColor,
                                boxShadow: `0 0 20px ${stateColor}40`,
                              }}
                            >
                              {/* Level Badge */}
                              <div className="absolute top-2 right-2 bg-black/80 rounded-full w-8 h-8 flex items-center justify-center border border-cyan-400/50">
                                <span className="text-xs font-bold text-cyan-400">
                                  {skill.level}/{skill.maxLevel}
                                </span>
                              </div>

                              {/* Content */}
                              <div className="text-left">
                                <h3 className="font-heading font-bold text-sm text-white mb-1">
                                  {skill.name}
                                </h3>
                                <p className="text-xs text-gray-300 mb-2">{skill.description}</p>

                                {/* Status */}
                                {isUpgrading ? (
                                  <div className="text-xs text-cyan-400 font-bold">
                                    ⏱️ {formatTime(remainingTime)}
                                  </div>
                                ) : state === 'complete' ? (
                                  <div className="text-xs text-green-400 font-bold">✓ COMPLETO</div>
                                ) : state === 'locked' ? (
                                  <div className="text-xs text-gray-500 font-bold">🔒 BLOQUEADO</div>
                                ) : (
                                  <div className="text-xs text-yellow-400 font-bold">✓ DISPONÍVEL</div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="inline-block bg-black/60 border border-yellow-600/50 rounded-lg px-8 py-4 backdrop-blur-sm">
                  <p className="text-yellow-600 font-paragraph text-sm">PEQUENOS ESQUEMAS</p>
                  <p className="text-gray-400 text-xs mt-1">Comece do zero e construa seu império</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Skill Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-400/50 rounded-xl p-8 max-w-md w-full backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedSkill(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="text-3xl mb-2">{CATEGORIES.find((c) => c.id === selectedSkill.category)?.icon}</div>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">
                  {selectedSkill.skill.name}
                </h2>
                <p className="text-gray-400 text-sm">{selectedSkill.skill.description}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6 bg-black/40 rounded-lg p-4 border border-cyan-400/20">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Nível Atual:</span>
                  <span className="font-bold text-cyan-400">
                    {selectedSkill.skill.level} / {selectedSkill.skill.maxLevel}
                  </span>
                </div>

                {selectedSkill.skill.upgrading ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tempo Restante:</span>
                      <span className="font-bold text-yellow-400">
                        {formatTime(selectedSkill.remainingTime)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{
                          duration: selectedSkill.remainingTime / 1000,
                          ease: 'linear',
                        }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      ></motion.div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Custo:</span>
                      <span className="font-bold text-yellow-400">{formatMoney(selectedSkill.cost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tempo:</span>
                      <span className="font-bold text-orange-400">
                        {formatTime(selectedSkill.duration * 1000)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Efeito:</span>
                  <span className="font-bold text-green-400">{selectedSkill.skill.effect}</span>
                </div>
              </div>

              {/* Requirements */}
              {selectedSkill.skill.requires && selectedSkill.skill.requires.length > 0 && (
                <div className="mb-6 bg-black/40 rounded-lg p-4 border border-orange-400/20">
                  <p className="text-gray-400 text-sm mb-2">Requisitos:</p>
                  <div className="space-y-1">
                    {selectedSkill.skill.requires.map((reqId) => {
                      const reqSkill = getSkill(reqId);
                      const isMet = reqSkill && reqSkill.level > 0;
                      return (
                        <div key={reqId} className="text-xs">
                          <span className={isMet ? 'text-green-400' : 'text-red-400'}>
                            {isMet ? '✓' : '✗'} {reqSkill?.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedSkill(null)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-400 hover:text-white"
                >
                  Fechar
                </Button>

                {selectedSkill.skill.upgrading ? (
                  <Button
                    disabled
                    className="flex-1 bg-cyan-500/50 text-white cursor-not-allowed"
                  >
                    ⏱️ Evoluindo...
                  </Button>
                ) : selectedSkill.skill.level >= selectedSkill.skill.maxLevel ? (
                  <Button disabled className="flex-1 bg-green-500/50 text-white cursor-not-allowed">
                    ✓ Completo
                  </Button>
                ) : (
                  <Button
                    onClick={handleUpgradeClick}
                    disabled={!selectedSkill.canUpgrade}
                    className={`flex-1 ${
                      selectedSkill.canUpgrade
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                        : 'bg-gray-600 cursor-not-allowed'
                    } text-white font-bold`}
                  >
                    {selectedSkill.canUpgrade ? '⚡ Evoluir' : '🔒 Indisponível'}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
          }
        }

        @keyframes breathing {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes energy-flow {
          0% {
            stroke-dasharray: 0 100%;
          }
          100% {
            stroke-dasharray: 100% 0;
          }
        }

        @keyframes particle-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0);
          }
        }
      `}</style>
    </div>
  );
}
