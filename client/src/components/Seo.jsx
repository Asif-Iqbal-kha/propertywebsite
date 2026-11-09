import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, key, name] = /\[(\w+)="([^"]+)"\]/.exec(selector) || [];
    if (key) el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/** Updates the document title / description on client-side navigation. */
export default function Seo({ title, description, noindex = false }) {
  const { business, seo } = useSettings();
  const brand = [business.name, business.officeName].filter(Boolean).join(' ');

  useEffect(() => {
    document.title = title ? `${title} | ${brand}` : seo.title || brand;
    const desc = description || seo.description;
    if (desc) {
      setMeta('meta[name="description"]', 'content', desc);
      setMeta('meta[property="og:description"]', 'content', desc);
    }
    setMeta('meta[property="og:title"]', 'content', document.title);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, noindex, brand, seo.title, seo.description]);

  return null;
}
