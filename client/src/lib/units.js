/**
 * Area units used in Pakistani real estate.
 * The size of one Marla is not the same everywhere, so the converter lets the
 * visitor choose the standard; 1 Kanal is always 20 Marla.
 */
export const MARLA_STANDARDS = [
  { value: 225, label: '1 Marla = 225 sq ft' },
  { value: 250, label: '1 Marla = 250 sq ft' },
  { value: 272.25, label: '1 Marla = 272.25 sq ft' },
];

export const AREA_UNITS = [
  { value: 'marla', label: 'Marla' },
  { value: 'kanal', label: 'Kanal' },
  { value: 'sqft', label: 'Square feet' },
  { value: 'sqyd', label: 'Square yards' },
  { value: 'sqm', label: 'Square metres' },
  { value: 'acre', label: 'Acre' },
];

const SQFT_PER = {
  sqft: () => 1,
  sqyd: () => 9,
  sqm: () => 10.7639104,
  acre: () => 43560,
  marla: (m) => m,
  kanal: (m) => m * 20,
};

export function convertArea(value, from, marlaSqft) {
  const v = Number(value);
  if (!Number.isFinite(v) || v < 0) return null;
  const sqft = v * SQFT_PER[from](marlaSqft);
  return Object.fromEntries(AREA_UNITS.map((u) => [u.value, sqft / SQFT_PER[u.value](marlaSqft)]));
}

export function formatNumber(n, max = 2) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-PK', { maximumFractionDigits: n < 1 ? 4 : max });
}
