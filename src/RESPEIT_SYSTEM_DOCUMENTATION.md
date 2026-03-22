# Sistema de Respeito - Documentação Completa

## Visão Geral

O Sistema de Respeito é uma árvore de progressão social que representa a reputação e influência do jogador dentro do crime organizado. Este sistema é parte de uma árvore maior com 6 categorias balanceadas para aproximadamente 2 anos de progressão total.

## Estrutura da Árvore

### 5 Skills Principais em Sequência

1. **Nome na Quebrada I**
   - ID: `respeito_1`
   - Nível Máximo: 20
   - Custo Base: 700
   - Tempo Base: 5 minutos (300000 ms)
   - Requisitos: Nenhum
   - Efeito: Desbloqueia áreas iniciais e pequenos bônus de influência

2. **Influência Local II**
   - ID: `respeito_2`
   - Nível Máximo: 25
   - Custo Base: 1000
   - Tempo Base: 10 minutos (600000 ms)
   - Requisitos: `respeito_1` >= 10
   - Efeito: Libera NPCs locais e missões básicas

3. **Rede de Contatos III**
   - ID: `respeito_3`
   - Nível Máximo: 30
   - Custo Base: 1500
   - Tempo Base: 20 minutos (1200000 ms)
   - Requisitos: `respeito_2` >= 15
   - Efeito: Acesso a contatos estratégicos e operações melhores

4. **Domínio Regional IV**
   - ID: `respeito_4`
   - Nível Máximo: 40
   - Custo Base: 2500
   - Tempo Base: 40 minutos (2400000 ms)
   - Requisitos: `respeito_3` >= 20
   - Efeito: Libera novas regiões do mapa e bônus de autoridade

5. **Império do Comando V**
   - ID: `respeito_5`
   - Nível Máximo: 50
   - Custo Base: 6000
   - Tempo Base: 1 hora (3600000 ms)
   - Requisitos: `respeito_4` >= 25
   - Efeito: Desbloqueio global de conteúdo avançado e bônus massivo de influência

## Arquivos Criados

### 1. Store - `/src/store/respeitSkillTreeStore.ts`

Gerenciamento de estado com Zustand + persist (localStorage)

**Tipo Principal:**
```typescript
type Skill = {
  id: string;
  name: string;
  category: 'respeito';
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
};
```

**Funções Principais:**

- `initializeSkills()` - Reinicializa todas as skills
- `startUpgrade(skillId, playerMoney)` - Inicia upgrade de uma skill
- `finalizeUpgrade(skillId)` - Finaliza upgrade quando o tempo expira
- `canUpgrade(skillId, playerMoney)` - Verifica se pode fazer upgrade
- `getRemainingTime(skillId)` - Retorna tempo restante em ms
- `getRespectBonus()` - Soma todos os níveis
- `getTotalRespectLevel()` - Nível total de respeito
- `getSkillProgress(skillId)` - Progresso em porcentagem
- `getUnlockedContent()` - Retorna áreas, NPCs e missões desbloqueadas

### 2. Página - `/src/components/pages/RespeitSkillTreePage.tsx`

Interface visual completa da árvore de respeito

**Recursos:**
- Visualização de todas as 5 skills
- Indicadores de progresso
- Informações de custo e duração
- Sistema de requisitos
- Timer em tempo real para upgrades
- Exibição de conteúdo desbloqueado
- Botões de ação (Iniciar/Finalizar Upgrade)

### 3. Sistema - `/src/systems/respeitSystem.ts`

Integração com gameplay e desbloqueios

**Funções Principais:**

- `isAreaUnlocked(areaId)` - Verifica se área está desbloqueada
- `isNPCAvailable(npcId)` - Verifica se NPC está disponível
- `isMissionAvailable(missionId)` - Verifica se missão está disponível
- `getInfluenceMultiplier()` - Multiplicador de influência (1x a 2.5x)
- `getAuthorityBonus()` - Bônus de autoridade (+1 a cada 10 níveis)
- `getReputationGainBonus()` - Bônus de reputação (+5% a cada 5 níveis)
- `canAccessPremiumContent()` - Requer 100 níveis totais
- `getProgressToNextMilestone()` - Progresso até próximo marco
- `getStatusDescription()` - Descrição textual do status
- `estimateTimeToLevel(targetLevel)` - Estima tempo até atingir nível

