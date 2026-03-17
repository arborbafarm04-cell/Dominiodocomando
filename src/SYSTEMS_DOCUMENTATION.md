# Sistemas Implementados - Documentação

## 1. Sistema de Zonas de Suborno (Bribery Zone System)

### Localização
- **Arquivo Principal**: `/src/systems/briberyZoneSystem.ts`
- **Integração**: `/src/components/game/Multiplayer3DMap.tsx`

### Descrição
O sistema de zonas de suborno define áreas distintas no mapa 3D para cada tipo de NPC de suborno. Cada zona possui:
- **ID único**: Identificador da zona
- **Nome**: Nome do local (ex: "Delegacia", "Tribunal")
- **Tipo de NPC**: Tipo de autoridade (guard, delegado, investigador, etc.)
- **Posição**: Centro da zona (centerX, centerZ)
- **Dimensões**: Largura e altura da zona
- **Cor**: Cor hexadecimal para visualização no mapa
- **Valor Base de Suborno**: Quantidade base de dinheiro sujo para subornar

### Zonas Definidas
1. **Guarda de Rua** - Azul Real (0x4169E1) - 100 moedas
2. **Delegacia** - Vermelho Tomate (0xFF6347) - 500 moedas
3. **Investigador** - Orquídea Escura (0x9932CC) - 300 moedas
4. **Vereador** - Ouro (0xFFD700) - 400 moedas
5. **Prefeitura** - Verde Mar Claro (0x20B2AA) - 600 moedas
6. **Promotor** - Rosa Profundo (0xFF1493) - 550 moedas
7. **Tribunal** - Marrom Sela (0x8B4513) - 700 moedas
8. **Secretaria** - Turquesa Escuro (0x00CED1) - 450 moedas
9. **Governo Estadual** - Verde Limão (0x32CD32) - 800 moedas
10. **Ministério** - Vermelho Laranja (0xFF4500) - 900 moedas
11. **Palácio do Governo** - Carmesim (0xDC143C) - 1000 moedas

### Funções Principais

#### `isInBriberyZone(x: number, z: number): BriberyZone | null`
Verifica se uma posição está dentro de uma zona de suborno.
```typescript
const zone = isInBriberyZone(10, 15);
if (zone) {
  console.log(`Você está em: ${zone.name}`);
}
```

#### `isInQGArea(x: number, z: number): boolean`
Verifica se uma posição está na área do QG do Complexo.

#### `isValidBarracoPosition(x: number, z: number, width: number, height: number): boolean`
Valida se uma posição é adequada para colocar um barraco (não em QG, não em zona de suborno, não ocupada).

#### `getBriberyZonesList(): BriberyZone[]`
Retorna lista de todas as zonas de suborno.

#### `getBriberyZoneById(id: string): BriberyZone | undefined`
Obtém uma zona específica pelo ID.

#### `getBriberyZoneByNpcType(npcType: string): BriberyZone | undefined`
Obtém uma zona específica pelo tipo de NPC.

### Visualização no Mapa
- Cada zona é renderizada com uma cor distinta
- Bordas das zonas são desenhadas com linhas coloridas
- Tiles dentro das zonas têm cor e emissão personalizadas
- Legenda de cores exibida no painel superior esquerdo do mapa

### Integração com Barracos
- Barracos não podem ser colocados em zonas de suborno
- Barracos não podem ser colocados na área do QG
- Sistema de validação automática ao gerar posições aleatórias

---

## 2. Sistema de Facções (Faction System)

### Localização
- **Store**: `/src/store/factionStore.ts`
- **Componente UI**: `/src/components/FactionManager.tsx`

### Descrição
Sistema completo de gerenciamento de facções que permite:
- Criar novas facções
- Convidar e aceitar membros
- Gerenciar liderança
- Sair de facções
- Visualizar todas as facções

### Estrutura de Dados

#### Interface `Faction`
```typescript
interface Faction {
  id: string;                    // UUID único
  name: string;                  // Nome da facção
  leaderId: string;              // ID do líder
  leaderName: string;            // Nome do líder
  members: string[];             // Array de IDs dos membros
  memberNames: string[];         // Array de nomes dos membros
  createdAt: Date;               // Data de criação
  color: number;                 // Cor hexadecimal
  description?: string;          // Descrição opcional
}
```

#### Interface `FactionInvite`
```typescript
interface FactionInvite {
  id: string;                    // UUID único
  factionId: string;             // ID da facção
  playerId: string;              // ID do jogador convidado
  playerName: string;            // Nome do jogador
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;               // Data do convite
}
```

### Ações do Store

#### `createFaction(name, leaderId, leaderName, color, description?): Faction`
Cria uma nova facção com o jogador como líder.

#### `deleteFaction(factionId): void`
Deleta uma facção (apenas líder).

#### `updateFaction(factionId, updates): void`
Atualiza informações da facção.

#### `addMember(factionId, playerId, playerName): void`
Adiciona um membro à facção.

#### `removeMember(factionId, playerId): void`
Remove um membro da facção.

#### `createInvite(factionId, playerId, playerName): FactionInvite`
Cria um convite para um jogador.

#### `acceptInvite(inviteId, factionId, playerId, playerName): void`
Aceita um convite e adiciona o jogador à facção.

#### `rejectInvite(inviteId): void`
Rejeita um convite.

#### `setPlayerFaction(factionId | null): void`
Define a facção atual do jogador.

#### `getFaction(factionId): Faction | undefined`
Obtém uma facção pelo ID.

