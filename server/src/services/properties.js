import { Property, PROPERTY_TYPES, PURPOSES, STATUSES, FREQUENCIES, AREA_UNITS } from '../models/Property.js';
import { Counter } from '../models/Counter.js';
import { cleanImages } from '../utils/images.js';
import { escapeRegex, num, slugify, str } from '../utils/helpers.js';

const SORTS = {
  recommended: { featured: -1, createdAt: -1, _id: -1 },
  newest: { createdAt: -1, _id: -1 },
  'price-asc': { _hasPrice: -1, price: 1, _id: -1 },
  'price-desc': { _hasPrice: -1, price: -1, _id: -1 },
  'size-asc': { areaMarla: 1, _id: -1 },
  'size-desc': { areaMarla: -1, _id: -1 },
};

/** "5-marla" → 5, "1-kanal" → 20 (normalised to Marla). */
export function parseSize(value) {
  const match = /^(\d+(?:\.\d+)?)-(marla|kanal)$/.exec(String(value || ''));
  if (!match) return null;
  const n = Number(match[1]);
  return match[2] === 'kanal' ? n * 20 : n;
}

export function buildFilter(query, { admin = false } = {}) {
  const filter = {};
  const status = String(query.status || '');

  if (STATUSES.includes(status)) filter.status = status;
  else if (!admin && status !== 'all') filter.status = { $in: ['available', 'booked'] };

  if (PURPOSES.includes(query.purpose)) filter.purpose = query.purpose;
  if (PROPERTY_TYPES.includes(query.type)) filter.type = query.type;

  const size = parseSize(query.size);
  if (size) filter.areaMarla = size;

  const min = num(query.minPrice);
  const max = num(query.maxPrice);
  if (min !== null || max !== null) {
    filter.price = {};
    if (min !== null) filter.price.$gte = min;
    if (max !== null) filter.price.$lte = max;
  }

  if (query.featured === 'true') filter.featured = true;
  if (query.block) filter['location.block'] = new RegExp(`^${escapeRegex(str(query.block, 60))}$`, 'i');

  const q = str(query.q, 60);
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [
      { title: rx },
      { ref: rx },
      { 'location.block': rx },
      { 'location.phase': rx },
      { 'location.address': rx },
      { features: rx },
    ];
  }
  return filter;
}

export async function listProperties(query, { admin = false, maxLimit = 24 } = {}) {
  const filter = buildFilter(query, { admin });
  const sortKey = Object.hasOwn(SORTS, query.sort) ? query.sort : admin ? 'newest' : 'recommended';
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), maxLimit);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);

  const [result] = await Property.aggregate([
    { $match: filter },
    { $addFields: { _hasPrice: { $cond: [{ $gt: ['$price', null] }, 1, 0] } } },
    { $sort: SORTS[sortKey] },
    {
      $facet: {
        items: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $set: { images: { $slice: ['$images', 1] } } },
          { $unset: ['description', '_hasPrice'] },
        ],
        total: [{ $count: 'n' }],
      },
    },
  ]);

  const total = result?.total?.[0]?.n || 0;
  return { items: result?.items || [], total, page, pages: Math.max(Math.ceil(total / limit), 1), limit };
}

/** Whitelists and normalises property fields coming from the admin form. */
export function pickProperty(body = {}) {
  const area = body.area || {};
  const inst = body.installment || {};
  const loc = body.location || {};
  const features = Array.isArray(body.features)
    ? [...new Set(body.features.map((f) => str(f, 40)).filter(Boolean))].slice(0, 30)
    : [];

  return {
    title: str(body.title, 140),
    purpose: PURPOSES.includes(body.purpose) ? body.purpose : 'sale',
    type: PROPERTY_TYPES.includes(body.type) ? body.type : undefined,
    area: { value: num(area.value), unit: AREA_UNITS.includes(area.unit) ? area.unit : 'marla' },
    price: num(body.price),
    installment: {
      available: Boolean(inst.available),
      downPayment: num(inst.downPayment),
      amount: num(inst.amount),
      count: num(inst.count),
      frequency: FREQUENCIES.includes(inst.frequency) ? inst.frequency : 'monthly',
    },
    location: {
      block: str(loc.block, 60),
      phase: str(loc.phase, 60),
      street: str(loc.street, 60),
      plotNo: str(loc.plotNo, 30),
      address: str(loc.address, 200),
    },
    bedrooms: num(body.bedrooms),
    bathrooms: num(body.bathrooms),
    features,
    description: str(body.description, 5000),
    images: cleanImages(body.images, 20),
    status: STATUSES.includes(body.status) ? body.status : 'available',
    featured: Boolean(body.featured),
    isSample: Boolean(body.isSample),
  };
}

export async function createProperty(data) {
  const seq = await Counter.next('property');
  const ref = `PH-${1000 + seq}`;
  const doc = new Property({ ...data, ref, slug: `${slugify(data.title)}-${ref.toLowerCase()}` });
  await doc.save();
  return doc;
}
