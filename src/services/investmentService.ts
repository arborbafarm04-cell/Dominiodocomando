/**
 * INVESTMENT SERVICE
 * 
 * Handles all investment-related operations:
 * - Loading investments
 * - Creating investments
 * - Updating investment status
 * - Calculating investment returns
 * 
 * This service is the single source of truth for investment operations.
 */

import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';

const COLLECTION_ID = 'players';

export interface Investment {
  id: string;
  name: string;
  amount: number;
  returnRate: number;
  createdAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'failed';
}

/**
 * Get player investments
 */
export async function getPlayerInvestments(playerId: string): Promise<Investment[]> {
  try {
    const player = await BaseCrudService.getById<Players>(COLLECTION_ID, playerId);
    if (!player || !player.investments) {
      return [];
    }

    try {
      return JSON.parse(player.investments);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Failed to get player investments:', error);
    throw error;
  }
}

/**
 * Create new investment
 */
export async function createInvestment(
  playerId: string,
  investment: Omit<Investment, 'id' | 'createdAt'>
): Promise<{ success: boolean; investment?: Investment; error?: string }> {
  try {
    const investments = await getPlayerInvestments(playerId);

    const newInvestment: Investment = {
      ...investment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    investments.push(newInvestment);

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      investments: JSON.stringify(investments),
    });

    console.log(`[INVESTMENT] Created investment: ${investment.name} - ${investment.amount}`);

    return { success: true, investment: newInvestment };
  } catch (error) {
    console.error('Failed to create investment:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Complete investment
 */
export async function completeInvestment(
  playerId: string,
  investmentId: string
): Promise<{ success: boolean; investment?: Investment; error?: string }> {
  try {
    const investments = await getPlayerInvestments(playerId);

    const investment = investments.find((inv) => inv.id === investmentId);
    if (!investment) {
      return { success: false, error: 'Investment not found' };
    }

    investment.status = 'completed';
    investment.completedAt = new Date();

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      investments: JSON.stringify(investments),
    });

    console.log(`[INVESTMENT] Completed investment: ${investment.name}`);

    return { success: true, investment };
  } catch (error) {
    console.error('Failed to complete investment:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Calculate investment return
 */
export function calculateInvestmentReturn(investment: Investment): number {
  if (investment.status !== 'active') {
    return 0;
  }

  const now = new Date().getTime();
  const created = new Date(investment.createdAt).getTime();
  const daysElapsed = (now - created) / (1000 * 60 * 60 * 24);

  // Simple calculation: amount * returnRate * daysElapsed
  return investment.amount * (investment.returnRate / 100) * daysElapsed;
}

/**
 * Get total investment returns
 */
export async function getTotalInvestmentReturns(playerId: string): Promise<number> {
  try {
    const investments = await getPlayerInvestments(playerId);
    return investments.reduce((total, inv) => total + calculateInvestmentReturn(inv), 0);
  } catch (error) {
    console.error('Failed to get total investment returns:', error);
    return 0;
  }
}

/**
 * Cancel investment
 */
export async function cancelInvestment(
  playerId: string,
  investmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const investments = await getPlayerInvestments(playerId);

    const investment = investments.find((inv) => inv.id === investmentId);
    if (!investment) {
      return { success: false, error: 'Investment not found' };
    }

    investment.status = 'failed';

    await BaseCrudService.update(COLLECTION_ID, {
      _id: playerId,
      investments: JSON.stringify(investments),
    });

    console.log(`[INVESTMENT] Cancelled investment: ${investment.name}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to cancel investment:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get active investments
 */
export async function getActiveInvestments(playerId: string): Promise<Investment[]> {
  try {
    const investments = await getPlayerInvestments(playerId);
    return investments.filter((inv) => inv.status === 'active');
  } catch (error) {
    console.error('Failed to get active investments:', error);
    return [];
  }
}
