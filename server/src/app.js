import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { apiNotFound, errorHandler } from './middleware/errors.js';
import { hasClientBuild, renderIndex, renderRobots, renderSitemap } from './services/html.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'https://*.public.blob.vercel-storage.com'],
          'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com'],
          'upgrade-insecure-requests': null,
        },
      },
      crossOriginResourcePolicy: { policy: config.clientOrigins.length ? 'cross-origin' : 'same-origin' },
    }),
  );
  app.use(compression());

  if (config.clientOrigins.length) {
    app.use('/api', cors({ origin: config.clientOrigins, credentials: true }));
  }

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Uploaded photos have unique file names, so they can be cached "forever".
  app.use('/uploads', express.static(config.uploadsDir, { maxAge: '365d', immutable: true, fallthrough: false }));

  app.use(
    '/api',
    rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many requests. Please slow down.' } }),
  );
  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', publicRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', apiNotFound);

  app.get('/robots.txt', (req, res) => res.type('text/plain').send(renderRobots()));
  app.get('/sitemap.xml', async (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.type('application/xml').send(await renderSitemap());
  });

  if (hasClientBuild()) {
    // Hashed build assets: immutable for a year. Other public files: 1 hour.
    app.use('/assets', express.static(path.join(config.clientDist, 'assets'), { maxAge: '365d', immutable: true, fallthrough: false }));
    app.use(express.static(config.clientDist, { index: false, maxAge: '1h' }));

    // Single-page app: every other GET returns index.html with SEO tags + settings embedded.
    app.use(async (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      const { html, status } = await renderIndex(req);
      res.status(status).set('Cache-Control', 'no-cache').type('html').send(html);
    });
  } else {
    app.get('/', (req, res) =>
      res.type('text/plain').send('Prem Housing API is running.\nIn development open http://localhost:5173 — or run "npm run build" to serve the website from here.'),
    );
  }

  app.use(errorHandler);
  return app;
}
