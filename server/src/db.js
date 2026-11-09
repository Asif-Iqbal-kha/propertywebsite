import mongoose from 'mongoose';
import { config } from './config.js';

let pending = null;

/** Connects once and reuses the connection (important for serverless, where the module stays warm). */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!pending) {
    mongoose.set('strictQuery', true);
    pending = mongoose
      .connect(config.mongoUri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 10 })
      .then(() => {
        const { host, port, name } = mongoose.connection;
        console.log(`[db] connected to mongodb://${host}:${port}/${name}`);
        return mongoose.connection;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}