### 4. Widget - `/src/components/RespeitStatusWidget.tsx`

Widget compacto para exibir status de respeito em qualquer página

**Exibe:**
- Nível total de respeito
- Descrição do status
- Progresso até próximo marco
- Multiplicador de influência
- Bônus de autoridade
- Link para árvore completa

## Cálculos de Progressão

### Custo de Upgrade
```
cost = baseCost * Math.pow(level + 1, 1.8)
```

Exemplo para `respeito_1` (baseCost = 700):
- Nível 0→1: 700 * 1^1.8 = 700
- Nível 1→2: 700 * 2^1.8 ≈ 2,639
- Nível 5→6: 700 * 6^1.8 ≈ 29,000
- Nível 10→11: 700 * 11^1.8 ≈ 118,000

### Duração de Upgrade
```
duration = baseTime * Math.pow(level + 1, 1.5)
```

Exemplo para `respeito_1` (baseTime = 300000 ms = 5 min):
- Nível 0→1: 300000 * 1^1.5 = 5 min
- Nível 1→2: 300000 * 2^1.5 ≈ 12.7 min
- Nível 5→6: 300000 * 6^1.5 ≈ 4.4 horas
- Nível 10→11: 300000 * 11^1.5 ≈ 33 horas

## Desbloqueios de Conteúdo

### Áreas Desbloqueadas

**Nome na Quebrada (respeito_1):**
- Nível 5: Favela Central
- Nível 10: Zona de Influência
- Nível 15: Mercado Negro

**Influência Local (respeito_2):**
- Nível 10: Bairro Controlado

**Rede de Contatos (respeito_3):**
- Nível 10: Zona de Operações

**Domínio Regional (respeito_4):**
- Nível 5: Região Expandida
- Nível 10: Zona de Domínio
- Nível 15: Região Controlada
- Nível 20: Império Regional

**Império do Comando (respeito_5):**
- Nível 10: Sede do Comando
- Nível 20: Zona Proibida

### NPCs Disponíveis

**Nome na Quebrada:**
- Nível 5: Chefe Local
- Nível 10: Informante
- Nível 15: Fornecedor

**Influência Local:**
- Nível 10: Mediador
- Nível 15: Estrategista

**Rede de Contatos:**
- Nível 5: Contato Estratégico
- Nível 10: Aliado Regional
- Nível 15: Chefe Regional
- Nível 20: Conselheiro

**Domínio Regional:**
- Nível 10: Lorde do Território
- Nível 20: Imperador Regional

**Império do Comando:**
- Nível 5: Conselho Supremo
- Nível 15: Líder Supremo

### Missões Disponíveis

**Nome na Quebrada:**
- Nível 5: Primeiras Operações
- Nível 15: Operações Intermediárias

**Influência Local:**
- Nível 5: Missões de Influência
- Nível 15: Operações Estratégicas

**Rede de Contatos:**
- Nível 5: Operações Coordenadas
- Nível 15: Operações Regionais
- Nível 20: Missões de Alto Risco

**Domínio Regional:**
- Nível 5: Operações de Expansão
- Nível 15: Operações de Consolidação
- Nível 25: Operações Imperiais

**Império do Comando:**
- Nível 5: Operações Globais
- Nível 10: Operações Estratégicas Globais
- Nível 15: Missões Lendárias
- Nível 20: Operações Secretas
- Nível 30: Operações Finais

## Marcos de Progressão

| Nível Total | Marco | Descrição |
|-------------|-------|-----------|
| 0-24 | Iniciante | Você é um desconhecido nas ruas |
| 25-49 | Conhecido | Seu nome começa a ser conhecido |
| 50-99 | Influente | Você é uma figura influente |
| 100-149 | Poderoso | Você é temido e respeitado |
| 150-174 | Lendário | Você é uma lenda viva |
| 175+ | Supremo | Você é o supremo comando |

