# Sistema de Autenticação e Salvamento de Progresso do Jogador

## Visão Geral

O sistema de autenticação de jogadores foi implementado para garantir que:
1. Jogadores criem perfis com email e senha
2. Perfis sejam usados para login e autenticação
3. Dados de progresso sejam salvos automaticamente no banco de dados
4. Sessões sejam mantidas entre navegações

## Componentes Principais

### 1. **Serviço de Autenticação** (`/src/services/playerService.ts`)

#### Funções Principais:

- **`registerLocalPlayer(email, password, playerName)`**
  - Cria novo perfil de jogador
  - Armazena credenciais com hash seguro
  - Cria sessão automaticamente
  - Retorna dados do jogador criado

- **`loginLocalPlayer(email, password)`**
  - Autentica jogador com email/senha
  - Valida credenciais
  - Cria sessão de autenticação
  - Retorna dados do jogador

- **`logoutLocalPlayer()`**
  - Encerra sessão do jogador
  - Limpa tokens de autenticação

- **`getCurrentLocalPlayer()`**
  - Recupera dados do jogador autenticado
  - Verifica se sessão está ativa

- **`isPlayerAuthenticated()`**
  - Verifica se jogador está autenticado
  - Valida token de autenticação

### 2. **Hook de Autenticação** (`/src/hooks/usePlayerAuth.ts`)

Gerencia o estado de autenticação e carrega dados do jogador:

```typescript
const { isAuthenticated, isLoading, playerData } = usePlayerAuth();
```

**Funcionalidades:**
- Verifica autenticação ao carregar página
- Carrega dados do jogador no Zustand store
- Sincroniza estado de autenticação

### 3. **Hook de Sincronização de Dados** (`/src/hooks/usePlayerDataSync.ts`)

Salva automaticamente dados do jogador:

```typescript
usePlayerDataSync(); // Adicionar em páginas do jogo
```

**Funcionalidades:**
- Sincroniza dados a cada 30 segundos
- Salva dados ao descarregar página
- Rastreia: nível, progresso, dinheiro, barraco

### 4. **Hook de Rastreamento de Progresso** (`/src/hooks/usePlayerProgressTracking.ts`)

Salva mudanças importantes imediatamente:

```typescript
usePlayerProgressTracking(); // Adicionar em páginas com mudanças críticas
```

**Funcionalidades:**
- Salva mudanças de nível imediatamente
- Salva mudanças de progresso imediatamente
- Salva mudanças de barraco imediatamente

## Fluxo de Autenticação

### Criação de Perfil

```
HomePage (Criar Perfil)
    ↓
PlayerRegistration Modal
    ↓
registerLocalPlayer()
    ├─ Cria hash da senha
    ├─ Armazena credenciais
    ├─ Cria jogador no banco de dados
    ├─ Cria sessão
    └─ Retorna dados do jogador
    ↓
Redireciona para /star-map
```

### Login

```
LoginPage (Email & Senha)
    ↓
LocalLoginForm
    ↓
loginLocalPlayer()
    ├─ Valida credenciais
    ├─ Recupera dados do jogador
    ├─ Cria sessão
    └─ Retorna dados do jogador
    ↓
Redireciona para /star-map
```

### Carregamento de Sessão

```
App Inicia
    ↓
HomePage usa usePlayerAuth()
    ├─ Verifica isPlayerAuthenticated()
    ├─ Carrega dados do jogador
    ├─ Popula Zustand store
    └─ Se autenticado, redireciona para /star-map
```

## Armazenamento de Dados

### LocalStorage (Sessão)

```javascript
// Token de autenticação
playerAuthToken: {
  playerId: string,
  email: string,
  timestamp: ISO string
}

// ID da sessão atual
currentPlayerId: string
currentPlayerEmail: string

// Dados do último jogador (cache)
lastPlayerData: {
  playerId: string,
  playerName: string,
  level: number,
  progress: number
}

// Credenciais (hash)
playerCredentials: {
  [email]: {
    password: string (hash),
    playerId: string,
    createdAt: ISO string
  }
}
```

### Banco de Dados (Persistência)

Coleção `players`:
- `_id`: ID único do jogador
- `playerName`: Nome do jogador
- `playerId`: Email (identificador único)
- `level`: Nível atual
- `progress`: Progresso (0-100)
- `cleanMoney`: Dinheiro limpo
- `dirtyMoney`: Dinheiro sujo
- `barracoLevel`: Nível do barraco
- `lastUpdated`: Última atualização
- `isGuest`: Se é jogador convidado

## Integração em Páginas

### StarMapPage (Exemplo)

```typescript
import { usePlayerDataSync } from '@/hooks/usePlayerDataSync';

export default function StarMapPage() {
  // Ativa sincronização automática de dados
  usePlayerDataSync();

  // ... resto do componente
}
```

### Páginas com Mudanças Críticas

```typescript
import { usePlayerProgressTracking } from '@/hooks/usePlayerProgressTracking';

export default function BarracoPage() {
  // Salva mudanças de nível/progresso imediatamente
  usePlayerProgressTracking();

  // ... resto do componente
}
```

## Segurança

### Senhas

- Armazenadas com hash Base64 (demo)
- Em produção: usar bcrypt ou similar
- Nunca armazenar em plain text

### Sessões

- Token armazenado em localStorage
- Validado a cada carregamento
- Limpo ao fazer logout

### Dados Sensíveis

- Credenciais não são expostas em URLs
- Dados do jogador sincronizados com banco de dados
- Validação no servidor (recomendado)

## Fluxo de Salvamento de Progresso

```
Jogador faz ação (sobe de nível, ganha dinheiro, etc)
    ↓
Zustand store é atualizado
    ↓
usePlayerDataSync() detecta mudança
    ├─ Se crítica: salva imediatamente
    └─ Se normal: aguarda próxima sincronização (30s)
    ↓
updatePlayer() é chamado
    ↓
Banco de dados é atualizado
    ↓
lastUpdated é registrado
```

## Testes

### Criar Perfil e Login

1. Ir para HomePage
2. Clicar "Criar Perfil"
3. Preencher formulário
4. Verificar se foi redirecionado para /star-map
5. Verificar dados no localStorage

### Persistência de Dados

1. Criar perfil
2. Mudar nível/progresso
3. Recarregar página
4. Verificar se dados foram mantidos

### Logout

1. Fazer login
2. Clicar logout no Header
3. Verificar se localStorage foi limpo
4. Verificar se foi redirecionado para home

## Troubleshooting

### Dados não são salvos

- Verificar se `usePlayerDataSync()` está sendo usado
- Verificar console para erros de API
- Verificar se playerId está sendo definido

### Sessão não persiste

- Verificar se `playerAuthToken` está em localStorage
- Verificar se `isPlayerAuthenticated()` retorna true
- Verificar se dados do jogador estão no banco

### Logout não funciona

- Verificar se `logoutLocalPlayer()` está sendo chamado
- Verificar se localStorage está sendo limpo
- Verificar se redirecionamento está funcionando

## Próximos Passos

1. **Implementar backend seguro** para autenticação
2. **Usar bcrypt** para hash de senhas
3. **Adicionar 2FA** (autenticação de dois fatores)
4. **Implementar refresh tokens** para sessões
5. **Adicionar validação de servidor** para dados
6. **Implementar backup automático** de dados
