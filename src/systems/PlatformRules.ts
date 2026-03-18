/**
 * PlatformRules.ts
 * Documento de regras espaciais e estruturais
 * Define todas as regras que devem ser seguidas no sistema de grid
 */

/**
 * ============================================
 * REGRAS ESPACIAIS E ESTRUTURAIS
 * ============================================
 *
 * 1. DEFINIÇÃO DE PLANO DA PLATAFORMA
 * ────────────────────────────────────
 * - A plataforma representa o chão do jogo
 * - Todos os tiles estão no mesmo plano horizontal (eixo Y = 0)
 * - Este plano define o que é "base" do mundo
 *
 * 2. DEFINIÇÃO DE "EM CIMA" E "EMBAIXO"
 * ────────────────────────────────────
 * - "em cima da plataforma" = qualquer posição com Y ≥ 0
 * - "embaixo da plataforma" = qualquer posição com Y < 0 (PROIBIDO)
 *
 * 3. FIXAÇÃO OBRIGATÓRIA
 * ────────────────────────────────────
 * - A base de qualquer objeto 3D deve encostar exatamente no plano da plataforma
 * - Não permitir:
 *   ✗ Objetos flutuando (Y > 0 sem contato)
 *   ✗ Objetos afundados (Y < 0)
 * - Todos os objetos devem estar apoiados sobre a plataforma
 *
 * 4. SISTEMA DE GRID (TILES)
 * ────────────────────────────────────
 * - A plataforma é dividida em tiles quadrados
 * - Cada tile tem coordenadas (X, Z)
 * - Todos os objetos devem alinhar exatamente ao grid
 * - Não pode ocupar "meio tile"
 *
 * 5. DEFINIÇÃO DE OCUPAÇÃO (ex: 4x4)
 * ────────────────────────────────────
 * - Um objeto 4x4 significa:
 *   • Ocupa 4 tiles no eixo X
 *   • Ocupa 4 tiles no eixo Z
 *   • Total = 16 tiles
 * - Posicionamento usa o CENTRO do conjunto de tiles
 *
 * 6. REGRAS DE OCUPAÇÃO
 * ────────────────────────────────────
 * - Objetos só podem ocupar tiles inteiros
 * - Não pode ocupar "meio tile"
 * - Não pode sobrepor outro objeto
 * - Cada tile pode ser ocupado por apenas um objeto
 *
 * 7. POSICIONAMENTO CORRETO DE OBJETOS GRANDES
 * ────────────────────────────────────────────
 * - Para objetos 4x4:
 *   • Posicionar usando o centro do conjunto de tiles
 *   • Alinhar perfeitamente ao grid
 *   • Garantir que todos os 16 tiles estejam dentro da área do objeto
 * - Fórmula para centro:
 *   centerX = startX + (width - 1) / 2
 *   centerZ = startZ + (depth - 1) / 2
 *
 * 8. COLISÃO E LIMITES
 * ────────────────────────────────────
 * - Impedir que objetos atravessem:
 *   ✗ A plataforma (Y < 0)
 *   ✗ Outros objetos
 * - Respeitar limites de altura e base
 * - Respeitar limites da plataforma (não sair dos limites)
 *
 * 9. VALIDAÇÃO CONTÍNUA
 * ────────────────────────────────────
 * - Validar antes de colocar objeto
 * - Validar antes de mover objeto
 * - Validar ao carregar estado salvo
 * - Gerar relatórios de validação
 *
 * ============================================
 * EXEMPLO PRÁTICO: OBJETO 4x4
 * ============================================
 *
 * Visualização:
 * ⬜⬜⬜⬜
 * ⬜⬜⬜⬜
 * ⬜⬜⬜⬜
 * ⬜⬜⬜⬜
 *
 * - Ocupa 16 tiles (4 x 4)
 * - Se começar em (0, 0), vai até (3, 3)
 * - Centro está em (1.5, 1.5) → arredonda para (2, 2)
 * - Posição armazenada: (2, 2, 0)
 * - Y = 0 (apoiado na plataforma)
 *
 * ============================================
 * CHECKLIST DE VALIDAÇÃO
 * ============================================
 *
 * ✓ Y = 0 (base apoiada na plataforma)
 * ✓ X e Z são inteiros (tiles inteiros)
 * ✓ Largura e profundidade são inteiras e positivas
 * ✓ Não sai dos limites da plataforma
 * ✓ Não sobrepõe outro objeto
 * ✓ Altura é positiva e dentro do limite
 * ✓ Dimensões resultam em ocupação válida
 *
 * ============================================
 * RESULTADO ESPERADO
 * ============================================
 *
 * ✔ Nada atravessa o chão
 * ✔ Nada flutua
 * ✔ Prédios encaixam perfeito
 * ✔ Grid vira sistema de verdade
 * ✔ Posicionamento consistente e realista
 *
 */

