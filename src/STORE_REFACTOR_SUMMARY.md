# Store Refactor Summary - Phase 2

## Objetivo
Refatorar o `playerStore` para atuar **apenas como cache de sessão** do jogador atual, dividindo os estados misturados em três stores especializadas e garantindo que o banco de dados seja a fonte de verdade.

## Mudanças Realizadas

### 1. **playerStore.ts** - Enxugado para Sessão Apenas
**Antes:** Misturava tudo (perfil, dinheiro, spins, multiplayer, visual, etc)
**Depois:** Apenas dados de sessão do jogador atual

**Contém agora:**
- `playerId` - ID único do jogador
- `playerName` - Nome do jogador
- `level` - Nível atual
- `progress` - Progresso
- `isGuest` - Se é guest
- `profilePicture` - Foto de perfil
- `barracoLevel` - Nível do barraco
- `cleanMoney` - Dinheiro limpo
- `dirtyMoney` - Dinheiro sujo
- `spins` - Número de giros

**Removido:**
- ❌ `isSpinning` → movido para `uiStore`
- ❌ `lastResult` → movido para `uiStore`
- ❌ `multiplier` → movido para `uiStore`
- ❌ `hasInitialized` → movido para `uiStore`
- ❌ `lastGainTime` → movido para `uiStore`
- ❌ `ownedLuxuryItemIds` → movido para `uiStore`
- ❌ `players` (multiplayer) → movido para `multiplayerStore`
- ❌ `inventory`, `investments`, `cooldowns`, `passiveBonuses` → movido para `uiStore`

### 2. **uiStore.ts** - NOVO
Store para estados visuais e de jogo (ephemeral, reseta ao recarregar)

**Contém:**
- Spin mechanics: `isSpinning`, `lastResult`, `multiplier`
- Game init: `hasInitialized`
- Spin Vault: `lastGainTime`
- Luxury items: `ownedLuxuryItemIds`
- Player data: `inventory`, `investments`, `cooldowns`, `passiveBonuses`

**Características:**
- ✅ Ephemeral (não persiste)
- ✅ Reseta ao recarregar página
- ✅ Apenas para UI/game mechanics

### 3. **multiplayerStore.ts** - NOVO
Store para dados de outros jogadores (ephemeral)

**Contém:**
- `players` - Record de outros jogadores por ID
- `setPlayers()` - Atualizar lista
- `addPlayer()` - Adicionar jogador
- `updatePlayer()` - Atualizar jogador
- `removePlayer()` - Remover jogador
- `getPlayer()` - Buscar jogador específico
- `getAllPlayers()` - Listar todos

**Características:**
- ✅ Ephemeral (não persiste)
- ✅ Apenas para multiplayer
- ✅ Separado do playerStore

### 4. **playerDataService.ts** - Atualizado
Agora sincroniza corretamente com os três stores

**Mudanças:**
- ✅ Importa `useUIStore` para dados visuais
- ✅ Carrega `inventory`, `investments`, `cooldowns`, `passiveBonuses` em `uiStore`
- ✅ Carrega `ownedLuxuryItemIds` em `uiStore`
- ✅ Sincroniza dados de `uiStore` ao salvar no banco
- ✅ Reset de ambos stores ao deletar jogador

### 5. **SlotMachine.tsx** - Atualizado
Agora usa `uiStore` para estados visuais

**Mudanças:**
```typescript
// ANTES
const { isSpinning, setIsSpinning, multiplier, setMultiplier, ... } = usePlayerStore();

// DEPOIS
const { spins, playerId } = usePlayerStore();
const { isSpinning, setIsSpinning, multiplier, setMultiplier } = useUIStore();
```

### 6. **Valores Iniciais de Produção**
Corrigidos para valores neutros (não fake)

**playerStore initialState:**
```typescript
const initialState: PlayerData = {
  playerId: null,
  playerName: 'COMANDANTE',
  level: 1,              // ✅ Nível 1 (não 10)
  progress: 0,           // ✅ 0 (não fake)
  isGuest: false,
  profilePicture: null,
  barracoLevel: 1,       // ✅ 1 (não fake)
  cleanMoney: 0,         // ✅ 0 (não 1000000000)
  dirtyMoney: 0,         // ✅ 0 (não fake)
  spins: 0,              // ✅ 0 (não fake)
};
```

