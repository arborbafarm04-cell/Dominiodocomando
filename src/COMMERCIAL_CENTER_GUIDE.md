# Centro Comercial - Sistema Completo

## 📋 Visão Geral

O Centro Comercial foi completamente reformulado para ser mais imersivo, com negócios engraçados, animações e um sistema de upgrades profundo.

## 🏪 Negócios Disponíveis

### 1. 🚗 Lava Rápido do Seu Zé
- **Taxa Base:** 15%
- **Retorno Base:** 85%
- **Tempo:** 5 minutos
- **Risco:** Baixo
- **Respeito Necessário:** 0
- **Descrição:** Lavagem rápida com espuma e brilho

### 2. 🍺 Bar do Zé Cachaceiro
- **Taxa Base:** 12%
- **Retorno Base:** 88%
- **Tempo:** 10 minutos
- **Risco:** Baixo
- **Respeito Necessário:** 5
- **Descrição:** Bebidas, conversa e dinheiro limpo

### 3. 🔧 Oficina do Malandro
- **Taxa Base:** 18%
- **Retorno Base:** 115%
- **Tempo:** 20 minutos
- **Risco:** Médio
- **Respeito Necessário:** 15
- **Descrição:** Consertos que ninguém pergunta

### 4. 🎉 Balada do Crime
- **Taxa Base:** 20%
- **Retorno Base:** 140%
- **Tempo:** 30 minutos
- **Risco:** Médio
- **Respeito Necessário:** 30
- **Descrição:** Música alta, bebida cara, dinheiro limpo

### 5. 👻 Empresa Fantasma S.A.
- **Taxa Base:** 25%
- **Retorno Base:** 190%
- **Tempo:** 1 hora
- **Risco:** Alto
- **Respeito Necessário:** 50
- **Descrição:** Consultoria em operações especiais

## 💰 Sistema de Operações

### Limite Diário
- **Padrão:** 1 operação por dia
- **Upgradável:** Até 10 operações por dia
- **Reset:** Meia-noite (00:00)

### Cálculo de Retorno
```
Retorno Efetivo = (Valor × Conversão) - Taxa
Conversão Efetiva = Conversão Base + Bônus de Upgrade
Taxa Efetiva = Taxa Base - Redução de Upgrade
```

### Exemplo
- Valor: $1000
- Negócio: Lava Rápido (85% conversão, 15% taxa)
- Sem upgrades: $1000 × 0.85 = $850 → $850 × 0.15 = $127.50 taxa → **$722.50 retorno**
- Com upgrades (10% redução taxa, 5% bônus conversão): 
  - Conversão: 0.85 + 0.05 = 0.90
  - Taxa: 0.15 - 0.10 = 0.05
  - $1000 × 0.90 = $900 → $900 × 0.05 = $45 taxa → **$855 retorno**

## 🎯 Sistema de Risco

### Chance de Falha
- **Baixo:** 5% (reduzido por Inteligência)
- **Médio:** 15% (reduzido por Inteligência)
- **Alto:** 30% (reduzido por Inteligência)

### Redução de Risco
- **Inteligência:** -1% chance de falha por nível
- **Falha:** Retorna 50% do valor investido

## 📈 Sistema de Upgrades

### 1. Redução de Taxa
- **Custo:** $5000 por nível
- **Efeito:** -1% taxa por nível
- **Máximo:** 25 níveis
- **Custo Total:** $125.000

### 2. Bônus de Conversão
- **Custo:** $7500 por nível
- **Efeito:** +0.5% retorno por nível
- **Máximo:** 50 níveis
- **Custo Total:** $375.000

### 3. Operações por Dia
- **Custo:** $10.000 por nível
- **Efeito:** +1 operação por dia
- **Máximo:** 10 níveis (até 11 operações/dia)
- **Custo Total:** $100.000

## 🎨 Animações e Visual

### Cartões de Negócios
- Emojis representativos para cada negócio
- Animação de hover (scale + y offset)
- Brilho dinâmico quando selecionado
- Gradiente de fundo animado

### Operações em Andamento
- Barra de progresso animada
- Contador de tempo em tempo real
- Animação de entrada suave
- Atualização a cada segundo

### Upgrades
- Barra de progresso do nível
- Animação de preenchimento
- Ícones representativos
- Feedback visual de disponibilidade

## 🔄 Fluxo de Operação

1. **Selecionar Negócio:** Clique no cartão do negócio
2. **Inserir Valor:** Digite o valor a lavar
3. **Iniciar Operação:** Clique em "Lavar Dinheiro"
4. **Aguardar:** Veja a barra de progresso
5. **Coletar:** Clique em "Coletar Recompensa" quando pronto
6. **Resultado:** Sucesso ou falha com feedback

## 💾 Persistência

### Dados Salvos
- Operações ativas e concluídas
- Upgrades do jogador
- Data da última operação
- Dinheiro sujo/limpo

### Sincronização
- Banco de dados de jogadores
- Zustand store local
- Sincronização automática

## 🎮 Integração com Outros Sistemas

### Inteligência
- Reduz chance de falha em operações
- 1% redução por nível

### Respeito
- Desbloqueia novos negócios
- Necessário para acessar operações mais lucrativas

### Vigor
- Não afeta diretamente (sistema anterior)
- Pode ser integrado para bônus de velocidade

## 📊 Estatísticas

### Lucro Potencial Diário
- **Mínimo (1 op/dia, Lava Rápido):** ~$722
- **Máximo (11 ops/dia, Empresa Fantasma com upgrades):** ~$18.700+

### Tempo de Retorno de Investimento
- **Redução de Taxa (25 níveis):** ~173 dias (1 op/dia)
- **Bônus de Conversão (50 níveis):** ~50 dias (1 op/dia)
- **Operações por Dia (10 níveis):** ~10 dias (1 op/dia)

## 🚀 Futuras Melhorias

- [ ] Sistema de eventos aleatórios
- [ ] Negócios sazonais
- [ ] Competição com outros jogadores
- [ ] Missões especiais
- [ ] Animações 3D dos negócios
- [ ] Sistema de reputação por negócio
- [ ] Bônus por série de sucessos

## 🐛 Troubleshooting

### Operação não inicia
- Verifique se tem dinheiro sujo suficiente
- Verifique se atingiu o limite diário
- Verifique se o negócio está desbloqueado

### Upgrades não funcionam
- Verifique se tem dinheiro sujo suficiente
- Verifique se atingiu o nível máximo
- Recarregue a página

### Dados não salvam
- Verifique conexão com internet
- Limpe cache do navegador
- Verifique permissões de armazenamento local
