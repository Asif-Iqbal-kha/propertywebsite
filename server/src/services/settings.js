import { Setting, SETTING_SECTIONS } from '../models/Setting.js';
import { SITE_DEFAULTS } from '../data/defaults.js';
import { cleanImage, removeImageFiles } from '../utils/images.js';

// Serverless instances don't share memory, so the cache also expires after 60 s.
let cached = null;
let cachedAt = 0;

function toPublic(doc) {
  // eslint-disable-next-line no-unused-vars
  const { _id, key, createdAt, ...rest } = doc;
  return rest;
}

/** Site settings (cached in memory; created from verified defaults on first use). */
export async function getSettings() {
  if (cached && Date.now() - cachedAt < 60_000) return cached;
  let doc = await Setting.findOne({ key: 'site' }).lean();
  if (!doc) {
    try {
      await Setting.create({ key: 'site', ...SITE_DEFAULTS });
    } catch (err) {
      if (err?.code !== 11000) throw err;
    }
    doc = await Setting.findOne({ key: 'site' }).lean();
  }
  cached = toPublic(doc);
  cachedAt = Date.now();
  return cached;
}

export function clearSettingsCache() {
  cached = null;
}

export async function updateSettings(input = {}) {
  const previous = await getSettings();
  const $set = {};
  for (const section of SETTING_SECTIONS) {
    const value = input[section];
    if (value && typeof value === 'object' && !Array.isArray(value)) $set[section] = value;
  }
  if ($set.hero) $set.hero = { ...$set.hero, image: cleanImage($set.hero.image) };
  if ($set.society) $set.society = { ...$set.society, masterPlan: cleanImage($set.society.masterPlan) };

  await Setting.findOneAndUpdate({ key: 'site' }, { $set }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  clearSettingsCache();
  const next = await getSettings();

  const stillUsed = new Set([next.hero?.image?.url, next.society?.masterPlan?.url].filter(Boolean));
  const replaced = [previous.hero?.image, previous.society?.masterPlan].filter((img) => img?.url && !stillUsed.has(img.url));
  await removeImageFiles(replaced);

  return next;
}
