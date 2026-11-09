export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Trimmed string, capped to `max` characters. Non-strings become ''. */
export function str(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Finite number or null (empty strings become null). */
export function num(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/\p{M}/gu, '') // strip accents (combining marks)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/g, '') || 'property'
  );
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/** JSON that is safe to embed inside an HTML <script> tag. */
export function safeJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replaceAll(LINE_SEPARATOR, '\\u2028')
    .replaceAll(PARAGRAPH_SEPARATOR, '\\u2029');
}

const trimNumber = (n) => String(Math.round(n * 100) / 100);

/** PKR in the Pakistani Lakh / Crore convention. */
export function formatPKR(amount) {
  if (amount === null || amount === undefined) return 'Price on request';
  if (amount >= 1e7) return `PKR ${trimNumber(amount / 1e7)} Crore`;
  if (amount >= 1e5) return `PKR ${trimNumber(amount / 1e5)} Lakh`;
  return `PKR ${Math.round(amount).toLocaleString('en-US')}`;
}

export const TYPE_LABELS = {
  'residential-plot': 'Residential Plot',
  'commercial-plot': 'Commercial Plot',
  house: 'House',
  apartment: 'Apartment',
  shop: 'Shop / Office',
  'plot-file': 'Plot File',
};

export function areaLabel(area) {
  if (!area?.value) return '';
  const unit = area.unit === 'kanal' ? 'Kanal' : area.unit === 'sqft' ? 'Sq. Ft.' : 'Marla';
  return `${trimNumber(area.value)} ${unit}`;
}
