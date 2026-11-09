import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import { Property, STATUSES } from '../models/Property.js';
import { Inquiry, INQUIRY_STATUSES } from '../models/Inquiry.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { createProperty, listProperties, pickProperty } from '../services/properties.js';
import { updateSettings } from '../services/settings.js';
import { cleanImages, processImage, removeImageFiles } from '../utils/images.js';
import { HttpError, num, str } from '../utils/helpers.js';

const router = Router();
router.use(requireAuth);
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Not found.');
}

/* ---------------------------------- Dashboard ---------------------------------- */

router.get('/stats', async (req, res) => {
  const [statusRows, featured, samples, views, inquiryRows, recentInquiries, recentProperties] = await Promise.all([
    Property.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Property.countDocuments({ featured: true }),
    Property.countDocuments({ isSample: true }),
    Property.aggregate([{ $group: { _id: null, n: { $sum: '$views' } } }]),
    Inquiry.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Inquiry.find().sort({ createdAt: -1 }).limit(6).lean(),
    Property.find().sort({ createdAt: -1 }).limit(5).select('title ref slug price area status images views createdAt isSample').lean(),
  ]);
  const byStatus = Object.fromEntries(statusRows.map((r) => [r._id, r.n]));
  const inquiries = Object.fromEntries(inquiryRows.map((r) => [r._id, r.n]));
  res.json({
    properties: {
      total: statusRows.reduce((s, r) => s + r.n, 0),
      available: byStatus.available || 0,
      booked: byStatus.booked || 0,
      sold: byStatus.sold || 0,
      featured,
      samples,
    },
    views: views[0]?.n || 0,
    inquiries: {
      total: inquiryRows.reduce((s, r) => s + r.n, 0),
      new: inquiries.new || 0,
      contacted: inquiries.contacted || 0,
      closed: inquiries.closed || 0,
    },
    recentInquiries,
    recentProperties: recentProperties.map((p) => ({ ...p, images: p.images.slice(0, 1) })),
  });
});

/* ---------------------------------- Uploads ---------------------------------- */

router.post('/uploads', uploadImages, async (req, res) => {
  const files = req.files || [];
  if (!files.length) throw new HttpError(400, 'Please choose at least one image.');
  const images = [];
  for (const file of files) {
    try {
      images.push(await processImage(file.buffer));
    } catch {
      throw new HttpError(400, `"${file.originalname}" could not be read as an image.`);
    }
  }
  res.status(201).json({ images });
});

/* ---------------------------------- Properties ---------------------------------- */

router.get('/properties', async (req, res) => {
  res.json(await listProperties(req.query, { admin: true, maxLimit: 100 }));
});

router.delete('/properties/samples', async (req, res) => {
  const samples = await Property.find({ isSample: true }).select('images').lean();
  await Property.deleteMany({ isSample: true });
  await removeImageFiles(samples.flatMap((p) => p.images));
  res.json({ removed: samples.length });
});

router.get('/properties/:id', async (req, res) => {
  assertId(req.params.id);
  const property = await Property.findById(req.params.id).lean();
  if (!property) throw new HttpError(404, 'Property not found.');
  res.json({ property });
});

router.post('/properties', async (req, res) => {
  const data = pickProperty(req.body);
  const property = await createProperty(data);
  res.status(201).json({ property });
});

router.put('/properties/:id', async (req, res) => {
  assertId(req.params.id);
  const property = await Property.findById(req.params.id);
  if (!property) throw new HttpError(404, 'Property not found.');
  const previousImages = property.images.map((i) => i.toObject());
  const data = pickProperty(req.body);
  property.set(data);
  await property.save();
  const kept = new Set(data.images.map((i) => i.url));
  await removeImageFiles(previousImages.filter((i) => !kept.has(i.url)));
  res.json({ property });
});

router.patch('/properties/:id', async (req, res) => {
  assertId(req.params.id);
  const update = {};
  if (typeof req.body?.featured === 'boolean') update.featured = req.body.featured;
  if (STATUSES.includes(req.body?.status)) update.status = req.body.status;
  if (!Object.keys(update).length) throw new HttpError(400, 'Nothing to update.');
  const property = await Property.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
  if (!property) throw new HttpError(404, 'Property not found.');
  res.json({ property });
});

router.delete('/properties/:id', async (req, res) => {
  assertId(req.params.id);
  const property = await Property.findByIdAndDelete(req.params.id).lean();
  if (!property) throw new HttpError(404, 'Property not found.');
  await removeImageFiles(property.images);
  res.json({ ok: true });
});

/* ---------------------------------- Inquiries ---------------------------------- */

router.get('/inquiries', async (req, res) => {
  const filter = {};
  if (INQUIRY_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  const q = str(req.query.q, 60);
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { propertyTitle: rx }, { propertyRef: rx }];
  }
  const limit = 20;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const [items, total, counts] = await Promise.all([
    Inquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Inquiry.countDocuments(filter),
    Inquiry.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  res.json({
    items,
    total,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
    counts: Object.fromEntries(counts.map((c) => [c._id, c.n])),
  });
});

router.patch('/inquiries/:id', async (req, res) => {
  assertId(req.params.id);
  const update = {};
  if (INQUIRY_STATUSES.includes(req.body?.status)) update.status = req.body.status;
  if (typeof req.body?.notes === 'string') update.notes = str(req.body.notes, 2000);
  if (!Object.keys(update).length) throw new HttpError(400, 'Nothing to update.');
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
  if (!inquiry) throw new HttpError(404, 'Inquiry not found.');
  res.json({ inquiry });
});

router.delete('/inquiries/:id', async (req, res) => {
  assertId(req.params.id);
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id).lean();
  if (!inquiry) throw new HttpError(404, 'Inquiry not found.');
  res.json({ ok: true });
});

/* ---------------------------------- Settings ---------------------------------- */

router.put('/settings', async (req, res) => {
  res.json(await updateSettings(req.body || {}));
});

/* ---------------------------------- Gallery ---------------------------------- */

router.post('/gallery', async (req, res) => {
  const images = cleanImages(req.body?.images, 30);
  if (!images.length) throw new HttpError(400, 'Please upload at least one image.');
  const category = str(req.body?.category, 40) || 'General';
  const last = await GalleryItem.findOne().sort({ order: -1 }).select('order').lean();
  let order = (last?.order || 0) + 1;
  const items = await GalleryItem.insertMany(
    images.map((img) => ({ url: img.url, thumb: img.thumb, width: img.width, height: img.height, caption: '', category, order: order++ })),
  );
  res.status(201).json({ items });
});

router.patch('/gallery/:id', async (req, res) => {
  assertId(req.params.id);
  const update = {};
  if (typeof req.body?.caption === 'string') update.caption = str(req.body.caption, 160);
  if (typeof req.body?.category === 'string') update.category = str(req.body.category, 40) || 'General';
  if (num(req.body?.order) !== null) update.order = num(req.body.order);
  const item = await GalleryItem.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
  if (!item) throw new HttpError(404, 'Photo not found.');
  res.json({ item });
});

router.delete('/gallery/:id', async (req, res) => {
  assertId(req.params.id);
  const item = await GalleryItem.findByIdAndDelete(req.params.id).lean();
  if (!item) throw new HttpError(404, 'Photo not found.');
  await removeImageFiles([item]);
  res.json({ ok: true });
});

export default router;
