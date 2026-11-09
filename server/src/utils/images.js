import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { config } from '../config.js';

sharp.concurrency(2);

// On Vercel (or whenever a Blob token is set) photos go to Vercel Blob storage;
// otherwise they are written to server/uploads on the local disk.
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const BLOB_URL = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^\s"'<>]+$/i;

function isOurUrl(url) {
  return typeof url === 'string' && ((url.startsWith('/uploads/') && !url.includes('..')) || BLOB_URL.test(url));
}

async function store(relPath, data) {
  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${relPath}`, data, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return blob.url;
  }
  const abs = path.join(config.uploadsDir, relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, data);
  return `/uploads/${relPath}`;
}

/**
 * Converts an uploaded image to optimised WebP (full size + thumbnail).
 * EXIF data (including GPS location) is stripped automatically.
 */
export async function processImage(buffer) {
  const now = new Date();
  const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  const id = crypto.randomBytes(9).toString('base64url');
  const source = sharp(buffer, { failOn: 'error', limitInputPixels: 80_000_000 }).rotate();

  const full = await source
    .clone()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  const thumb = await source
    .clone()
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72, effort: 4 })
    .toBuffer();

  const [url, thumbUrl] = await Promise.all([store(`${folder}/${id}.webp`, full.data), store(`${folder}/${id}-t.webp`, thumb)]);
  return { url, thumb: thumbUrl, width: full.info.width, height: full.info.height };
}

/** Deletes the files behind image objects ({ url, thumb }). Only touches our own storage. */
export async function removeImageFiles(images = []) {
  const urls = images.flatMap((img) => [img?.url, img?.thumb]).filter(isOurUrl);
  const blobs = urls.filter((u) => BLOB_URL.test(u));
  if (blobs.length && useBlob) {
    const { del } = await import('@vercel/blob');
    await del(blobs).catch(() => {});
  }
  const root = path.resolve(config.uploadsDir);
  await Promise.all(
    urls
      .filter((u) => u.startsWith('/uploads/'))
      .map((u) => {
        const abs = path.resolve(root, u.slice('/uploads/'.length));
        return abs.startsWith(root + path.sep) ? fs.unlink(abs).catch(() => {}) : null;
      }),
  );
}

/** Keeps only image objects that point to our own storage. */
export function cleanImages(list, max = 20) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((img) => img && isOurUrl(img.url))
    .slice(0, max)
    .map((img) => ({
      url: img.url.slice(0, 300),
      thumb: isOurUrl(img.thumb) ? img.thumb.slice(0, 300) : '',
      width: Number.isFinite(+img.width) ? +img.width : null,
      height: Number.isFinite(+img.height) ? +img.height : null,
      alt: typeof img.alt === 'string' ? img.alt.trim().slice(0, 160) : '',
    }));
}

export function cleanImage(img) {
  return cleanImages(img ? [img] : [], 1)[0] || null;
}
