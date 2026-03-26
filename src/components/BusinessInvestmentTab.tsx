import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { useBusinessInvestmentStore } from '@/store/businessInvestmentStore';
import { usePlayerStore } from '@/store/playerStore';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BusinessUpgrade {
  _id: string;
  upgradeName?: string;
  cost?: number;
  launderingRateEffect?: number;
  baseTimeEffect?: number;
  maxValueEffect?: number;
  description?: string;
}

interface UpgradeModalData {
  upgrade: BusinessUpgrade;
  cost: number;
  duration: number;
  canUpgrade: boolean;
  remainingTime: number;
}

export default function BusinessInvestmentTab() {
  const [upgrades, setUpgrades] = useState<BusinessUpgrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeModalData | null>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});
  const [completedUpgrades, setCompletedUpgrades] = useState<Set<string>>(new Set());

  const { dirtyMoney } = usePlayerStore();
  const {
    upgrades: upgradeStates,
    upgradeBusinessSkill,
    finalizeUpgrade,
    canUpgrade,
    getRemainingTime,
    getUpgrade,
  } = useBusinessInvestmentStore();

  // Load upgrades from CMS
  useEffect(() => {
    const loadUpgrades = async () => {
      try {
        const result = await BaseCrudService.getAll<BusinessUpgrade>('businessupgrades');
        setUpgrades(result.items || []);
      } catch (error) {
        console.error('Failed to load upgrades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUpgrades();
  }, []);

  // Update timers for upgrading upgrades
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      Object.values(upgradeStates).forEach((upgrade) => {
        if (upgrade.upgrading && upgrade.endTime) {
          const remaining = Math.max(0, upgrade.endTime - Date.now());
          newTimers[upgrade.id] = remaining;

          if (remaining === 0) {
            setCompletedUpgrades((prev) => new Set(prev).add(upgrade.id));
            finalizeUpgrade(upgrade.id);
          }
        }
      });
      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [upgradeStates, finalizeUpgrade]);

  const handleUpgradeClick = (upgrade: BusinessUpgrade) => {
    const cost = upgrade.cost || 1000;
    const duration = 60; // Base duration in seconds
    const canUpgradeUpgrade = canUpgrade(upgrade._id, dirtyMoney);
    const upgradeState = getUpgrade(upgrade._id);
    const remainingTime = upgradeState ? getRemainingTime(upgradeState) : 0;

    setSelectedUpgrade({
      upgrade,
      cost,
      duration,
      canUpgrade: canUpgradeUpgrade,
      remainingTime,
    });
  };

  const handleUpgradeConfirm = () => {
    if (selectedUpgrade && canUpgrade(selectedUpgrade.upgrade._id, dirtyMoney)) {
      upgradeBusinessSkill(selectedUpgrade.upgrade._id, selectedUpgrade.cost, selectedUpgrade.duration);
      setCompletedUpgrades((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedUpgrade.upgrade._id);
        return newSet;
      });
      setSelectedUpgrade(null);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount}`;
  };

  const getUpgradeState = (upgrade: BusinessUpgrade) => {
    const state = getUpgrade(upgrade._id);
    if (!state) return 'available';
    if (state.upgrading) return 'upgrading';
    return 'completed';
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-heading font-bold text-cyan-400 mb-2">Investimentos em Negócios</h2>
        <p className="text-gray-400">Melhore as condições de lavagem de dinheiro em seus comércios</p>
      </div>

      {/* Dirty Money Display */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 mb-6 border border-orange-500/30">
        <p className="text-sm text-gray-400">Dinheiro Sujo Disponível</p>
        <p className="text-2xl font-bold text-orange-400">{formatMoney(dirtyMoney)}</p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Carregando investimentos...</p>
        </div>
      ) : upgrades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum investimento disponível</p>
        </div>
      ) : (
        /* Upgrades Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upgrades.map((upgrade) => {
            const state = getUpgradeState(upgrade);
            const upgradeState = getUpgrade(upgrade._id);
            const remainingTime = upgradeState ? getRemainingTime(upgradeState) : 0;
            const isCompleted = completedUpgrades.has(upgrade._id);

            return (
              <motion.div
                key={upgrade._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-4 border transition-all ${
                  state === 'upgrading'
                    ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500'
                    : isCompleted
                    ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500'
                    : 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 hover:border-cyan-500/60'
                }`}
              >
                {/* Header */}
                <div className="mb-3">
                  <h3 className="text-lg font-heading font-bold text-cyan-400 mb-1">
                    {upgrade.upgradeName || 'Upgrade'}
                  </h3>
                  <p className="text-xs text-gray-400">{upgrade.description || 'Melhoria para negócios'}</p>
                </div>

                {/* Effects */}
                <div className="space-y-2 mb-4 text-sm">
                  {upgrade.launderingRateEffect && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Taxa de Lavagem:</span>
                      <span className="text-green-400">
                        {upgrade.launderingRateEffect > 0 ? '-' : '+'}
                        {Math.abs(upgrade.launderingRateEffect).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {upgrade.baseTimeEffect && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tempo:</span>
                      <span className="text-green-400">
                        {upgrade.baseTimeEffect > 0 ? '-' : '+'}
                        {Math.abs(upgrade.baseTimeEffect).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {upgrade.maxValueEffect && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor Máximo:</span>
                      <span className="text-green-400">
                        +{upgrade.maxValueEffect.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Cost */}
                <div className="bg-slate-800/50 rounded p-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Custo:</span>
                    <span className="text-orange-400 font-semibold">{formatMoney(upgrade.cost || 0)}</span>
                  </div>
                </div>

                {/* Status */}
                {state === 'upgrading' && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Atualizando...</span>
                      <span className="text-cyan-400 font-semibold text-sm">{formatTime(remainingTime)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(remainingTime / (upgradeState?.endTime ? upgradeState.endTime - (upgradeState.endTime - remainingTime - 1000) : 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {isCompleted && (
                  <div className="mb-4 p-2 bg-green-900/30 rounded border border-green-500/50">
                    <p className="text-sm text-green-400 text-center">✓ Atualização Concluída</p>
                  </div>
                )}

                {/* Button */}
                <Button
                  onClick={() => handleUpgradeClick(upgrade)}
                  disabled={state === 'upgrading' || dirtyMoney < (upgrade.cost || 0)}
                  className={`w-full py-2 rounded font-semibold transition-all ${
                    state === 'upgrading'
                      ? 'bg-blue-600 text-white cursor-not-allowed opacity-50'
                      : isCompleted
                      ? 'bg-green-600 text-white cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                  }`}
                >
                  {state === 'upgrading' ? 'Atualizando...' : isCompleted ? 'Concluído' : 'Investir'}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUpgrade(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 max-w-md w-full border border-cyan-500/30"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedUpgrade(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* Title */}
              <h3 className="text-2xl font-heading font-bold text-cyan-400 mb-2">
                {selectedUpgrade.upgrade.upgradeName}
              </h3>
              <p className="text-gray-400 mb-4">{selectedUpgrade.upgrade.description}</p>

              {/* Details */}
              <div className="space-y-3 mb-6 bg-slate-800/50 rounded p-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Custo:</span>
                  <span className="text-orange-400 font-semibold">{formatMoney(selectedUpgrade.cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tempo de Atualização:</span>
                  <span className="text-cyan-400 font-semibold">{formatTime(selectedUpgrade.duration * 1000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dinheiro Disponível:</span>
                  <span className={dirtyMoney >= selectedUpgrade.cost ? 'text-green-400' : 'text-red-400'}>
                    {formatMoney(dirtyMoney)}
                  </span>
                </div>
              </div>

              {/* Effects */}
              <div className="mb-6 space-y-2 text-sm">
                <p className="text-gray-400 font-semibold mb-2">Efeitos:</p>
                {selectedUpgrade.upgrade.launderingRateEffect && (
                  <p className="text-green-400">
                    • Taxa de Lavagem: {selectedUpgrade.upgrade.launderingRateEffect > 0 ? '-' : '+'}
                    {Math.abs(selectedUpgrade.upgrade.launderingRateEffect).toFixed(1)}%
                  </p>
                )}
                {selectedUpgrade.upgrade.baseTimeEffect && (
                  <p className="text-green-400">
                    • Tempo: {selectedUpgrade.upgrade.baseTimeEffect > 0 ? '-' : '+'}
                    {Math.abs(selectedUpgrade.upgrade.baseTimeEffect).toFixed(1)}%
                  </p>
                )}
                {selectedUpgrade.upgrade.maxValueEffect && (
                  <p className="text-green-400">
                    • Valor Máximo: +{selectedUpgrade.upgrade.maxValueEffect.toFixed(1)}%
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedUpgrade(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-semibold transition-all"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpgradeConfirm}
                  disabled={!selectedUpgrade.canUpgrade || dirtyMoney < selectedUpgrade.cost}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded font-semibold transition-all"
                >
                  Confirmar Investimento
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
