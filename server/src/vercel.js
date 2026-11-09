// Entry point for the "server" service on Vercel (framework: express).
// Exports the Express app; the database connection is opened once and reused.
import express from 'express';
import { createApp } from './app.js';
import { connectDB } from './db.js';

const app = express();

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[db]', err.message);
    res.status(503).json({ error: 'Database unavailable. Please try again shortly.' });
  }
});

app.use(createApp());

export default app;
