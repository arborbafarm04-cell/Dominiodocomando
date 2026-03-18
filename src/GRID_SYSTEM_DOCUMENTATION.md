# Sistema de Grid - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Conceitos Fundamentais](#conceitos-fundamentais)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Guia de Uso](#guia-de-uso)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Validação e Erros](#validação-e-erros)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Sistema de Grid é um conjunto de ferramentas para gerenciar o posicionamento de objetos 3D em uma plataforma baseada em tiles. Garante que:

✅ Nada atravessa o chão  
✅ Nada flutua  
✅ Prédios encaixam perfeitamente  
✅ Grid funciona como um sistema real  

---

## 🧠 Conceitos Fundamentais

### 1. A Plataforma (Chão)

```
Y = 0 → Chão (plano da plataforma)
Y > 0 → Acima do chão
Y < 0 → Enterrado (PROIBIDO)
```

**Regra Fundamental:** Todos os objetos devem ter sua base em Y = 0 (apoiados na plataforma).

### 2. Sistema de Tiles

A plataforma é dividida em tiles quadrados:

```
┌─────┬─────┬─────┐
│(0,0)│(1,0)│(2,0)│
├─────┼─────┼─────┤
│(0,1)│(1,1)│(2,1)│
├─────┼─────┼─────┤
│(0,2)│(1,2)│(2,2)│
└─────┴─────┴─────┘
```

Cada tile tem coordenadas (X, Z).

### 3. Ocupação de Tiles

Um objeto 4x4 ocupa 16 tiles:

```
⬜⬜⬜⬜
⬜⬜⬜⬜
⬜⬜⬜⬜
⬜⬜⬜⬜
```

- Largura: 4 tiles (eixo X)
- Profundidade: 4 tiles (eixo Z)
- Total: 16 tiles

### 4. Posicionamento pelo Centro

Objetos são posicionados pelo **centro** do conjunto de tiles:

```
Para um objeto 4x4 começando em (0, 0):
Tiles: (0,0) até (3,3)
Centro: (1.5, 1.5) → arredonda para (2, 2)
Posição armazenada: (2, 2, 0)
```

---

## 🏗️ Arquitetura do Sistema

### Componentes Principais

#### 1. **GridSystem** - Gerenciador de Grid
```typescript
// Responsabilidades:
- Gerenciar tiles e ocupação
- Registrar/remover objetos
- Converter entre coordenadas do mundo e grid
- Rastrear tiles ocupados
```

#### 2. **SpatialValidator** - Validador de Regras
```typescript
// Responsabilidades:
- Validar altura (Y)
- Validar alinhamento ao grid
- Validar limites da plataforma
- Validar sobreposição
- Validar dimensões
```

#### 3. **ObjectPositioner** - Posicionador Seguro
```typescript
// Responsabilidades:
- Colocar objetos com validação
- Mover objetos com segurança
- Encontrar posições válidas
- Gerar relatórios
```

#### 4. **PlatformRules** - Documento de Regras
```typescript
// Responsabilidades:
- Definir todas as regras
- Fornecer funções auxiliares
- Documentar comportamentos
```

---

## 📖 Guia de Uso

### Inicializar o Sistema

```typescript
import { GridSystem, SpatialValidator, ObjectPositioner } from '@/systems';

// 1. Criar grid
const gridSystem = new GridSystem({
  tileSize: 1,
  platformWidth: 100,
  platformDepth: 100,
  platformY: 0,
  maxObjectHeight: 50,
});

// 2. Criar validador
const validator = new SpatialValidator(gridSystem);

// 3. Criar posicionador
const positioner = new ObjectPositioner(gridSystem, validator);
```

### Colocar um Objeto

```typescript
// Criar objeto
const building = {
  id: 'building-1',
  position: { x: 50, z: 50, y: 0 }, // Centro, no chão
  width: 4,
  depth: 4,
  height: 10,
  type: 'building',
};

// Colocar com validação
const result = positioner.placeObject(building, {
  validateBeforePlace: true,
  throwOnError: true,
});

if (result.success) {
  console.log('Objeto colocado com sucesso!');
} else {
  console.error('Erros:', result.validation.errors);
}
```

