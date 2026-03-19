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

          //const luxuryItems = {
            1: [
                { name: "Corrente de Prata", price: 120 },
                    { name: "Anel Simples", price: 120 },
                        { name: "Pulseira Fina", price: 120 },
                            { name: "Relógio Básico", price: 120 },
                                { name: "Óculos Escuros", price: 120 },
                                  ],
                                    2: [
                                        { name: "Corrente Banhada a Ouro", price: 132 },
                                            { name: "Anel Refinado", price: 132 },
                                                { name: "Pulseira Elegante", price: 132 },
                                                    { name: "Relógio Premium", price: 132 },
                                                        { name: "Bolsa Casual Chic", price: 132 },
                                                          ],
                                                            3: [
                                                                { name: "Colar Luxo", price: 145.2 },
                                                                    { name: "Anel Luxo", price: 145.2 },
                                                                        { name: "Pulseira Luxo", price: 145.2 },
                                                                            { name: "Relógio Luxo", price: 145.2 },
                                                                                { name: "Bolsa Luxo", price: 145.2 },
                                                                                  ],
                                                                                    4: [
                                                                                        { name: "Colar Premium", price: 159.72 },
                                                                                            { name: "Anel Premium", price: 159.72 },
                                                                                                { name: "Pulseira Premium", price: 159.72 },
                                                                                                    { name: "Relógio Premium Elite", price: 159.72 },
                                                                                                        { name: "Bolsa Premium", price: 159.72 },
                                                                                                          ],
                                                                                                            5: [
                                                                                                                { name: "Colar Ouro", price: 175.69 },
                                                                                                                    { name: "Anel Ouro", price: 175.69 },
                                                                                                                        { name: "Pulseira Ouro", price: 175.69 },
                                                                                                                            { name: "Relógio Ouro", price: 175.69 },
                                                                                                                                { name: "Bolsa Ouro", price: 175.69 },
                                                                                                                                  ],
                                                                                                                                    6: [
                                                                                                                                        { name: "Colar Diamante", price: 193.26 },
                                                                                                                                            { name: "Anel Diamante", price: 193.26 },
                                                                                                                                                { name: "Pulseira Diamante", price: 193.26 },
                                                                                                                                                    { name: "Relógio Diamante", price: 193.26 },
                                                                                                                                                        { name: "Bolsa Diamante", price: 193.26 },
                                                                                                                                                          ],
                                                                                                                                                            7: [
                                                                                                                                                                { name: "Colar Elite", price: 212.59 },
                                                                                                                                                                    { name: "Anel Elite", price: 212.59 },
                                                                                                                                                                        { name: "Pulseira Elite", price: 212.59 },
                                                                                                                                                                            { name: "Relógio Elite", price: 212.59 },
                                                                                                                                                                                { name: "Bolsa Elite", price: 212.59 },
                                                                                                                                                                                  ],
                                                                                                                                                                                    8: [
                                                                                                                                                                                        { name: "Colar Supremo", price: 233.85 },
                                                                                                                                                                                            { name: "Anel Supremo", price: 233.85 },
                                                                                                                                                                                                { name: "Pulseira Suprema", price: 233.85 },
                                                                                                                                                                                                    { name: "Relógio Supremo", price: 233.85 },
                                                                                                                                                                                                        { name: "Bolsa Suprema", price: 233.85 },
                                                                                                                                                                                                          ],
                                                                                                                                                                                                            9: [
                                                                                                                                                                                                                { name: "Colar Imperial", price: 257.23 },
                                                                                                                                                                                                                    { name: "Anel Imperial", price: 257.23 },
                                                                                                                                                                                                                        { name: "Pulseira Imperial", price: 257.23 },
                                                                                                                                                                                                                            { name: "Relógio Imperial", price: 257.23 },
                                                                                                                                                                                                                                { name: "Bolsa Imperial", price: 257.23 },
                                                                                                                                                                                                                                  ],
                                                                                                                                                                                                                                    10: [
                                                                                                                                                                                                                                        { name: "Colar Real", price: 282.95 },
                                                                                                                                                                                                                                            { name: "Anel Real", price: 282.95 },
                                                                                                                                                                                                                                                { name: "Pulseira Real", price: 282.95 },
                                                                                                                                                                                                                                                    { name: "Relógio Real", price: 282.95 },
                                                                                                                                                                                                                                                        { name: "Bolsa Real", price: 282.95 },
                                                                                                                                                                                                                                                          ],
                                                                                                                                                                                                                                                          };

