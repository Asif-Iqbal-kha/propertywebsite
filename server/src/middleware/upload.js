import multer from 'multer';
import { HttpError } from '../utils/helpers.js';

// HEIC is not listed: the prebuilt image library cannot decode it (phones send JPEG to browsers anyway).
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 12 },
  fileFilter(req, file, cb) {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, 'Only JPG, PNG, WebP, AVIF or GIF images are allowed.'));
  },
}).array('images', 12);