### Mover um Objeto

```typescript
// Mover para nova posição
const moveResult = positioner.moveObject('building-1', {
  x: 60,
  z: 60,
  y: 0,
});

if (moveResult.success) {
  console.log('Objeto movido com sucesso!');
} else {
  console.error('Erros:', moveResult.validation.errors);
}
```

### Encontrar Posição Válida

```typescript
// Procurar por espaço livre para objeto 4x4
const validPosition = positioner.findValidPosition(4, 4);

if (validPosition) {
  console.log(`Posição válida encontrada: (${validPosition.x}, ${validPosition.z})`);
} else {
  console.log('Nenhuma posição válida encontrada');
}
```

### Validar Todos os Objetos

```typescript
// Gerar relatório de validação
const report = validator.generateReport();
console.log(report);
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Colocar Prédio 4x4

```typescript
const building = {
  id: 'predio-central',
  position: { x: 50, z: 50, y: 0 },
  width: 4,
  depth: 4,
  height: 15,
  type: 'building',
};

positioner.placeObject(building);
```

### Exemplo 2: Colocar Árvore 1x1

```typescript
const tree = {
  id: 'tree-1',
  position: { x: 30, z: 30, y: 0 },
  width: 1,
  depth: 1,
  height: 8,
  type: 'tree',
};

positioner.placeObject(tree);
```

### Exemplo 3: Colocar Múltiplos Objetos

```typescript
const objects = [
  {
    id: 'building-1',
    position: { x: 20, z: 20, y: 0 },
    width: 3,
    depth: 3,
    height: 12,
    type: 'building',
  },
  {
    id: 'building-2',
    position: { x: 50, z: 50, y: 0 },
    width: 4,
    depth: 4,
    height: 15,
    type: 'building',
  },
  {
    id: 'tree-1',
    position: { x: 10, z: 10, y: 0 },
    width: 1,
    depth: 1,
    height: 8,
    type: 'tree',
  },
];

objects.forEach((obj) => {
  try {
    positioner.placeObject(obj);
    console.log(`✓ ${obj.id} colocado com sucesso`);
  } catch (error) {
    console.error(`✗ Erro ao colocar ${obj.id}:`, error.message);
  }
});
```

### Exemplo 4: Visualizar Grid

```typescript
// Mostrar grid (· = vazio, █ = ocupado)
const visualization = positioner.visualizeGrid(20, 20);
console.log(visualization);

// Saída:
// ·······█████·······
// ·······█████·······
// ·······█████·······
// ·······█████·······
// ·······█████·······
// ...
```

### Exemplo 5: Gerar Relatório

```typescript
const report = positioner.generatePositioningReport();
console.log(report);

// Saída:
// === RELATÓRIO DE POSICIONAMENTO ===
//
// Configuração da Plataforma:
//   - Tamanho: 100 x 100 tiles
//   - Tamanho do Tile: 1 unidades
//   - Altura máxima: 50 unidades
//
// Objetos Posicionados: 3
//
//   BUILDING - building-1
//     Posição: (20, 20, 0)
//     Dimensões: 3x3 tiles
//     Altura: 12 unidades
//     Tiles ocupados: 9
//   ...
```

---

## ✅ Validação e Erros

### Regras de Validação

1. **Altura (Y)**
   - ✓ Y = 0 (apoiado na plataforma)
   - ✗ Y < 0 (enterrado)
   - ✗ Y > 0 (flutuando)

2. **Alinhamento ao Grid**
   - ✓ X e Z são inteiros
   - ✓ Largura e profundidade são inteiras
   - ✗ Posições decimais
   - ✗ Dimensões decimais

3. **Limites da Plataforma**
   - ✓ Objeto dentro dos limites
   - ✗ Objeto sai dos limites

4. **Sobreposição**
   - ✓ Nenhum tile ocupado por outro objeto
   - ✗ Tiles sobrepostos

5. **Dimensões**
   - ✓ Dimensões resultam em ocupação válida
   - ✗ Dimensões zero ou negativas

### Mensagens de Erro

```typescript
// Exemplo de erro
try {
  positioner.placeObject(invalidObject);
} catch (error) {
  console.error(error.message);
  // "Erro ao posicionar objeto building-1: Base deve estar em Y = 0 (chão). Atual: Y = 5"
}
```

### Validação Sem Exceção

```typescript
// Validar sem lançar exceção
const result = positioner.placeObject(obj, {
  validateBeforePlace: true,
  throwOnError: false, // Não lançar exceção
});