const luxuryItems = {
    11: [
        { name: "Colar Magnata", price: 311.25 },
            { name: "Anel Magnata", price: 311.25 },
                { name: "Pulseira Magnata", price: 311.25 },
                    { name: "Relógio Magnata", price: 311.25 },
                        { name: "Bolsa Magnata", price: 311.25 },
                          ],
                            12: [
                                { name: "Colar Aristocrata", price: 342.37 },
                                    { name: "Anel Aristocrata", price: 342.37 },
                                        { name: "Pulseira Aristocrata", price: 342.37 },
                                            { name: "Relógio Aristocrata", price: 342.37 },
                                                { name: "Bolsa Aristocrata", price: 342.37 },
                                                  ],
                                                    13: [
                                                        { name: "Colar Nobre Supremo", price: 376.61 },
                                                            { name: "Anel Nobre Supremo", price: 376.61 },
                                                                { name: "Pulseira Nobre Suprema", price: 376.61 },
                                                                    { name: "Relógio Nobre Supremo", price: 376.61 },
                                                                        { name: "Bolsa Nobre Suprema", price: 376.61 },
                                                                          ],
                                                                            14: [
                                                                                { name: "Colar Dinastia", price: 414.27 },
                                                                                    { name: "Anel Dinastia", price: 414.27 },
                                                                                        { name: "Pulseira Dinastia", price: 414.27 },
                                                                                            { name: "Relógio Dinastia", price: 414.27 },
                                                                                                { name: "Bolsa Dinastia", price: 414.27 },
                                                                                                  ],
                                                                                                    15: [
                                                                                                        { name: "Colar Herança Imperial", price: 455.69 },
                                                                                                            { name: "Anel Herança Imperial", price: 455.69 },
                                                                                                                { name: "Pulseira Herança Imperial", price: 455.69 },
                                                                                                                    { name: "Relógio Herança Imperial", price: 455.69 },
                                                                                                                        { name: "Bolsa Herança Imperial", price: 455.69 },
                                                                                                                          ],
                                                                                                                            16: [
                                                                                                                                { name: "Colar Fortuna", price: 501.26 },
                                                                                                                                    { name: "Anel Fortuna", price: 501.26 },
                                                                                                                                        { name: "Pulseira Fortuna", price: 501.26 },
                                                                                                                                            { name: "Relógio Fortuna", price: 501.26 },
                                                                                                                                                { name: "Bolsa Fortuna", price: 501.26 },
                                                                                                                                                  ],
                                                                                                                                                    17: [
                                                                                                                                                        { name: "Colar Prestige", price: 551.39 },
                                                                                                                                                            { name: "Anel Prestige", price: 551.39 },
                                                                                                                                                                { name: "Pulseira Prestige", price: 551.39 },
                                                                                                                                                                    { name: "Relógio Prestige", price: 551.39 },
                                                                                                                                                                        { name: "Bolsa Prestige", price: 551.39 },
                                                                                                                                                                          ],
                                                                                                                                                                            18: [
                                                                                                                                                                                { name: "Colar Elite Suprema", price: 606.53 },
                                                                                                                                                                                    { name: "Anel Elite Suprema", price: 606.53 },
                                                                                                                                                                                        { name: "Pulseira Elite Suprema", price: 606.53 },
                                                                                                                                                                                            { name: "Relógio Elite Supremo", price: 606.53 },
                                                                                                                                                                                                { name: "Bolsa Elite Suprema", price: 606.53 },
                                                                                                                                                                                                  ],
                                                                                                                                                                                                    19: [
                                                                                                                                                                                                        { name: "Colar Lux Imperium", price: 667.18 },
                                                                                                                                                                                                            { name: "Anel Lux Imperium", price: 667.18 },
                                                                                                                                                                                                                { name: "Pulseira Lux Imperium", price: 667.18 },
                                                                                                                                                                                                                    { name: "Relógio Lux Imperium", price: 667.18 },
                                                                                                                                                                                                                        { name: "Bolsa Lux Imperium", price: 667.18 },
                                                                                                                                                                                                                          ],
                                                                                                                                                                                                                            20: [
                                                                                                                                                                                                                                { name: "Colar Apex Royal", price: 733.90 },
                                                                                                                                                                                                                                    { name: "Anel Apex Royal", price: 733.90 },
                                                                                                                                                                                                                                        { name: "Pulseira Apex Royal", price: 733.90 },
                                                                                                                                                                                                                                            { name: "Relógio Apex Royal", price: 733.90 },
                                                                                                                                                                                                                                                { name: "Bolsa Apex Royal", price: 733.90 },
                                                                                                                                                                                                                                                  ],
                                                                                                                                                                                                                                                  };

}
          };
