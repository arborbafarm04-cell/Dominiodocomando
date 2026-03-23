import { useState } from 'react';
import { useCommercialCenterStore } from '@/store/commercialCenterStore';
import { usePlayerStore } from '@/store/playerStore';
import { motion } from 'framer-motion';
import { Percent, TrendingUp, Users, DollarSign } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  cost: number;
  effect: string;
  action: () => void;
  currentLevel: number;
  maxLevel: number;
}

export default function CommercialCenterUpgrades() {
  const commercialStore = useCommercialCenterStore();
  const playerStore = usePlayerStore();
  const [dirtyMoney, setDirtyMoney] = useState(playerStore.dirtyMoney || 0);

  const upgrades: UpgradeOption[] = [
    {
      id: 'tax-reduction',
      name: 'Redução de Taxa',
      description: 'Reduza a taxa cobrada pelos negócios',
      icon: <Percent className="w-6 h-6" />,
      cost: 5000,
      effect: '-1% taxa por nível',
      action: async () => {
        if (dirtyMoney < 5000) {
          alert('Dinheiro sujo insuficiente');
          return;
        }
        const newDirtyMoney = dirtyMoney - 5000;
        setDirtyMoney(newDirtyMoney);
        commercialStore.upgradeTaxReduction(1);
        
        const playerId = playerStore.playerId;
        if (playerId) {
          await BaseCrudService.update<Players>('players', {
            _id: playerId,
            dirtyMoney: newDirtyMoney,
          });
        }
      },
      currentLevel: commercialStore.upgrades.taxReduction,
      maxLevel: 25,
    },
    {
      id: 'conversion-bonus',
      name: 'Bônus de Conversão',
      description: 'Aumente o retorno dos negócios',
      icon: <TrendingUp className="w-6 h-6" />,
      cost: 7500,
      effect: '+0.5% retorno por nível',
      action: async () => {
        if (dirtyMoney < 7500) {
          alert('Dinheiro sujo insuficiente');
          return;
        }
        const newDirtyMoney = dirtyMoney - 7500;
        setDirtyMoney(newDirtyMoney);
        commercialStore.upgradeConversionBonus(0.5);
        
        const playerId = playerStore.playerId;
        if (playerId) {
          await BaseCrudService.update<Players>('players', {
            _id: playerId,
            dirtyMoney: newDirtyMoney,
          });
        }
      },
      currentLevel: commercialStore.upgrades.conversionBonus,
      maxLevel: 50,
    },
    {
      id: 'operations-per-day',
      name: 'Operações por Dia',
      description: 'Aumente o número de operações diárias',
      icon: <Users className="w-6 h-6" />,
      cost: 10000,
      effect: '+1 operação por dia',
      action: async () => {
        if (dirtyMoney < 10000) {
          alert('Dinheiro sujo insuficiente');
          return;
        }
        const newDirtyMoney = dirtyMoney - 10000;
        setDirtyMoney(newDirtyMoney);
        commercialStore.upgradeOperationsPerDay(1);
        
        const playerId = playerStore.playerId;
        if (playerId) {
          await BaseCrudService.update<Players>('players', {
            _id: playerId,
            dirtyMoney: newDirtyMoney,
          });
        }
      },
      currentLevel: commercialStore.upgrades.operationsPerDay,
      maxLevel: 10,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-2xl mb-4">Upgrades do Centro Comercial</h3>
        <p className="text-slate-400 text-sm font-paragraph mb-6">
          Invista em melhorias para aumentar seus lucros e operações
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upgrades.map((upgrade) => (
          <motion.div
            key={upgrade.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-logo-gradient-start">{upgrade.icon}</div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Nível</p>
                <p className="font-heading text-lg text-logo-gold">
                  {upgrade.currentLevel}/{upgrade.maxLevel}
                </p>
              </div>
            </div>

            <h4 className="font-heading text-lg mb-2">{upgrade.name}</h4>
            <p className="text-slate-400 text-sm font-paragraph mb-3">
              {upgrade.description}
            </p>

            <div className="bg-slate-700/30 rounded p-3 mb-4">
              <p className="text-xs text-slate-300 font-paragraph">
                <span className="text-logo-gold">Efeito:</span> {upgrade.effect}
              </p>
            </div>

            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <button
              onClick={upgrade.action}
              disabled={upgrade.currentLevel >= upgrade.maxLevel || dirtyMoney < upgrade.cost}
              className="w-full bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading py-2 rounded transition-all text-sm flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              {upgrade.currentLevel >= upgrade.maxLevel ? 'Máximo' : `${upgrade.cost.toLocaleString()}`}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
