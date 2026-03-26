import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { Comercios, ComercioKey, getInitialComercioData, COMERCIOS_CONFIG, calcularValorLavagem, calcularTempoLavagem, calcularTaxaAplicada } from '@/types/comercios';
import { usePlayerStore } from '@/store/playerStore';

export const comerciosService = {
  async getPlayerComercios(playerId: string): Promise<Comercios> {
    try {
      const player = await BaseCrudService.getById<Players>('players', playerId);
      if (!player?.comercios) {
        return getInitialComercioData();
      }
      return JSON.parse(player.comercios);
    } catch (error) {
      console.error('Erro ao buscar comércios:', error);
      return getInitialComercioData();
    }
  },

  async updatePlayerComercios(playerId: string, comercios: Comercios): Promise<void> {
    try {
      await BaseCrudService.update<Players>('players', {
        _id: playerId,
        comercios: JSON.stringify(comercios),
      });
    } catch (error) {
      console.error('Erro ao atualizar comércios:', error);
      throw error;
    }
  },

  async iniciarLavagem(playerId: string, comercioKey: ComercioKey, dirtyMoney: number): Promise<{ sucesso: boolean; mensagem: string }> {
    try {
      console.log('🔍 [iniciarLavagem] Iniciando para:', { playerId, comercioKey, dirtyMoney });
      
      const player = await BaseCrudService.getById<Players>('players', playerId);
      if (!player) {
        console.error('❌ [iniciarLavagem] Jogador não encontrado');
        return { sucesso: false, mensagem: 'Jogador não encontrado' };
      }

      const comercios = player.comercios ? JSON.parse(player.comercios) : getInitialComercioData();
      const comercio = comercios[comercioKey];

      // Verificar se já está em andamento
      if (comercio.emAndamento) {
        console.warn('⚠️ [iniciarLavagem] Comércio já está em operação');
        return { sucesso: false, mensagem: 'Este comércio já está em operação' };
      }

      // Verificar bloqueio diário
      const hoje = new Date().toDateString();
      if (comercio.ultimaDataUso === hoje) {
        console.warn('⚠️ [iniciarLavagem] Limite diário já atingido');
        return { sucesso: false, mensagem: 'Você já usou este comércio hoje. Tente novamente amanhã.' };
      }

      // Verificar dirty money
      const valorLavagem = calcularValorLavagem(comercioKey, comercio.nivelNegocio);
      if (dirtyMoney < valorLavagem) {
        console.warn('⚠️ [iniciarLavagem] Dinheiro sujo insuficiente:', { dirtyMoney, valorLavagem });
        return { sucesso: false, mensagem: `Você precisa de ${valorLavagem} de dinheiro sujo. Você tem ${dirtyMoney}.` };
      }

      // Calcular tempo e taxa
      const tempoLavagem = calcularTempoLavagem(comercioKey, comercio.nivelNegocio);
      const taxaAplicada = calcularTaxaAplicada(comercioKey, comercio.nivelTaxa);
      const horarioFim = Date.now() + tempoLavagem;

      console.log('📊 [iniciarLavagem] Calculado:', { tempoLavagem, taxaAplicada, horarioFim });

      // Atualizar comércio
      comercios[comercioKey] = {
        ...comercio,
        emAndamento: true,
        horarioFim,
        valorAtual: valorLavagem,
        taxaAplicada,
        ultimaDataUso: hoje,
      };

      // Atualizar dirty money
      const novosDirtyMoney = dirtyMoney - valorLavagem;

      console.log('💾 [iniciarLavagem] Salvando no banco:', { novosDirtyMoney });

      await BaseCrudService.update<Players>('players', {
        _id: playerId,
        comercios: JSON.stringify(comercios),
        dirtyMoney: novosDirtyMoney,
      });

      // Atualizar store de dinheiro sujo
      const playerStore = usePlayerStore.getState();
      playerStore.setDirtyMoney(novosDirtyMoney);

      console.log('✅ [iniciarLavagem] Lavagem iniciada com sucesso');
      return { sucesso: true, mensagem: 'Lavagem iniciada com sucesso' };
    } catch (error) {
      console.error('💥 [iniciarLavagem] Erro:', error);
      return { sucesso: false, mensagem: 'Erro ao iniciar lavagem' };
    }
  },

  async finalizarLavagem(playerId: string, comercioKey: ComercioKey): Promise<{ sucesso: boolean; cleanMoneyGanho: number; mensagem: string }> {
    try {
      console.log('🔍 [finalizarLavagem] Finalizando para:', { playerId, comercioKey });
      
      const player = await BaseCrudService.getById<Players>('players', playerId);
      if (!player) {
        console.error('❌ [finalizarLavagem] Jogador não encontrado');
        return { sucesso: false, cleanMoneyGanho: 0, mensagem: 'Jogador não encontrado' };
      }

      const comercios = player.comercios ? JSON.parse(player.comercios) : getInitialComercioData();
      const comercio = comercios[comercioKey];

      if (!comercio.emAndamento) {
        console.warn('⚠️ [finalizarLavagem] Comércio não está em operação');
        return { sucesso: false, cleanMoneyGanho: 0, mensagem: 'Este comércio não está em operação' };
      }

      if (!comercio.horarioFim || Date.now() < comercio.horarioFim) {
        const tempoRestante = comercio.horarioFim ? Math.ceil((comercio.horarioFim - Date.now()) / 1000) : 0;
        console.warn('⚠️ [finalizarLavagem] Operação ainda não concluída:', { tempoRestante });
        return { sucesso: false, cleanMoneyGanho: 0, mensagem: `Faltam ${tempoRestante} segundos para finalizar` };
      }

      // Calcular clean money ganho
      const cleanMoneyGanho = Math.floor(comercio.valorAtual * (comercio.taxaAplicada / 100));

      console.log('💰 [finalizarLavagem] Clean money ganho:', cleanMoneyGanho);

      // Atualizar comércio
      comercios[comercioKey] = {
        ...comercio,
        emAndamento: false,
        horarioFim: null,
        valorAtual: 0,
        taxaAplicada: 0,
      };

      // Atualizar clean money
      const novoCleanMoney = (player.cleanMoney || 0) + cleanMoneyGanho;

      console.log('💾 [finalizarLavagem] Salvando no banco:', { novoCleanMoney });

      await BaseCrudService.update<Players>('players', {
        _id: playerId,
        comercios: JSON.stringify(comercios),
        cleanMoney: novoCleanMoney,
      });

      // Atualizar store de dinheiro limpo
      const playerStore = usePlayerStore.getState();
      playerStore.setCleanMoney(novoCleanMoney);

      console.log('✅ [finalizarLavagem] Lavagem finalizada com sucesso');
      return { sucesso: true, cleanMoneyGanho, mensagem: 'Lavagem finalizada com sucesso' };
    } catch (error) {
      console.error('💥 [finalizarLavagem] Erro:', error);
      return { sucesso: false, cleanMoneyGanho: 0, mensagem: 'Erro ao finalizar lavagem' };
    }
  },

  async upgradeCapacidade(playerId: string, comercioKey: ComercioKey, cleanMoney: number): Promise<{ sucesso: boolean; mensagem: string }> {
    try {
      const player = await BaseCrudService.getById<Players>('players', playerId);
      if (!player) {
        return { sucesso: false, mensagem: 'Jogador não encontrado' };
      }

      const comercios = player.comercios ? JSON.parse(player.comercios) : getInitialComercioData();
      const comercio = comercios[comercioKey];

      // Verificar limite máximo
      if (comercio.nivelNegocio >= 50) {
        return { sucesso: false, mensagem: 'Nível máximo de capacidade atingido' };
      }

      // Calcular custo
      const { calcularCustoUpgradeNegocio } = await import('@/types/comercios');
      const custo = calcularCustoUpgradeNegocio(comercio.nivelNegocio);

      if (cleanMoney < custo) {
        return { sucesso: false, mensagem: `Você precisa de ${custo} de dinheiro limpo. Você tem ${cleanMoney}.` };
      }

      // Atualizar comércio
      comercios[comercioKey] = {
        ...comercio,
        nivelNegocio: comercio.nivelNegocio + 1,
      };

      // Atualizar clean money
      const novoCleanMoney = cleanMoney - custo;

      await BaseCrudService.update<Players>('players', {
        _id: playerId,
        comercios: JSON.stringify(comercios),
        cleanMoney: novoCleanMoney,
      });

      // Atualizar store de dinheiro limpo
      const playerStore = usePlayerStore.getState();
      playerStore.setCleanMoney(novoCleanMoney);

      return { sucesso: true, mensagem: 'Capacidade atualizada com sucesso' };
    } catch (error) {
      console.error('Erro ao fazer upgrade de capacidade:', error);
      return { sucesso: false, mensagem: 'Erro ao fazer upgrade' };
    }
  },

  async upgradeEficiencia(playerId: string, comercioKey: ComercioKey, cleanMoney: number): Promise<{ sucesso: boolean; mensagem: string }> {
    try {
      const player = await BaseCrudService.getById<Players>('players', playerId);
      if (!player) {
        return { sucesso: false, mensagem: 'Jogador não encontrado' };
      }

      const comercios = player.comercios ? JSON.parse(player.comercios) : getInitialComercioData();
      const comercio = comercios[comercioKey];

      // Verificar limite máximo
      if (comercio.nivelTaxa >= 30) {
        return { sucesso: false, mensagem: 'Nível máximo de eficiência atingido' };
      }

      // Calcular custo
      const { calcularCustoUpgradeTaxa } = await import('@/types/comercios');
      const custo = calcularCustoUpgradeTaxa(comercio.nivelTaxa);

      if (cleanMoney < custo) {
        return { sucesso: false, mensagem: `Você precisa de ${custo} de dinheiro limpo. Você tem ${cleanMoney}.` };
      }

      // Atualizar comércio
      comercios[comercioKey] = {
        ...comercio,
        nivelTaxa: comercio.nivelTaxa + 1,
      };

      // Atualizar clean money
      const novoCleanMoney = cleanMoney - custo;

      await BaseCrudService.update<Players>('players', {
        _id: playerId,
        comercios: JSON.stringify(comercios),
        cleanMoney: novoCleanMoney,
      });

      // Atualizar store de dinheiro limpo
      const playerStore = usePlayerStore.getState();
      playerStore.setCleanMoney(novoCleanMoney);

      return { sucesso: true, mensagem: 'Eficiência atualizada com sucesso' };
    } catch (error) {
      console.error('Erro ao fazer upgrade de eficiência:', error);
      return { sucesso: false, mensagem: 'Erro ao fazer upgrade' };
    }
  },
};
