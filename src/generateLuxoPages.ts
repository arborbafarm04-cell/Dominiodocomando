// This script generates the price calculations for Luxo pages 4-100
// Formula: (previous_price * 1.1) + 212.00

const prices: { [key: number]: number } = {
  1: 150.00,
  2: 167.00,
  3: 185.70,
};

// Calculate prices for Luxo 4-100
for (let i = 4; i <= 100; i++) {
  const previousPrice = prices[i - 1];
  prices[i] = (previousPrice * 1.1) + 212.00;
}

// Output prices for verification
console.log('Luxo Prices:');
for (let i = 1; i <= 100; i++) {
  console.log(`Luxo ${i}: R$${prices[i].toFixed(2)}`);
}

export default prices;
