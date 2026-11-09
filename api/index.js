// Vercel serverless entry: the whole Express API runs as one function.
import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/db.js';

const app = createApp();

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('[db]', err.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database unavailable. Please try again shortly.' }));
    return;
  }
  return app(req, res);
}
