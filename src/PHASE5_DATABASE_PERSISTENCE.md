# FASE 5 — CENTRALIZAR ITENS, INVESTIMENTOS E EVOLUÇÕES NO BANCO DE DADOS

## Objetivo
Remover dependência de localStorage para dados críticos do jogador. Todos os itens comprados, investimentos e progresso do barraco devem ser persistidos no banco de dados.

## Mudanças Implementadas

### 1. Itens de Luxo (ownedLuxuryItems)
**Antes:** Salvos em localStorage com chave de nome
**Depois:** Salvos no banco como array de objetos com metadados

**Estrutura:**
```typescript
ownedLuxuryItems: string; // JSON.stringify([
  {
    id: string;           // Item ID
    purchaseDate: string; // ISO timestamp
    bonus: number;        // +1% per item
    cost: number;         // Purchase price
  }
])
```

**Implementação:**
- LuxuryShowroomPage.tsx: `handleBuy()` agora salva array completo com metadados
- Carregamento: playerDataService.ts carrega e sincroniza com playerStore

### 2. Investimentos (investments)
**Antes:** Apenas em persist local (Zustand)
**Depois:** Salvos no banco como JSON

**Estrutura:**
```typescript
investments: string; // JSON.stringify({
  hospital: 3,
  quadra: 7,
  piscina: 2,
  // ... outros investimentos
})
```

**Implementação:**
- InvestmentSkillTreePage.tsx: Salvar estado após cada upgrade
- playerDataService.ts: Carregar e sincronizar com investmentSkillTreeStore

### 3. Árvores de Habilidades (skillTrees)
**Antes:** Apenas em persist local
**Depois:** Salvos no banco como JSON

**Estrutura:**
```typescript
skillTrees: string; // JSON.stringify({
  skills: { /* skill objects */ },
  playerMoney: number,
  cooldowns: Record<string, number>,
  passiveBonuses: Record<string, number>
})
```

**Implementação:**
- Todos os skill tree stores: Salvar após cada upgrade
- playerDataService.ts: Carregar e sincronizar

### 4. Barraco e Propriedade (barracoLevel + novos campos)
**Antes:** Apenas barracoLevel em playerStore
**Depois:** Campos completos para persistência visual

**Novos Campos:**
```typescript
barracoLevel: number;        // Nível atual (1-100)
barracoStyle?: string;       // Estilo visual (bronze, silver, gold, etc)
barracoUpgrades?: string;    // JSON de upgrades aplicados
propertyEvolutionStage?: number; // Estágio visual (1-10)
```

**Implementação:**
- BarracoPage.tsx: Salvar barracoLevel + novos campos após evolução
- playerDataService.ts: Carregar e sincronizar

## Fluxo de Dados

### Carregamento (App Startup)
1. Player faz login
2. `loadPlayerFromDatabase()` é chamado
3. Todos os dados são carregados do banco:
   - ownedLuxuryItems → playerStore.ownedLuxuryItemIds
   - investments → playerStore.investments
   - skillTrees → todos os skill tree stores
   - barracoLevel → playerStore.barracoLevel
4. Componentes leem do playerStore (cache em memória)

### Salvamento (Após Ação)
1. Usuário compra item / faz upgrade / evolui barraco
2. Componente atualiza playerStore (otimista)
3. Componente chama `BaseCrudService.update()` para salvar no banco
4. Se falhar, recarregar dados do banco

## Arquivos Modificados

### LuxuryShowroomPage.tsx
- `handleBuy()`: Agora salva array completo com metadados em `ownedLuxuryItems`

### BarracoPage.tsx
- Evolução: Salva `barracoLevel` + novos campos no banco

### InvestmentSkillTreePage.tsx
- Upgrades: Salva estado de investimentos no banco

### playerDataService.ts
- `loadPlayerFromDatabase()`: Carrega todos os dados do banco
- Sincroniza com todos os stores

## Verificação

- [ ] Comprar item de luxo → Salvo no banco com metadados
- [ ] Fazer upgrade de investimento → Salvo no banco
- [ ] Evoluir barraco → Salvo no banco
- [ ] Recarregar página → Todos os dados carregam do banco
- [ ] Múltiplas abas → Dados sincronizados

## Próximas Etapas

1. Implementar sincronização em tempo real entre abas
2. Adicionar validação de integridade de dados
3. Implementar backup/restore de dados
4. Adicionar histórico de transações
