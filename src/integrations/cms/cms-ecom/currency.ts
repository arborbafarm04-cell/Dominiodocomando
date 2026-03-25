import { useState, useEffect } from 'react';

export const DEFAULT_CURRENCY = 'USD';

export function useCurrency() {
  const [currency, setCurrency] = useState<string | null>(null);

  useEffect(() => {
    // In production, this would fetch from Wix Business Manager
    // For now, default to USD
    setCurrency(DEFAULT_CURRENCY);
  }, []);

  return { currency };
}

export function formatPrice(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  });
  return formatter.format(amount);
}
