/**
 * Sistema de Respeito - Integração com Gameplay
 * Gerencia desbloqueios de conteúdo baseado no nível de respeito
 */

import { useRespeitSkillTreeStore } from '@/store/respeitSkillTreeStore';

export interface RespeitUnlocks {
  areas: string[];
  npcs: string[];
  missions: string[];
  bonuses: {
    influenceMultiplier: number;
    authorityBonus: number;
    reputationGain: number;
  };
}

export class RespeitSystem {
  /**
   * Verifica se uma área está desbloqueada
   */
  static isAreaUnlocked(areaId: string): boolean {
    const store = useRespeitSkillTreeStore.getState();
    const unlockedContent = store.getUnlockedContent();
    return unlockedContent.unlockedAreas.includes(areaId);
  }

  /**
   * Verifica se um NPC está disponível
   */
  static isNPCAvailable(npcId: string): boolean {
    const store = useRespeitSkillTreeStore.getState();
    const unlockedContent = store.getUnlockedContent();
    return unlockedContent.unlockedNPCs.includes(npcId);
  }

  /**
   * Verifica se uma missão está disponível
   */
  static isMissionAvailable(missionId: string): boolean {
    const store = useRespeitSkillTreeStore.getState();
    const unlockedContent = store.getUnlockedContent();
    return unlockedContent.unlockedMissions.includes(missionId);
  }

  /**
   * Obtém o multiplicador de influência baseado no nível de respeito
   */
  static getInfluenceMultiplier(): number {
    const store = useRespeitSkillTreeStore.getState();
    const totalRespect = store.getTotalRespectLevel();

    // Progressão: 0-50 = 1x, 50-100 = 1.5x, 100-150 = 2x, 150+ = 2.5x
    if (totalRespect >= 150) return 2.5;
    if (totalRespect >= 100) return 2;
    if (totalRespect >= 50) return 1.5;
    return 1;
  }

  /**
   * Obtém bônus de autoridade
   */
  static getAuthorityBonus(): number {
    const store = useRespeitSkillTreeStore.getState();
    const totalRespect = store.getTotalRespectLevel();

    // +1 de autoridade a cada 10 níveis de respeito
    return Math.floor(totalRespect / 10);
  }

  /**
   * Obtém ganho de reputação adicional
   */
  static getReputationGainBonus(): number {
    const store = useRespeitSkillTreeStore.getState();
    const totalRespect = store.getTotalRespectLevel();

    // +5% de ganho a cada 5 níveis de respeito
    return Math.floor((totalRespect / 5) * 5);
  }

  /**
   * Obtém todos os desbloqueios atuais
   */
  static getUnlocks(): RespeitUnlocks {
    const store = useRespeitSkillTreeStore.getState();
    const unlockedContent = store.getUnlockedContent();

    return {
      areas: unlockedContent.unlockedAreas,
      npcs: unlockedContent.unlockedNPCs,
      missions: unlockedContent.unlockedMissions,
      bonuses: {
        influenceMultiplier: this.getInfluenceMultiplier(),
        authorityBonus: this.getAuthorityBonus(),
        reputationGain: this.getReputationGainBonus(),
      },
    };
  }

  /**
   * Verifica se o jogador pode acessar conteúdo premium
   */
  static canAccessPremiumContent(): boolean {
    const store = useRespeitSkillTreeStore.getState();
    const totalRespect = store.getTotalRespectLevel();

    // Requer nível total de 100 para acessar conteúdo premium
    return totalRespect >= 100;
  }

  /**
   * Obtém progresso em direção ao próximo marco
   */
  static getProgressToNextMilestone(): {
    current: number;
    next: number;
    percentage: number;
    milestone: string;
  } {
    const store = useRespeitSkillTreeStore.getState();
    const totalRespect = store.getTotalRespectLevel();

    const milestones = [
      { level: 0, name: 'Iniciante' },
      { level: 25, name: 'Conhecido' },
      { level: 50, name: 'Influente' },
      { level: 100, name: 'Poderoso' },
      { level: 150, name: 'Lendário' },
      { level: 175, name: 'Supremo' },
    ];

    let currentMilestone = milestones[0];
    let nextMilestone = milestones[1];

    for (let i = 0; i < milestones.length - 1; i++) {
      if (totalRespect >= milestones[i].level && totalRespect < milestones[i + 1].level) {
        currentMilestone = milestones[i];
        nextMilestone = milestones[i + 1];
        break;
      }
    }

    if (totalRespect >= milestones[milestones.length - 1].level) {
      currentMilestone = milestones[milestones.length - 1];
      nextMilestone = milestones[milestones.length - 1];
    }

    const range = nextMilestone.level - currentMilestone.level;
    const progress = totalRespect - currentMilestone.level;
    const percentage = range > 0 ? (progress / range) * 100 : 100;

    return {
      current: currentMilestone.level,
      next: nextMilestone.level,
      percentage: Math.min(percentage, 100),
      milestone: nextMilestone.name,
    };
  }

  /**
   * Obtém descrição do status de respeito
   */
  static getStatusDescription(): string {
    const store = useRespeitSkillTreeStore.getState();
    const totalRespect = store.getTotalRespectLevel();

    if (totalRespect < 25) return 'Você é um desconhecido nas ruas';
    if (totalRespect < 50) return 'Seu nome começa a ser conhecido';
    if (totalRespect < 100) return 'Você é uma figura influente';
    if (totalRespect < 150) return 'Você é temido e respeitado';
    return 'Você é uma lenda viva';
  }

  /**
   * Calcula quanto tempo falta para atingir um nível específico
   */
  static estimateTimeToLevel(targetLevel: number): number {
    const store = useRespeitSkillTreeStore.getState();
    const skills = store.skills;
    let totalTime = 0;

    Object.values(skills).forEach((skill) => {
      if (skill.level < targetLevel && skill.level < skill.maxLevel) {
        for (let i = skill.level; i < Math.min(targetLevel, skill.maxLevel); i++) {
          totalTime += Math.ceil(skill.baseTime * Math.pow(i + 1, 1.5));
        }
      }
    });

    return totalTime;
  }
}

/**
 * Hook para usar o sistema de respeito
 */
export function useRespeitSystem() {
  return {
    isAreaUnlocked: RespeitSystem.isAreaUnlocked,
    isNPCAvailable: RespeitSystem.isNPCAvailable,
    isMissionAvailable: RespeitSystem.isMissionAvailable,
    getInfluenceMultiplier: RespeitSystem.getInfluenceMultiplier,
    getAuthorityBonus: RespeitSystem.getAuthorityBonus,
    getReputationGainBonus: RespeitSystem.getReputationGainBonus,
    getUnlocks: RespeitSystem.getUnlocks,
    canAccessPremiumContent: RespeitSystem.canAccessPremiumContent,
    getProgressToNextMilestone: RespeitSystem.getProgressToNextMilestone,
    getStatusDescription: RespeitSystem.getStatusDescription,
    estimateTimeToLevel: RespeitSystem.estimateTimeToLevel,
  };
}