export const PLATFORM_RULES = {
  // Eixo Y (altura)
  PLATFORM_Y: 0, // Altura do chão
  MIN_Y: 0, // Mínimo permitido (Y não pode ser negativo)
  MAX_Y: 50, // Máximo permitido (altura máxima)

  // Grid
  TILE_SIZE: 1, // Tamanho padrão de cada tile
  PLATFORM_WIDTH: 100, // Largura padrão da plataforma em tiles
  PLATFORM_DEPTH: 100, // Profundidade padrão da plataforma em tiles

  // Validação
  REQUIRE_INTEGER_POSITIONS: true, // Posições devem ser inteiras
  REQUIRE_PLATFORM_ALIGNMENT: true, // Deve estar alinhado ao grid
  PREVENT_OVERLAP: true, // Não permitir sobreposição
  PREVENT_FLOATING: true, // Não permitir flutuação
  PREVENT_SINKING: true, // Não permitir afundamento

  // Mensagens de erro
  ERRORS: {
    INVALID_Y_NEGATIVE: 'Objeto não pode estar enterrado (Y < 0)',
    INVALID_Y_NOT_ZERO: 'Base do objeto deve estar em Y = 0 (apoiado na plataforma)',
    INVALID_Y_TOO_HIGH: 'Altura do objeto excede o limite máximo',
    INVALID_X_NOT_INTEGER: 'Posição X deve ser um número inteiro (tile inteiro)',
    INVALID_Z_NOT_INTEGER: 'Posição Z deve ser um número inteiro (tile inteiro)',
    INVALID_WIDTH: 'Largura deve ser um número inteiro positivo',
    INVALID_DEPTH: 'Profundidade deve ser um número inteiro positivo',
    OUT_OF_BOUNDS_X: 'Objeto sai dos limites da plataforma (eixo X)',
    OUT_OF_BOUNDS_Z: 'Objeto sai dos limites da plataforma (eixo Z)',
    OVERLAP_DETECTED: 'Objeto sobrepõe outro objeto',
    INVALID_HEIGHT: 'Altura do objeto é inválida',
  },
};

/**
 * Função auxiliar para calcular o centro de um conjunto de tiles
 * Útil para posicionar objetos grandes (ex: 4x4)
 */
export function calculateTileSetCenter(
  startX: number,
  startZ: number,
  width: number,
  depth: number
): { x: number; z: number } {
  const centerX = startX + (width - 1) / 2;
  const centerZ = startZ + (depth - 1) / 2;

  return {
    x: Math.round(centerX),
    z: Math.round(centerZ),
  };
}

/**
 * Função auxiliar para obter os tiles ocupados por um objeto
 */
export function getOccupiedTiles(
  centerX: number,
  centerZ: number,
  width: number,
  depth: number
): Array<{ x: number; z: number }> {
  const tiles: Array<{ x: number; z: number }> = [];
  const startX = centerX - Math.floor(width / 2);
  const startZ = centerZ - Math.floor(depth / 2);

  for (let x = startX; x < startX + width; x++) {
    for (let z = startZ; z < startZ + depth; z++) {
      tiles.push({ x, z });
    }
  }

  return tiles;
}

/**
 * Função auxiliar para verificar se um objeto está dentro dos limites
 */
export function isWithinPlatformBounds(
  centerX: number,
  centerZ: number,
  width: number,
  depth: number,
  platformWidth: number,
  platformDepth: number
): boolean {
  const startX = centerX - Math.floor(width / 2);
  const endX = startX + width - 1;
  const startZ = centerZ - Math.floor(depth / 2);
  const endZ = startZ + depth - 1;

  return (
    startX >= 0 &&
    endX < platformWidth &&
    startZ >= 0 &&
    endZ < platformDepth
  );
}

export default PLATFORM_RULES;
