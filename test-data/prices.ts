export const PRICE = {
  'Dhaka Topi': 85000,
  'Pashmina Shawl': 450000,
  'Lokta Paper Notebook': 35000,
  'Ilam Orthodox Tea': 60000,
  'Singing Bowl': 220000,
  'Gundruk': 18000,
} as const;

export const DELIVERY = { valley: 10000, outside: 25000 } as const;
export const PROMO_RATE = 0.10; 

export function rs(paisa: number): string {
  const r = Math.floor(paisa / 100);
  const p = String(paisa % 100).padStart(2, '0');
  const s = String(r);
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `Rs ${rest ? rest + ',' : ''}${last3}.${p}`;
}

export const subtotalOf = (lines: [name: keyof typeof PRICE, qty: number][]) =>
  lines.reduce((sum, [name, qty]) => sum + PRICE[name] * qty, 0);

export const discountOf = (subtotal: number) => Math.round(subtotal * PROMO_RATE);