if (!result.success) {
  console.log('Erros:', result.validation.errors);
  console.log('Avisos:', result.validation.warnings);
}
```

---

## 🔧 Troubleshooting

### Problema: "Objeto não pode estar enterrado (Y < 0)"

**Causa:** Posição Y é negativa

**Solução:**
```typescript
// ✗ Errado
const obj = { ..., position: { x: 50, z: 50, y: -5 } };

// ✓ Correto
const obj = { ..., position: { x: 50, z: 50, y: 0 } };
```

### Problema: "Base do objeto deve estar em Y = 0"

**Causa:** Objeto está flutuando (Y > 0)

**Solução:**
```typescript
// ✗ Errado
const obj = { ..., position: { x: 50, z: 50, y: 10 } };

// ✓ Correto
const obj = { ..., position: { x: 50, z: 50, y: 0 } };
```

### Problema: "Posição X deve ser um número inteiro"

**Causa:** Posição X é decimal

**Solução:**
```typescript
// ✗ Errado
const obj = { ..., position: { x: 50.5, z: 50, y: 0 } };

// ✓ Correto
const obj = { ..., position: { x: 50, z: 50, y: 0 } };
// ou
const obj = { ..., position: { x: Math.round(50.5), z: 50, y: 0 } };
```

### Problema: "Objeto sobrepõe outro objeto"

**Causa:** Tiles já ocupados por outro objeto

**Solução:**
```typescript
// Encontrar posição válida
const validPos = positioner.findValidPosition(4, 4);
if (validPos) {
  positioner.moveObject('building-1', validPos);
}
```

### Problema: "Objeto sai dos limites da plataforma"

**Causa:** Objeto está muito perto da borda

**Solução:**
```typescript
// Verificar limites antes de colocar
const config = gridSystem.getConfig();
const maxX = config.platformWidth - Math.ceil(obj.width / 2);
const maxZ = config.platformDepth - Math.ceil(obj.depth / 2);

if (obj.position.x <= maxX && obj.position.z <= maxZ) {
  positioner.placeObject(obj);
}
```

---

## 📚 Referência Rápida

### Criar Grid
```typescript
const gridSystem = new GridSystem(config);
```

### Criar Validador
```typescript
const validator = new SpatialValidator(gridSystem);
```

### Criar Posicionador
```typescript
const positioner = new ObjectPositioner(gridSystem, validator);
```

### Colocar Objeto
```typescript
positioner.placeObject(obj, options);
```

### Mover Objeto
```typescript
positioner.moveObject(objectId, newPosition, options);
```

### Encontrar Posição
```typescript
positioner.findValidPosition(width, depth);
```

### Validar Tudo
```typescript
validator.validateAllObjects();
```

### Gerar Relatório
```typescript
validator.generateReport();
positioner.generatePositioningReport();
```

---

## 🎓 Conclusão

O Sistema de Grid garante que:

✔ Plataforma = chão (Y = 0)  
✔ Objetos sempre apoiados  
✔ Grid alinhado perfeitamente  
✔ Sem sobreposição  
✔ Sem flutuação  
✔ Sem afundamento  

**Resultado:** Posicionamento consistente, realista e alinhado ao grid para todos os objetos do jogo.
