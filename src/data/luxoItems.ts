// ==========================================
// LUXURY ITEMS SYSTEM
// ==========================================

// Estrutura de um item
type LuxuryItem = {
  name: string;
    price: number;
    };

    // Estrutura de todos os níveis
    type LuxuryItemsByLevel = {
      [level: number]: LuxuryItem[];
      };

      // Função pra pegar os itens pelo nível
      export function getItemsByLevel(level: number, data: LuxuryItemsByLevel) {
        return data[level] || [];
        }

        // ==========================================
        // ITENS DE LUXO (COLE ABAIXO)
        // ==========================================

        export const luxuryItems: LuxuryItemsByLevel = {

          //

          };
