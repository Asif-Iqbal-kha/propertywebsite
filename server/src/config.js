import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_ROOT = path.resolve(__dirname, '..');

// Load server/.env if present (Node >= 20.12). Real environment variables take precedence.
try {
  process.loadEnvFile(path.join(SERVER_ROOT, '.env'));
} catch {
  /* .env is optional */
}

const env = process.env;
const isProd = env.NODE_ENV === 'production';

let jwtSecret = env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) throw new Error('JWT_SECRET must be set in production.');
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn('[config] JWT_SECRET is not set — using a temporary secret (admin sessions reset on restart).');
}

const port = Number(env.PORT) || 5000;

export const config = {
  isProd,
  port,
  mongoUri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prem_housing',
  jwtSecret,
  siteUrl: (env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : `http://localhost:${port}`)).replace(/\/+$/, ''),
  // Only needed when the React app is hosted on a different domain than this API.
  clientOrigins: (env.CLIENT_ORIGIN || '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  trustProxy: env.TRUST_PROXY === 'true' || Boolean(env.VERCEL),
  uploadsDir: path.join(SERVER_ROOT, 'uploads'),
  clientDist: path.resolve(SERVER_ROOT, '..', 'client', 'dist'),
};