#### `getPlayerFaction(): Faction | undefined`
Obtém a facção atual do jogador.

### Componente FactionManager

#### Props
```typescript
interface FactionManagerProps {
  playerId: string;      // ID do jogador atual
  playerName: string;    // Nome do jogador atual
}
```

#### Funcionalidades
- **Criar Facção**: Diálogo para criar nova facção com nome e descrição
- **Visualizar Membros**: Lista de todos os membros da facção
- **Remover Membros**: Apenas o líder pode remover membros
- **Sair da Facção**: Deixar a facção (com validações)
- **Listar Facções**: Visualizar todas as facções do servidor

#### Uso
```typescript
import FactionManager from '@/components/FactionManager';

<FactionManager playerId="player-123" playerName="João" />
```

### Persistência
- Dados salvos em localStorage com chave `faction-store`
- Sincronização automática entre abas do navegador
- Dados persistem entre sessões

---

## 3. QG do Complexo (Central Headquarters)

### Localização
- **Mapa**: Centro do mapa 3D
- **Dimensões**: 8x8 tiles (64 tiles totais)
- **Cor**: Verde (0x1a4d2e com emissão 0x00ff00)

### Características
- Área central reservada para disputas entre facções
- Visualização com linha verde de limite
- Barracos não podem ser colocados nesta área
- Zona de suborno não pode ocupar esta área

### Uso Futuro
- Controle de administração do complexo
- Disputas entre facções
- Eventos especiais
- Recompensas por controle

---

## 4. Integração no Mapa 3D

### Mudanças em `Multiplayer3DMap.tsx`

#### Importações
```typescript
import { BRIBERY_ZONES, isInBriberyZone, isValidBarracoPosition } from '@/systems/briberyZoneSystem';
```

#### Renderização de Zonas
- Tiles em zonas de suborno têm cores distintas
- Bordas das zonas desenhadas com linhas coloridas
- Painel de informações mostra legenda de cores

#### Validação de Posições
- Função `generateBarracoPosition()` usa `isValidBarracoPosition()`
- Garante que barracos não sobrepõem zonas de suborno ou QG

#### Painel de Informações
- Exibe todas as zonas de suborno com cores
- Mostra estatísticas do mapa
- Rolável para visualizar todas as zonas

---

## 5. Próximas Implementações Sugeridas

### Curto Prazo
1. **Sistema de Cliques no Mapa**
   - Detectar cliques em zonas de suborno
   - Abrir diálogos de suborno
   - Registrar tentativas de suborno

2. **Convites de Facção**
   - Sistema de convites entre jogadores
   - Notificações de convites
   - Aceitação/rejeição de convites

3. **Controle do QG**
   - Sistema de disputa pelo QG
   - Recompensas por controle
   - Eventos de captura

### Médio Prazo
1. **Persistência em Banco de Dados**
   - Salvar facções em CMS
   - Sincronizar com servidor
   - Histórico de mudanças

2. **Sistema de Ranking**
   - Ranking de facções
   - Estatísticas de membros
   - Recompensas por posição

3. **Eventos de Facção**
   - Guerras entre facções
   - Alianças temporárias
   - Torneios

---

## 6. Exemplos de Uso

### Criar uma Facção
```typescript
import { useFactionStore } from '@/store/factionStore';

const { createFaction } = useFactionStore();

const newFaction = createFaction(
  'Os Reis do Complexo',
  'player-123',
  'João',
  0xff4500,
  'Facção dominante do complexo'
);
```

### Adicionar Membro
```typescript
const { addMember } = useFactionStore();

addMember('faction-id', 'player-456', 'Maria');
```

### Verificar Zona de Suborno
```typescript
import { isInBriberyZone } from '@/systems/briberyZoneSystem';

const zone = isInBriberyZone(10, 15);
if (zone) {
  console.log(`Zona: ${zone.name}, Valor: ${zone.baseBribeValue}`);
}
```

### Validar Posição de Barraco
```typescript
import { isValidBarracoPosition } from '@/systems/briberyZoneSystem';

if (isValidBarracoPosition(5, 5, 2, 2)) {
  // Posição válida para colocar barraco
}
```

---

## 7. Notas Técnicas

### Performance
- Validação de posições é O(n) onde n = número de zonas (11)
- Renderização de zonas otimizada com BufferGeometry
- Sem impacto significativo na performance do mapa

### Compatibilidade
- Funciona com sistema existente de barracos
- Compatível com sistema de jogadores
- Integrado com Three.js para renderização

### Segurança
- Validação no cliente (deve ser replicada no servidor)
- Sem exposição de dados sensíveis
- Pronto para integração com backend

---

## 8. Troubleshooting

### Barracos aparecem em zonas de suborno
- Verificar se `isValidBarracoPosition()` está sendo chamado
- Confirmar que `BRIBERY_ZONES` está importado corretamente

### Cores das zonas não aparecem
- Verificar se `BRIBERY_ZONES` está definido
- Confirmar que cores hexadecimais são válidas
- Verificar console para erros de renderização

### Facções não persistem
- Verificar se localStorage está habilitado
- Confirmar que `persist` middleware está configurado
- Verificar console para erros de Zustand

---

## 9. Contato e Suporte

Para dúvidas ou problemas com os sistemas:
1. Verificar console do navegador para erros
2. Confirmar que todas as importações estão corretas
3. Testar com dados de exemplo
4. Consultar documentação do Three.js e Zustand se necessário
