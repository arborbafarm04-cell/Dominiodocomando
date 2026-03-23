import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useIntelligenceSkillTreeStore } from '@/store/intelligenceSkillTreeStore';
import { useRespeitSkillTreeStore } from '@/store/respeitSkillTreeStore';
import { useVigorSkillTreeStore } from '@/store/vigorSkillTreeStore';
import {
  useCommercialCenterStore,
  BUSINESSES,
  RISK_FAILURE_CHANCE,
  LaunderingOperation,
  BusinessType,
} from '@/store/commercialCenterStore';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, TrendingUp, DollarSign, Zap, Percent } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

export default function CommercialCenterPage() {
  const playerStore = usePlayerStore();
  const intelligenceStore = useIntelligenceSkillTreeStore();
  const respeitStore = useRespeitSkillTreeStore();
  const vigorStore = useVigorSkillTreeStore();
  const commercialStore = useCommercialCenterStore();

  const [dirtyMoney, setDirtyMoney] = useState(playerStore.dirtyMoney || 0);
  const [cleanMoney, setCleanMoney] = useState(playerStore.cleanMoney || 0);
  const [inputAmount, setInputAmount] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType>('lava-rapido');
  const [isProcessing, setIsProcessing] = useState(false);
  const [operations, setOperations] = useState(commercialStore.getActiveOperations());
  const [completedOperations, setCompletedOperations] = useState(
    commercialStore.getCompletedOperations()
  );
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});

  // Get skill bonuses
  const intelligenceLevel = intelligenceStore.totalLevel || 0;
  const respeitLevel = respeitStore.totalLevel || 0;

  // Calculate risk reduction from intelligence (1% per level)
  const riskReduction = intelligenceLevel * 0.01;

  // Get upgrades from store
  const upgrades = commercialStore.upgrades;
  
  // Calculate max operations per day
  const maxOperations = upgrades.operationsPerDay;
  
  // Count operations completed today
  const operationsCompletedToday = commercialStore.getOperationsToday().length;

  // Load player data on mount
  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerId = playerStore.playerId;
        if (playerId) {
          const player = await BaseCrudService.getById<Players>('players', playerId);
          if (player) {
            setDirtyMoney(player.dirtyMoney || 0);
            setCleanMoney(player.cleanMoney || 0);
          }
        }
      } catch (error) {
        console.error('Error loading player data:', error);
      }
    };

    loadPlayerData();
  }, [playerStore.playerId]);

  // Update operations from store
  useEffect(() => {
    setOperations(commercialStore.getActiveOperations());
    setCompletedOperations(commercialStore.getCompletedOperations());
  }, [commercialStore.operations]);

  // Timer for operations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimeRemaining: Record<string, number> = {};
      let operationsUpdated = false;

      operations.forEach((op) => {
        const remaining = Math.max(0, op.endTime - now);
        newTimeRemaining[op.id] = remaining;

        if (remaining === 0 && op.status === 'running') {
          commercialStore.updateOperation(op.id, { status: 'completed' });
          operationsUpdated = true;
        }
      });

      setTimeRemaining(newTimeRemaining);

      if (operationsUpdated) {
        setOperations(commercialStore.getActiveOperations());
        setCompletedOperations(commercialStore.getCompletedOperations());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [operations, commercialStore]);

  const getAdjustedRiskChance = (baseRisk: number): number => {
    return Math.max(0, baseRisk - riskReduction);
  };

  const handleLaunderMoney = async () => {
    const amount = parseFloat(inputAmount);

    if (!amount || amount <= 0) {
      alert('Digite um valor válido');
      return;
    }

    if (amount > dirtyMoney) {
      alert('Você não tem dinheiro sujo suficiente');
      return;
    }

    if (operationsCompletedToday >= maxOperations) {
      alert(`Você já fez ${maxOperations} operação(ões) hoje. Volte amanhã!`);
      return;
    }

    setIsProcessing(true);

    try {
      const business = BUSINESSES[selectedBusiness];
      
      // Calculate effective conversion with upgrades
      const effectiveConversion = business.baseConversion + (upgrades.conversionBonus / 100);
      const returnAmount = amount * effectiveConversion;
      
      // Calculate effective tax
      const effectiveTax = Math.max(0, business.baseTax - (upgrades.taxReduction / 100));
      const taxAmount = returnAmount * effectiveTax;
      const finalReturn = returnAmount - taxAmount;

      const operation: LaunderingOperation = {
        id: crypto.randomUUID(),
        businessType: selectedBusiness,
        amount,
        returnAmount: finalReturn,
        startTime: Date.now(),
        endTime: Date.now() + business.time,
        risk: business.risk,
        status: 'running',
        date: commercialStore.getTodayDate(),
      };

      // Optimistic update
      const newDirtyMoney = dirtyMoney - amount;
      setDirtyMoney(newDirtyMoney);
      setInputAmount('');
      commercialStore.addOperation(operation);

      // Update player in database
      const playerId = playerStore.playerId;
      if (playerId) {
        await BaseCrudService.update<Players>('players', {
          _id: playerId,
          dirtyMoney: newDirtyMoney,
        });
      }
    } catch (error) {
      console.error('Error creating operation:', error);
      // Revert on error
      setDirtyMoney(dirtyMoney);
      alert('Erro ao criar operação');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCollectReward = async (operation: LaunderingOperation) => {
    try {
      const riskChance = getAdjustedRiskChance(RISK_FAILURE_CHANCE[operation.risk]);
      const isFailed = Math.random() < riskChance;

      let reward = 0;
      if (isFailed) {
        reward = operation.amount * 0.5; // 50% of invested amount
      } else {
        reward = operation.returnAmount;
      }

      // Optimistic update
      const newCleanMoney = cleanMoney + reward;
      setCleanMoney(newCleanMoney);
      commercialStore.removeOperation(operation.id);

      // Update player in database
      const playerId = playerStore.playerId;
      if (playerId) {
        await BaseCrudService.update<Players>('players', {
          _id: playerId,
          cleanMoney: newCleanMoney,
        });
      }

      // Show result
      if (isFailed) {
        alert(`⚠️ Operação falhou! Você recebeu apenas $${reward.toFixed(2)}`);
      } else {
        alert(`✅ Operação bem-sucedida! Você recebeu $${reward.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error collecting reward:', error);
      alert('Erro ao coletar recompensa');
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const isBusinessUnlocked = (business: BusinessType): boolean => {
    return respeitLevel >= BUSINESSES[business].minRespect;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header with balances */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-12"
      >
        <h1 className="font-heading text-5xl mb-8 text-center bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end bg-clip-text text-transparent">
          🏪 Centro Comercial
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Dirty Money */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-red-900/30 to-red-950/30 border-2 border-red-500/50 rounded-lg p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-paragraph mb-2">Dinheiro Sujo</p>
                <p className="font-heading text-3xl text-red-400">
                  ${dirtyMoney.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-red-500/50" />
            </div>
          </motion.div>

          {/* Clean Money */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-900/30 to-green-950/30 border-2 border-green-500/50 rounded-lg p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-paragraph mb-2">Dinheiro Limpo</p>
                <p className="font-heading text-3xl text-green-400">
                  ${cleanMoney.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500/50" />
            </div>
          </motion.div>
        </div>

        {/* Skill Bonuses Info */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-paragraph">
            <div>
              <span className="text-blue-400 block text-xs mb-1">Inteligência</span>
              <span className="text-slate-300">-{(riskReduction * 100).toFixed(0)}% risco</span>
            </div>
            <div>
              <span className="text-purple-400 block text-xs mb-1">Respeito</span>
              <span className="text-slate-300">Nível {respeitLevel}</span>
            </div>
            <div>
              <span className="text-yellow-400 block text-xs mb-1">Operações Hoje</span>
              <span className="text-slate-300">{operationsCompletedToday}/{maxOperations}</span>
            </div>
            <div>
              <span className="text-green-400 block text-xs mb-1">Upgrades</span>
              <span className="text-slate-300">Taxa: -{(upgrades.taxReduction).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto">
        {/* Businesses Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-heading text-3xl mb-6">Negócios Disponíveis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {(Object.entries(BUSINESSES) as [BusinessType, typeof BUSINESSES[BusinessType]][]).map(
              ([key, business]) => {
                const isUnlocked = isBusinessUnlocked(key);
                const isSelected = selectedBusiness === key;

                return (
                  <motion.div
                    key={key}
                    whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                    onClick={() => isUnlocked && setSelectedBusiness(key)}
                    className={`rounded-lg p-6 cursor-pointer transition-all border-2 relative overflow-hidden ${
                      isSelected
                        ? 'border-logo-gold bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-lg shadow-logo-gold/30'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                    } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Background animation */}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-logo-gradient-start/10 to-transparent"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    )}

                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <p className="text-sm text-slate-300">
                          Respeito {business.minRespect} necessário
                        </p>
                      </div>
                    )}

                    <div className="relative z-10">
                      <div className="text-4xl mb-2">{business.emoji}</div>
                      <h3 className="font-heading text-lg mb-2">{business.name}</h3>
                      <p className="text-slate-300 text-xs mb-4 font-paragraph">
                        {business.description}
                      </p>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Percent className="w-3 h-3" /> Taxa
                          </span>
                          <span className="text-red-400 font-heading">
                            {(business.baseTax * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Retorno
                          </span>
                          <span className="text-blue-400 font-heading">
                            {(business.baseConversion * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`flex items-center gap-1 ${
                            business.risk === 'low'
                              ? 'text-green-400'
                              : business.risk === 'medium'
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}>
                            <Zap className="w-3 h-3" /> Risco
                          </span>
                          <span className={
                            business.risk === 'low'
                              ? 'text-green-400'
                              : business.risk === 'medium'
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }>
                            {business.risk === 'low'
                              ? 'Baixo'
                              : business.risk === 'medium'
                                ? 'Médio'
                                : 'Alto'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Tempo
                          </span>
                          <span className="text-purple-400 font-heading">{formatTime(business.time)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>

          {/* Input and Launch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
          >
            <h3 className="font-heading text-xl mb-4">Lavar Dinheiro</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-paragraph">
                  Valor a Lavar
                </label>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Digite o valor"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-logo-gold"
                  disabled={isProcessing}
                />
              </div>

              <button
                onClick={handleLaunderMoney}
                disabled={isProcessing || !inputAmount || operationsCompletedToday >= maxOperations}
                className="w-full bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading py-3 rounded-lg transition-all"
              >
                {isProcessing ? 'Processando...' : 'Lavar Dinheiro'}
              </button>

              {operationsCompletedToday >= maxOperations && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Limite de operações diárias atingido. Volte amanhã!</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Active Operations */}
        {operations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="font-heading text-3xl mb-6">Operações em Andamento</h2>

            <div className="space-y-4">
              {operations.map((op) => {
                const business = BUSINESSES[op.businessType as BusinessType];
                const remaining = timeRemaining[op.id] || 0;
                const progress = ((op.endTime - Date.now()) / (op.endTime - op.startTime)) * 100;

                return (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-heading text-lg">{business.name}</h4>
                        <p className="text-slate-400 text-sm font-paragraph">
                          Investido: ${op.amount.toFixed(2)} → Retorno: ${op.returnAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-purple-400 font-heading">
                          <Clock className="w-5 h-5" />
                          {formatTime(remaining)}
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end h-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${Math.max(0, progress)}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </div>

                    {remaining === 0 && (
                      <button
                        onClick={() => handleCollectReward(op)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-heading py-2 rounded transition-all"
                      >
                        Coletar Recompensa
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Completed Operations */}
        {completedOperations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-heading text-3xl mb-6">Operações Concluídas</h2>

            <div className="space-y-2">
              {completedOperations.slice(0, 5).map((op) => {
                const business = BUSINESSES[op.businessType as BusinessType];

                return (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-paragraph">{business.name}</span>
                      <span className="text-green-400 font-heading">
                        ${op.returnAmount.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
