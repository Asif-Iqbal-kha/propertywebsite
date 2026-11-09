import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { mapsEmbed, mapsLink } from '../lib/contact.js';

/**
 * Google Map that loads only when the visitor asks for it — keeps pages fast
 * (the embedded map alone is heavier than this whole website).
 */
export default function MapEmbed({ query, label, className = 'h-[380px]' }) {
  const [active, setActive] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] border border-ink-900/10 bg-ink-900 ${className}`}>
      {active ? (
        <iframe title={`Map of ${label || query}`} src={mapsEmbed(query)} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-faint opacity-80 [mask-image:none]" />
          <div className="absolute inset-0 bg-glow" />
          <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 400 300" aria-hidden="true">
            <path d="M-10 210 C 80 180, 140 240, 220 190 S 340 120, 420 150" fill="none" stroke="#c59a3d" strokeWidth="5" strokeOpacity=".5" />
            <path d="M120 -10 C 140 80, 100 160, 160 320" fill="none" stroke="#9aa3ba" strokeWidth="3" strokeOpacity=".35" />
            <path d="M-10 80 L 420 60" fill="none" stroke="#9aa3ba" strokeWidth="2" strokeOpacity=".25" />
          </svg>
          <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950 shadow-[0_0_0_10px_rgba(197,154,61,.15)]">
              <MapPin className="h-7 w-7" />
            </span>
            <p className="font-display text-2xl">{label || query}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => setActive(true)} className="btn btn-gold btn-sm">
                Show map
              </button>
              <a href={mapsLink(query)} target="_blank" rel="noreferrer" className="btn btn-glass btn-sm">
                <Navigation className="h-4 w-4" /> Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