## Bônus de Gameplay

### Multiplicador de Influência
- 0-49 níveis: 1.0x
- 50-99 níveis: 1.5x
- 100-149 níveis: 2.0x
- 150+ níveis: 2.5x

### Bônus de Autoridade
- +1 de autoridade a cada 10 níveis de respeito
- Máximo: +17 (em 175 níveis)

### Bônus de Reputação
- +5% de ganho a cada 5 níveis de respeito
- Máximo: +175% (em 175 níveis)

## Balanceamento de Tempo

### Progressão Total
- **Early Game (0-50 níveis):** ~1-2 semanas
- **Mid Game (50-100 níveis):** ~1-2 meses
- **Late Game (100-175 níveis):** ~2-3 meses
- **Total:** ~4 meses (dentro da progressão de 2 anos)

### Tempo por Skill

**Nome na Quebrada (20 níveis):**
- Tempo total: ~50 horas
- Média: 2.5 horas por nível

**Influência Local (25 níveis):**
- Tempo total: ~150 horas
- Média: 6 horas por nível

**Rede de Contatos (30 níveis):**
- Tempo total: ~400 horas
- Média: 13 horas por nível

**Domínio Regional (40 níveis):**
- Tempo total: ~1000 horas
- Média: 25 horas por nível

**Império do Comando (50 níveis):**
- Tempo total: ~2500 horas
- Média: 50 horas por nível

## Regras Obrigatórias Implementadas

✅ Não permitir upgrade simultâneo na mesma skill
✅ Não permitir pular níveis
✅ Não permitir ignorar requisitos
✅ Não permitir upgrade instantâneo
✅ Garantir progressão exponencial de tempo e custo
✅ Nunca permitir dinheiro negativo
✅ Persistir estado com Zustand persist (localStorage)

## Integração com Gameplay

### Como Usar no Código

```typescript
import { useRespeitSystem } from '@/systems/respeitSystem';

function MyComponent() {
  const { isAreaUnlocked, getInfluenceMultiplier } = useRespeitSystem();

  // Verificar se área está desbloqueada
  if (isAreaUnlocked('Favela Central')) {
    // Mostrar conteúdo
  }

  // Aplicar multiplicador de influência
  const baseInfluence = 100;
  const finalInfluence = baseInfluence * getInfluenceMultiplier();
}
```

### Integração com Mapa

```typescript
// Verificar se jogador pode acessar uma área
if (RespeitSystem.isAreaUnlocked('Zona de Domínio')) {
  // Desbloquear área no mapa
}
```

### Integração com NPCs

```typescript
// Verificar se NPC está disponível
if (RespeitSystem.isNPCAvailable('Lorde do Território')) {
  // Mostrar NPC no mapa
}
```

### Integração com Missões

```typescript
// Verificar se missão está disponível
if (RespeitSystem.isMissionAvailable('Operações Imperiais')) {
  // Liberar missão para o jogador
}
```

## Rota

A página está disponível em: `/respeit-center`

## Próximas Integrações

1. **Integração com Mapa:** Desbloquear áreas baseado em nível de respeito
2. **Integração com NPCs:** Liberar NPCs com base nos marcos
3. **Integração com Missões:** Disponibilizar missões conforme progride
4. **Integração com Bribery:** Usar respeito como requisito para subornos
5. **Integração com Luxury Shop:** Desbloquear itens premium com respeito
6. **Sistema de Eventos:** Disparar eventos quando atinge marcos

## Persistência

O estado é automaticamente salvo em localStorage com a chave `respeit-skill-tree-storage`. Todos os upgrades, níveis e progresso são preservados entre sessões.

## Performance

- Store otimizado com Zustand
- Timers eficientes com cleanup
- Cálculos exponenciais pré-computados
- Sem re-renders desnecessários com Framer Motion
