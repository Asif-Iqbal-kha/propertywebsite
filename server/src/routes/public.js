import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { Property } from '../models/Property.js';
import { Inquiry, INQUIRY_KINDS } from '../models/Inquiry.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { getSettings } from '../services/settings.js';
import { listProperties } from '../services/properties.js';
import { HttpError, str } from '../utils/helpers.js';

const router = Router();

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages from this device. Please call the site office instead, or try again later.' },
});

router.get('/settings', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json(await getSettings());
});

router.get('/properties', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=20');
  res.json(await listProperties(req.query));
});

router.get('/properties/facets', async (req, res) => {
  const match = { $match: { status: { $in: ['available', 'booked'] } } };
  const [types, sizes, purposes] = await Promise.all([
    Property.aggregate([match, { $group: { _id: '$type', n: { $sum: 1 } } }]),
    Property.aggregate([match, { $group: { _id: '$areaMarla', n: { $sum: 1 } } }]),
    Property.aggregate([match, { $group: { _id: '$purpose', n: { $sum: 1 } } }]),
  ]);
  const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.n]));
  res.set('Cache-Control', 'public, max-age=30');
  res.json({
    types: toMap(types),
    sizes: toMap(sizes),
    purposes: toMap(purposes),
    total: purposes.reduce((sum, r) => sum + r.n, 0),
  });
});

router.get('/properties/:slug', async (req, res) => {
  const slug = str(req.params.slug, 120);
  const property = await Property.findOne({ slug }).lean();
  if (!property) throw new HttpError(404, 'This property could not be found.');

  Property.updateOne({ _id: property._id }, { $inc: { views: 1 } }).catch(() => {});

  const similar = await Property.aggregate([
    { $match: { _id: { $ne: property._id }, type: property.type, purpose: property.purpose, status: { $in: ['available', 'booked'] } } },
    { $addFields: { _distance: { $abs: { $subtract: ['$areaMarla', property.areaMarla || 0] } } } },
    { $sort: { _distance: 1, featured: -1, createdAt: -1 } },
    { $limit: 3 },
    { $set: { images: { $slice: ['$images', 1] } } },
    { $unset: ['description', '_distance'] },
  ]);

  res.set('Cache-Control', 'public, max-age=20');
  res.json({ property, similar });
});

router.get('/gallery', async (req, res) => {
  const items = await GalleryItem.find().sort({ order: 1, createdAt: -1 }).limit(300).lean();
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ items });
});

router.post('/inquiries', inquiryLimiter, async (req, res) => {
  const body = req.body || {};

  // Honeypot: real visitors never fill this hidden field.
  if (str(body.website, 100)) return res.status(201).json({ ok: true });

  const name = str(body.name, 80);
  const phone = str(body.phone, 30);
  const email = str(body.email, 120);
  if (name.length < 2) throw new HttpError(400, 'Please enter your name.');
  if (!/^\+?[\d\s()-]{7,20}$/.test(phone)) throw new HttpError(400, 'Please enter a valid phone number.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email address.');

  const kind = INQUIRY_KINDS.includes(body.kind) ? body.kind : 'general';
  let visitDate = null;
  if (kind === 'visit' && body.visitDate) {
    const d = new Date(String(body.visitDate));
    if (!Number.isNaN(d.getTime())) visitDate = d;
  }

  let property = null;
  if (body.propertyId && mongoose.isValidObjectId(body.propertyId)) {
    property = await Property.findById(body.propertyId).select('title ref slug').lean();
  }

  await Inquiry.create({
    name,
    phone,
    email,
    message: str(body.message, 2000),
    kind: property && kind === 'general' ? 'property' : kind,
    visitDate,
    preferredContact: body.preferredContact === 'whatsapp' ? 'whatsapp' : 'call',
    property: property?._id || null,
    propertyTitle: property?.title || '',
    propertyRef: property?.ref || '',
    propertySlug: property?.slug || '',
    page: str(body.page, 200),
  });

  res.status(201).json({ ok: true });
});

export default router;
