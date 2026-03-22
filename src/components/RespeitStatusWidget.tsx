/**
 * Widget de Status de Respeito
 * Exibe informações rápidas sobre o nível de respeito do jogador
 */

import { useRespeitSkillTreeStore } from '@/store/respeitSkillTreeStore';
import { useRespeitSystem } from '@/systems/respeitSystem';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Crown, TrendingUp } from 'lucide-react';

export default function RespeitStatusWidget() {
  const { getTotalRespectLevel } = useRespeitSkillTreeStore();
  const {
    getInfluenceMultiplier,
    getAuthorityBonus,
    getProgressToNextMilestone,
    getStatusDescription,
  } = useRespeitSystem();

  const totalRespect = getTotalRespectLevel();
  const influenceMultiplier = getInfluenceMultiplier();
  const authorityBonus = getAuthorityBonus();
  const milestone = getProgressToNextMilestone();
  const statusDescription = getStatusDescription();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-orange-500/30 p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-orange-400" />
              <h3 className="font-heading font-bold text-orange-400">Status de Respeito</h3>
            </div>
            <span className="text-2xl font-bold text-orange-500">{totalRespect}</span>
          </div>

          {/* Status Description */}
          <p className="text-sm text-gray-300 italic">{statusDescription}</p>

          {/* Progress to Next Milestone */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Próximo Marco: {milestone.milestone}</span>
              <span className="text-xs text-gray-400">
                {milestone.current} / {milestone.next}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${milestone.percentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Bonuses */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-700/50 p-2 rounded">
              <p className="text-xs text-gray-400">Multiplicador</p>
              <p className="text-sm font-bold text-cyan-400">{influenceMultiplier.toFixed(1)}x</p>
            </div>
            <div className="bg-slate-700/50 p-2 rounded">
              <p className="text-xs text-gray-400">Autoridade</p>
              <p className="text-sm font-bold text-cyan-400">+{authorityBonus}</p>
            </div>
          </div>

          {/* Quick Link */}
          <a
            href="/respeit-center"
            className="block text-center text-xs text-orange-400 hover:text-orange-300 transition-colors pt-2 border-t border-slate-700"
          >
            Ver Árvore Completa →
          </a>
        </div>
      </Card>
    </motion.div>
  );
}
