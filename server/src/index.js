import mongoose from 'mongoose';
import { config } from './config.js';
import { connectDB } from './db.js';
import { createApp } from './app.js';

const MAX_ATTEMPTS = 10;

async function connectWithRetry() {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await connectDB();
      return;
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS) {
        console.error(`\n[db] Could not connect to MongoDB at ${config.mongoUri}`);
        console.error('     Start the database with "npm run db" (portable MongoDB), or set MONGODB_URI in server/.env.\n');
        console.error(`     ${err.message}\n`);
        process.exit(1);
      }
      console.warn(`[db] not reachable yet (attempt ${attempt}/${MAX_ATTEMPTS}) — retrying in 3 seconds…`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

async function main() {
  await connectWithRetry();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[api] ready on http://localhost:${config.port} (${config.isProd ? 'production' : 'development'})`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received — shutting down`);
    server.close();
    await mongoose.disconnect().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
