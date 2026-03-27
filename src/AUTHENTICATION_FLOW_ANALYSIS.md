# Análise Completa do Fluxo de Autenticação

## TAREFA 1 - IDENTIFICAÇÃO DO FLUXO REAL

### Fluxo Local (Email/Senha)
**Arquivos envolvidos:**
- `src/components/LocalLoginForm.tsx` - UI de login/registro local
- `src/services/playerService.ts` - `registerLocalPlayer()`, `loginLocalPlayer()`, `getCurrentLocalPlayer()`, `isPlayerAuthenticated()`
- `src/services/authService.ts` - `registerCredentials()`, `validateCredentials()`, `createSession()`, `getAuthSession()`
- `src/services/indexedDBService.ts` - Persistência de credenciais e sessão
- `src/store/playerStore.ts` - Estado global do player
- `src/hooks/usePlayerAuth.ts` - Inicialização da autenticação ao carregar app

**Fluxo de Registro Local:**
1. `LocalLoginForm.handleRegister()` → `registerLocalPlayer(email, password, playerName)`
2. `registerLocalPlayer()`:
   - Cria novo player no banco com `createPlayerInDatabase()`
   - Registra credenciais com `registerCredentials(email, password, playerId)`
   - Cria sessão com `createSession(playerId, email)`
   - Retorna o player criado
3. `LocalLoginForm` → `setPlayer(player)` → `navigate('/star-map')`

**Fluxo de Login Local:**
1. `LocalLoginForm.handleLogin()` → `loginLocalPlayer(email, password)`
2. `loginLocalPlayer()`:
   - Reseta sessão anterior com `resetPlayerSession()`
   - Valida credenciais com `validateCredentials(email, password)` → retorna playerId
   - Carrega player do banco com `getPlayerFromDatabase(playerId)`
   - Cria nova sessão com `createSession(playerId, email)`
   - Atualiza `lastLoginAt`
   - Retorna player atualizado
3. `LocalLoginForm` → `setPlayer(player)` → `navigate('/star-map')`

**Reidratação da Sessão Local:**
1. App carrega → `usePlayerAuth()` executa
2. `usePlayerAuth()`:
   - Verifica se há sessão válida com `isPlayerAuthenticated()`
   - Se válida: carrega player com `getCurrentLocalPlayer()` → `getPlayer(playerId)`
   - Sincroniza store com `setPlayer(fullPlayer)`
3. `StarMapPage` lê `player` do store

---

### Fluxo Google (MemberProvider)
**Arquivos envolvidos:**
- `src/components/GoogleLoginButton.tsx` - UI de login Google
- `src/integrations/members/providers/MemberProvider.tsx` - Gerencia autenticação Google
- `src/integrations/members/index.ts` - Hook `useMember()`
- `src/services/playerService.ts` - `registerPlayer()`, `getPlayerById()`
- `src/store/playerStore.ts` - Estado global do player
- `src/hooks/usePlayerAuth.ts` - Inicialização da autenticação

**Fluxo de Login Google:**
1. `GoogleLoginButton.handleGoogleLogin()` → `actions.login()` (MemberProvider)
2. MemberProvider redireciona para `/api/auth/login` → Google OAuth
3. Após autenticação, `member` é preenchido com dados do Google
4. `GoogleLoginButton` useEffect detecta `member.loginEmail`
5. Busca player existente com `getPlayerById(email)`
6. Se não existir: cria com `registerPlayer(email, playerName, playerName)`
7. `setPlayer(player)` → `navigate('/star-map')`

**Reidratação da Sessão Google:**
1. App carrega → MemberProvider verifica cookie de sessão
2. Se válido: `member` é preenchido automaticamente
3. `usePlayerAuth()` executa:
   - Verifica sessão local com `isPlayerAuthenticated()`
   - Se não houver sessão local: player fica null
   - **PROBLEMA**: StarMapPage redireciona para /login porque player é null
4. `GoogleLoginButton` useEffect detecta `member` novamente
5. Repete fluxo de login

---

## TAREFA 2 - PROBLEMAS IDENTIFICADOS

### Problema 1: usePlayerAuth reseta tudo no início
**Arquivo:** `src/hooks/usePlayerAuth.ts` (LINHA 17)
```typescript
// ❌ ERRADO: Reseta ANTES de verificar sessão
await resetPlayerSession();
```
**Impacto:** Destrói a sessão local antes de verificar se é válida

**Solução:** Verificar PRIMEIRO, resetar APENAS se inválida

---

### Problema 2: GoogleLoginButton reseta sessão local
**Arquivo:** `src/components/GoogleLoginButton.tsx` (LINHA 37)
```typescript
// ❌ ERRADO: Reseta sessão local ao fazer login Google
await resetPlayerSession();
```
**Impacto:** Se usuário estava logado localmente, perde a sessão

**Solução:** Remover reset - deixar que usePlayerAuth faça isso

---

