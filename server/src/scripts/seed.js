/**
 * npm run seed            → creates the site settings (verified info only) and the admin account
 * npm run seed:samples    → also inserts clearly-labelled SAMPLE listings for previewing the design
 * npm run remove:samples  → deletes all sample listings
 */
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { config } from '../config.js';
import { connectDB } from '../db.js';
import { User } from '../models/User.js';
import { Property } from '../models/Property.js';
import { getSettings } from '../services/settings.js';
import { createProperty, pickProperty } from '../services/properties.js';
import { SAMPLE_PROPERTIES } from '../data/samples.js';

const args = new Set(process.argv.slice(2));

async function run() {
  await connectDB();

  if (args.has('--remove-samples')) {
    const { deletedCount } = await Property.deleteMany({ isSample: true });
    console.log(`[seed] removed ${deletedCount} sample listing(s)`);
    return;
  }

  await getSettings(); // creates the settings document from verified defaults if missing
  console.log('[seed] site settings ready');

  const email = (process.env.ADMIN_EMAIL || 'admin@premhousing.local').trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (!existing) {
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
    const user = new User({ email, name: 'Site Admin' });
    await user.setPassword(password);
    await user.save();
    console.log('[seed] admin account created');
    console.log(`       email:    ${email}`);
    console.log(`       password: ${process.env.ADMIN_PASSWORD ? '(from ADMIN_PASSWORD in server/.env)' : password}`);
    console.log('       Sign in at /admin and change the password from the Account page.');
  } else if (args.has('--reset-admin') && process.env.ADMIN_PASSWORD) {
    await existing.setPassword(process.env.ADMIN_PASSWORD);
    existing.tokenVersion += 1;
    await existing.save();
    console.log(`[seed] admin password reset from ADMIN_PASSWORD for ${email}`);
  } else {
    console.log(`[seed] admin account already exists (${email})`);
  }

  if (args.has('--samples')) {
    const count = await Property.countDocuments({ isSample: true });
    if (count) {
      console.log(`[seed] ${count} sample listing(s) already exist — skipped`);
    } else {
      for (const sample of SAMPLE_PROPERTIES) {
        await createProperty({ ...pickProperty({ ...sample, isSample: true }) });
      }
      console.log(`[seed] inserted ${SAMPLE_PROPERTIES.length} SAMPLE listings (marked "Sample" on the website)`);
    }
  }
}

run()
  .catch((err) => {
    console.error(`[seed] failed: ${err.message}`);
    if (/ECONNREFUSED|Server selection/i.test(err.message)) {
      console.error(`       Is MongoDB running at ${config.mongoUri}?`);
    }
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
