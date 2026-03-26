/**
 * SPIN SERVICE - SINGLE SOURCE OF TRUTH
 *
 * Regras:
 * - NÃO usar BaseCrudService direto
 * - NÃO duplicar lógica de banco fora dos services corretos
 * - Economia passa SEMPRE por playerEconomyService
 * - Store sincroniza no final
 */

import { Players } from '@/entities';
import { getPlayer, savePlayer } from '@/services/playerCoreService';
import { addDirtyMoney, removeDirtyMoney } from '@/services/playerEconomyService';
import { usePlayerStore } from '@/store/playerStore';

type SymbolType = '💎' | '💵' | '🔫' | '🚔';

interface SpinResponse {
  type: 'jackpot' | 'money' | 'attack' | 'prison' | 'none';
  amount: number;
  updatedPlayer: Players;
}

export async function executeSpinOperation(
  playerId: string,
  outcome: SymbolType[],
  multiplier: number
): Promise<SpinResponse> {
  try {
    const player = await getPlayer(playerId);

    if (!player) {
      throw new Error('Player não encontrado');
    }

    const currentSpins = player.spins ?? 0;
    if (currentSpins <= 0) {
      throw new Error('Sem spins disponíveis');
    }

    const safeMultiplier = Math.max(1, multiplier || 1);

    // 1. desconta 1 spin
    let updatedPlayer = await savePlayer({
      ...player,
      spins: currentSpins - 1,
    });

    let result: SpinResponse = {
      type: 'none',
      amount: 0,
      updatedPlayer,
    };

    const [a, b, c] = outcome;

    // 💎 JACKPOT
    if (a === '💎' && b === '💎' && c === '💎') {
      const amount = 10000 * safeMultiplier;

      const playerAfterReward = await addDirtyMoney(playerId, amount, 'SPIN_JACKPOT');
      if (!playerAfterReward) {
        throw new Error('Falha ao aplicar jackpot');
      }

      updatedPlayer = playerAfterReward;
      result = {
        type: 'jackpot',
        amount,
        updatedPlayer,
      };
    }

    // 💵 DINHEIRO
    else if (a === '💵' && b === '💵' && c === '💵') {
      const amount = 1000 * safeMultiplier;

      const playerAfterReward = await addDirtyMoney(playerId, amount, 'SPIN_MONEY');
      if (!playerAfterReward) {
        throw new Error('Falha ao aplicar prêmio em dinheiro');
      }

      updatedPlayer = playerAfterReward;
      result = {
        type: 'money',
        amount,
        updatedPlayer,
      };
    }

    // 🔫 ATAQUE
    else if (a === '🔫' && b === '🔫' && c === '🔫') {
      const amount = 2000 * safeMultiplier;

      const playerAfterReward = await addDirtyMoney(playerId, amount, 'SPIN_ATTACK');
      if (!playerAfterReward) {
        throw new Error('Falha ao aplicar prêmio de ataque');
      }

      updatedPlayer = playerAfterReward;
      result = {
        type: 'attack',
        amount,
        updatedPlayer,
      };
    }

    // 🚔 PRISÃO
    else if (a === '🚔' && b === '🚔' && c === '🚔') {
      const currentMoney = updatedPlayer.dirtyMoney ?? 0;
      const loss = Math.floor(currentMoney * 0.3);

      if (loss > 0) {
        const playerAfterLoss = await removeDirtyMoney(playerId, loss, 'SPIN_PRISON');
        if (!playerAfterLoss) {
          throw new Error('Falha ao aplicar penalidade de prisão');
        }
        updatedPlayer = playerAfterLoss;
      }

      result = {
        type: 'prison',
        amount: loss,
        updatedPlayer,
      };
    }

    // sync final explícito
    usePlayerStore.getState().setPlayer(updatedPlayer);

    return result;
  } catch (error: any) {
    console.error('Erro no spinService:', error);
    throw new Error(error?.message || 'Erro no spin');
  }
}