const luxuryItems = {
    21: [
        { name: "Colar Sovereign", price: 807.29 },
            { name: "Anel Sovereign", price: 807.29 },
                { name: "Pulseira Sovereign", price: 807.29 },
                    { name: "Relógio Sovereign", price: 807.29 },
                        { name: "Bolsa Sovereign", price: 807.29 },
                          ],
                            22: [
                                { name: "Colar Monarch", price: 888.02 },
                                    { name: "Anel Monarch", price: 888.02 },
                                        { name: "Pulseira Monarch", price: 888.02 },
                                            { name: "Relógio Monarch", price: 888.02 },
                                                { name: "Bolsa Monarch", price: 888.02 },
                                                  ],
                                                    23: [
                                                        { name: "Colar Platinum Crown", price: 976.82 },
                                                            { name: "Anel Platinum Crown", price: 976.82 },
                                                                { name: "Pulseira Platinum Crown", price: 976.82 },
                                                                    { name: "Relógio Platinum Crown", price: 976.82 },
                                                                        { name: "Bolsa Platinum Crown", price: 976.82 },
                                                                          ],
                                                                            24: [
                                                                                { name: "Colar Grand Royale", price: 1074.50 },
                                                                                    { name: "Anel Grand Royale", price: 1074.50 },
                                                                                        { name: "Pulseira Grand Royale", price: 1074.50 },
                                                                                            { name: "Relógio Grand Royale", price: 1074.50 },
                                                                                                { name: "Bolsa Grand Royale", price: 1074.50 },
                                                                                                  ],
                                                                                                    25: [
                                                                                                        { name: "Colar Infinite Gold", price: 1181.95 },
                                                                                                            { name: "Anel Infinite Gold", price: 1181.95 },
                                                                                                                { name: "Pulseira Infinite Gold", price: 1181.95 },
                                                                                                                    { name: "Relógio Infinite Gold", price: 1181.95 },
                                                                                                                        { name: "Bolsa Infinite Gold", price: 1181.95 },
                                                                                                                          ],
                                                                                                                            26: [
                                                                                                                                { name: "Colar Diamond Legacy", price: 1300.15 },
                                                                                                                                    { name: "Anel Diamond Legacy", price: 1300.15 },
                                                                                                                                        { name: "Pulseira Diamond Legacy", price: 1300.15 },
                                                                                                                                            { name: "Relógio Diamond Legacy", price: 1300.15 },
                                                                                                                                                { name: "Bolsa Diamond Legacy", price: 1300.15 },
                                                                                                                                                  ],
                                                                                                                                                    27: [
                                                                                                                                                        { name: "Colar Obsidian Elite", price: 1430.17 },
                                                                                                                                                            { name: "Anel Obsidian Elite", price: 1430.17 },
                                                                                                                                                                { name: "Pulseira Obsidian Elite", price: 1430.17 },
                                                                                                                                                                    { name: "Relógio Obsidian Elite", price: 1430.17 },
                                                                                                                                                                        { name: "Bolsa Obsidian Elite", price: 1430.17 },
                                                                                                                                                                          ],
                                                                                                                                                                            28: [
                                                                                                                                                                                { name: "Colar Velvet Crown", price: 1573.19 },
                                                                                                                                                                                    { name: "Anel Velvet Crown", price: 1573.19 },
                                                                                                                                                                                        { name: "Pulseira Velvet Crown", price: 1573.19 },
                                                                                                                                                                                            { name: "Relógio Velvet Crown", price: 1573.19 },
                                                                                                                                                                                                { name: "Bolsa Velvet Crown", price: 1573.19 },
                                                                                                                                                                                                  ],
                                                                                                                                                                                                    29: [
                                                                                                                                                                                                        { name: "Colar Noir Prestige", price: 1730.51 },
                                                                                                                                                                                                            { name: "Anel Noir Prestige", price: 1730.51 },
                                                                                                                                                                                                                { name: "Pulseira Noir Prestige", price: 1730.51 },
                                                                                                                                                                                                                    { name: "Relógio Noir Prestige", price: 1730.51 },
                                                                                                                                                                                                                        { name: "Bolsa Noir Prestige", price: 1730.51 },
                                                                                                                                                                                                                          ],
                                                                                                                                                                                                                            30: [
                                                                                                                                                                                                                                { name: "Colar Zenith Royal", price: 1903.56 },
                                                                                                                                                                                                                                    { name: "Anel Zenith Royal", price: 1903.56 },
                                                                                                                                                                                                                                        { name: "Pulseira Zenith Royal", price: 1903.56 },
                                                                                                                                                                                                                                            { name: "Relógio Zenith Royal", price: 1903.56 },
                                                                                                                                                                                                                                                { name: "Bolsa Zenith Royal", price: 1903.56 },
                                                                                                                                                                                                                                                  ],
                                                                                                                                                                                                                                                  };

}