**createNewPlayer():**
```typescript
const newPlayer: Players = {
  // ... 
  level: playerData.level ?? 1,           // ✅ Usa ?? para valores reais
  progress: playerData.progress ?? 0,
  dirtyMoney: playerData.dirtyMoney ?? 0,
  cleanMoney: playerData.cleanMoney ?? 0,
  barracoLevel: playerData.barracoLevel ?? 1,
  spins: playerData.spins ?? 0,
  // ...
};
```

## Arquitetura de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (Source of Truth)                 │
│                    Players Collection                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   playerDataService                         │
│              (Centralized Data Management)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   playerStore    │  │    uiStore       │  │multiplayerStore  │
│  (Session Cache) │  │  (Ephemeral)     │  │  (Ephemeral)     │
│                  │  │                  │  │                  │
│ - playerId       │  │ - isSpinning     │  │ - players        │
│ - playerName     │  │ - lastResult     │  │   (other players)│
│ - level          │  │ - multiplier     │  │                  │
│ - progress       │  │ - hasInitialized │  │                  │
│ - cleanMoney     │  │ - lastGainTime   │  │                  │
│ - dirtyMoney     │  │ - ownedLuxury... │  │                  │
│ - spins          │  │ - inventory      │  │                  │
│ - barracoLevel   │  │ - investments    │  │                  │
│ - isGuest        │  │ - cooldowns      │  │                  │
│ - profilePicture │  │ - passiveBonuses │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        ↓                     ↓                     ↓
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENTS                             │
│              (Read from stores, write via service)          │
└─────────────────────────────────────────────────────────────┘
```

## Regras de Uso

### ✅ CORRETO

```typescript
// Ler dados de sessão
const { playerId, level, dirtyMoney } = usePlayerStore();

// Ler estados visuais
const { isSpinning, multiplier } = useUIStore();

// Ler outros jogadores
const { players } = useMultiplayerStore();

// Escrever dados (sempre via service)
import { updatePlayerProgress } from '@/services/playerDataService';
await updatePlayerProgress(playerId, newLevel, newProgress);
```

### ❌ ERRADO

```typescript
// Não misturar stores
const { isSpinning } = usePlayerStore(); // ❌ isSpinning está em uiStore

// Não atualizar store diretamente
usePlayerStore.setState({ dirtyMoney: 1000 }); // ❌ Use playerEconomyService

// Não usar valores fake
level: 10, cleanMoney: 1000000000 // ❌ Use valores reais
```

## Benefícios

1. **Separação de Responsabilidades**
   - playerStore = Dados de sessão apenas
   - uiStore = Estados visuais/ephemeral
   - multiplayerStore = Dados de outros jogadores

2. **Banco como Fonte de Verdade**
   - Todos os dados persistem no banco
   - Stores são apenas caches
   - Sincronização clara via playerDataService

3. **Sem Valores Fake**
   - Valores iniciais são neutros (level 1, money 0)
   - Facilita detecção de bugs
   - Produção segura

4. **Melhor Performance**
   - playerStore enxugado (menos re-renders)
   - uiStore ephemeral (sem persistência desnecessária)
   - multiplayerStore isolado

5. **Código Mais Limpo**
   - Responsabilidades claras
   - Fácil de debugar
   - Fácil de estender

## Próximos Passos

1. **Audit de Componentes**
   - Verificar todos os componentes que usam `usePlayerStore`
   - Migrar usos de `isSpinning`, `multiplier`, etc para `useUIStore`
   - Migrar usos de `players` para `useMultiplayerStore`

2. **Testes**
   - Testar criação de novo jogador
   - Testar carregamento de jogador
   - Testar sincronização de dados
   - Testar valores iniciais

3. **Documentação**
   - Atualizar guias de desenvolvimento
   - Documentar padrão de uso dos stores
   - Criar exemplos de código

## Arquivos Modificados

- ✅ `/src/store/playerStore.ts` - Enxugado
- ✅ `/src/store/uiStore.ts` - NOVO
- ✅ `/src/store/multiplayerStore.ts` - NOVO
- ✅ `/src/services/playerDataService.ts` - Atualizado
- ✅ `/src/components/SlotMachine.tsx` - Atualizado