### Problema 3: StarMapPage não aguarda reidratação
**Arquivo:** `src/components/pages/StarMapPage.tsx` (LINHAS 48-55)
```typescript
// ⚠️ PROBLEMA: Redireciona para /login ANTES de player carregar
useEffect(() => {
  if (!player?._id) {
    navigate('/login');
    return;
  }
  setIsPageLoading(false);
}, [player?._id, navigate]);
```
**Impacto:** Se player ainda está carregando, redireciona para login

**Solução:** Aguardar que usePlayerAuth complete antes de verificar

---

### Problema 4: Mistura de fluxos na reidratação
**Cenário:** Usuário faz login local, fecha browser, reabre
1. App carrega
2. `usePlayerAuth()` verifica sessão local → encontra
3. Carrega player do banco
4. `StarMapPage` abre normalmente ✅

**Cenário:** Usuário faz login Google, fecha browser, reabre
1. App carrega
2. MemberProvider verifica cookie → encontra
3. `member` é preenchido
4. `usePlayerAuth()` verifica sessão local → NÃO encontra (não é local!)
5. Retorna `isAuthenticated=false`
6. `StarMapPage` redireciona para /login
7. `GoogleLoginButton` detecta `member` e faz login novamente
8. **Loop infinito ou redirecionamento desnecessário**

---

## TAREFA 3 - CORREÇÕES APLICADAS

### Correção 1: usePlayerAuth.ts
✅ **Aplicada**
- Verifica sessão ANTES de resetar
- Reseta APENAS se sessão inválida
- Carrega player do banco
- Sincroniza store

### Correção 2: GoogleLoginButton.tsx
✅ **Aplicada**
- Remove `resetPlayerSession()` 
- Deixa que usePlayerAuth gerencie reset
- Apenas processa novo login Google

---

## TAREFA 4 - FLUXOS ESPERADOS APÓS CORREÇÕES

### Login Local → Reidratação
1. Usuário faz login local
2. `registerLocalPlayer()` ou `loginLocalPlayer()` cria sessão em IndexedDB
3. `setPlayer(player)` sincroniza store
4. Navega para `/star-map`
5. **Ao reabrir:**
   - `usePlayerAuth()` verifica IndexedDB → encontra sessão
   - Carrega player do banco
   - `StarMapPage` abre normalmente

### Login Google → Reidratação
1. Usuário faz login Google
2. MemberProvider cria cookie de sessão
3. `GoogleLoginButton` cria/busca player
4. `setPlayer(player)` sincroniza store
5. Navega para `/star-map`
6. **Ao reabrir:**
   - MemberProvider verifica cookie → encontra
   - `member` é preenchido
   - `usePlayerAuth()` verifica IndexedDB → NÃO encontra (é Google!)
   - Retorna `isAuthenticated=false`
   - `StarMapPage` redireciona para `/login`
   - `GoogleLoginButton` detecta `member` e sincroniza player novamente
   - Navega para `/star-map`

---

## TAREFA 5 - VERIFICAÇÃO DE CONSISTÊNCIA

### Credenciais Locais
- ✅ `registerLocalPlayer()` salva com `_id` real do player
- ✅ `loginLocalPlayer()` lê sessão correta
- ✅ `createSession()` persiste playerId e email
- ✅ `getAuthSession()` retorna dados consistentes
- ✅ `loginLocalPlayer()` retorna player final real

### Sessão Google
- ✅ MemberProvider gerencia cookie
- ✅ `GoogleLoginButton` sincroniza player ao store
- ✅ Sem dependência de mock data

---

## TAREFA 6 - ARQUIVOS NÃO MENCIONADOS

### `/src/pages/api/auth/member.ts`
**Status:** Não participante do fluxo quebrado
- Fluxo local: não usa
- Fluxo Google: MemberProvider já gerencia autenticação
- **Não precisa de correção**

---

## RESUMO DAS CORREÇÕES

| Arquivo | Problema | Solução | Status |
|---------|----------|---------|--------|
| `usePlayerAuth.ts` | Reset antes de verificar | Verificar primeiro | ✅ Aplicada |
| `GoogleLoginButton.tsx` | Reset de sessão local | Remover reset | ✅ Aplicada |
| `StarMapPage.tsx` | Redireciona antes de carregar | Aguardar reidratação | ⏳ Próxima |
| `LocalLoginForm.tsx` | Sem problemas | - | ✅ OK |
| `authService.ts` | Sem problemas | - | ✅ OK |
| `indexedDBService.ts` | Sem problemas | - | ✅ OK |
| `playerService.ts` | Sem problemas | - | ✅ OK |

---

## PRÓXIMOS PASSOS

1. ✅ Corrigir `usePlayerAuth.ts` - FEITO
2. ✅ Corrigir `GoogleLoginButton.tsx` - FEITO
3. ⏳ Corrigir `StarMapPage.tsx` - Aguardar reidratação
4. ⏳ Testar fluxo local completo
5. ⏳ Testar fluxo Google completo
6. ⏳ Testar reidratação de ambos os fluxos
