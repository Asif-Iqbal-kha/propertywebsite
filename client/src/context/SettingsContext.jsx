import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

/** Minimal verified fallback, used only until the real settings arrive. */
const FALLBACK = {
  business: {
    name: 'Prem Housing',
    officeName: 'Site Office',
    tagline: 'Property Site Office · Mardan',
    phone: '+923429423521',
    phoneDisplay: '+92 342 9423521',
    whatsapp: '923429423521',
    email: '',
    address: '',
    city: 'Mardan, Khyber Pakhtunkhwa',
    officeHours: '',
    mapQuery: 'Mardan, Khyber Pakhtunkhwa, Pakistan',
    socials: {},
  },
  hero: { eyebrow: '', title: '', highlight: '', subtitle: '', image: null },
  about: { heading: '', body: '', services: [] },
  society: { overview: '', facts: [], amenities: [], masterPlan: null },
  payment: { intro: '', plans: [], terms: '' },
  city: { heading: '', intro: '', facts: [], sourceNote: '', sourceUrl: '' },
  guide: { heading: '', items: [], sourceNote: '', sourceUrl: '' },
  seo: { title: '', description: '' },
};

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

function merge(base, extra) {
  if (!isObject(extra)) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    out[key] = isObject(value) && isObject(base[key]) ? merge(base[key], value) : value ?? base[key];
  }
  return out;
}

function readEmbedded() {
  try {
    const el = document.getElementById('__SETTINGS__');
    return el ? JSON.parse(el.textContent) : null;
  } catch {
    return null;
  }
}

const SettingsContext = createContext({ settings: FALLBACK, replaceSettings: () => {} });

export function SettingsProvider({ children }) {
  const [embedded] = useState(readEmbedded);
  const [settings, setSettings] = useState(() => merge(FALLBACK, embedded));

  useEffect(() => {
    if (embedded) return; // production: the server already embedded fresh settings in the HTML
    api('/api/settings')
      .then((data) => setSettings(merge(FALLBACK, data)))
      .catch(() => {});
  }, [embedded]);

  const value = useMemo(
    () => ({ settings, replaceSettings: (next) => setSettings(merge(FALLBACK, next)) }),
    [settings],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext).settings;
export const useReplaceSettings = () => useContext(SettingsContext).replaceSettings;
