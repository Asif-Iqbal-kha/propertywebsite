export const TYPE_LABELS = {
  'residential-plot': 'Residential Plot',
  'commercial-plot': 'Commercial Plot',
  house: 'House',
  apartment: 'Apartment',
  shop: 'Shop / Office',
  'plot-file': 'Plot File',
};

export const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

export const STATUS_LABELS = { available: 'Available', booked: 'Booked', sold: 'Sold' };

export const FREQUENCY_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', 'half-yearly': 'Half-yearly' };

export const SIZE_OPTIONS = [
  { value: '3-marla', label: '3 Marla' },
  { value: '4-marla', label: '4 Marla' },
  { value: '5-marla', label: '5 Marla' },
  { value: '6-marla', label: '6 Marla' },
  { value: '7-marla', label: '7 Marla' },
  { value: '8-marla', label: '8 Marla' },
  { value: '10-marla', label: '10 Marla' },
  { value: '12-marla', label: '12 Marla' },
  { value: '1-kanal', label: '1 Kanal' },
  { value: '2-kanal', label: '2 Kanal' },
];

export const BUDGET_OPTIONS = [
  { value: '1000000', label: '10 Lakh' },
  { value: '2500000', label: '25 Lakh' },
  { value: '5000000', label: '50 Lakh' },
  { value: '7500000', label: '75 Lakh' },
  { value: '10000000', label: '1 Crore' },
  { value: '15000000', label: '1.5 Crore' },
  { value: '20000000', label: '2 Crore' },
  { value: '30000000', label: '3 Crore' },
  { value: '50000000', label: '5 Crore' },
];

export const FEATURE_PRESETS = [
  'Corner',
  'Park Facing',
  'Main Boulevard',
  'Main Road',
  'Possession',
  'Balloted',
  'Non-Balloted',
  'Developed',
  'Electricity',
  'Sui Gas',
  'Water Supply',
  'Sewerage',
  'Boundary Wall',
  'Near Mosque',
  'Near Commercial',
];

const trim = (n) => String(Math.round(n * 100) / 100);

/** PKR in the Pakistani Lakh / Crore convention. */
export function formatPKR(amount, { short = false } = {}) {
  if (amount === null || amount === undefined || amount === '') return 'Price on request';
  const n = Number(amount);
  if (!Number.isFinite(n)) return 'Price on request';
  const prefix = short ? '' : 'PKR ';
  if (n >= 1e7) return `${prefix}${trim(n / 1e7)} Crore`;
  if (n >= 1e5) return `${prefix}${trim(n / 1e5)} Lakh`;
  return `${prefix}${Math.round(n).toLocaleString('en-PK')}`;
}

export function formatPrice(property) {
  const base = formatPKR(property?.price);
  return property?.purpose === 'rent' && property?.price != null ? `${base} / month` : base;
}

/** Full rupee amount with thousands separators, e.g. "Rs 1,250,000". */
export function formatRupees(amount) {
  if (amount === null || amount === undefined || amount === '' || !Number.isFinite(Number(amount))) return '—';
  return `Rs ${Math.round(Number(amount)).toLocaleString('en-PK')}`;
}

export function areaLabel(area) {
  if (!area?.value) return '';
  const unit = area.unit === 'kanal' ? 'Kanal' : area.unit === 'sqft' ? 'Sq. Ft.' : 'Marla';
  return `${trim(area.value)} ${unit}`;
}

export function locationLine(property, city = '') {
  const l = property?.location || {};
  return [l.plotNo && `Plot ${l.plotNo}`, l.street, l.block, l.phase].filter(Boolean).join(', ') || city;
}

export function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  const units = [
    [60, 'minute'],
    [3600, 'hour'],
    [86400, 'day'],
    [604800, 'week'],
    [2629800, 'month'],
    [31557600, 'year'],
  ];
  let label = '';
  for (let i = units.length - 1; i >= 0; i -= 1) {
    const [secs, name] = units[i];
    if (diff >= secs) {
      const v = Math.floor(diff / secs);
      label = `${v} ${name}${v > 1 ? 's' : ''} ago`;
      break;
    }
  }
  return label;
}

export function formatDate(date, withTime = false) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
