import { Link } from 'react-router';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo.jsx';
import { NAV_LINKS } from './Navbar.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { mapsLink, telHref, waHref } from '../lib/contact.js';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from './BrandIcons.jsx';

const SOCIALS = [
  ['facebook', FacebookIcon, 'Facebook'],
  ['instagram', InstagramIcon, 'Instagram'],
  ['youtube', YouTubeIcon, 'YouTube'],
  ['tiktok', TikTokIcon, 'TikTok'],
];

export default function Footer() {
  const { business } = useSettings();
  const socials = SOCIALS.filter(([key]) => /^https?:\/\//.test(business.socials?.[key] || ''));
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink-950 pb-24 text-white/70 md:pb-0">
      <div className="pointer-events-none absolute inset-0 bg-glow opacity-60" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
            {business.tagline}. Contact the site office directly for current availability, prices and documentation.
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(([key, Cmp, label]) => (
                <a key={key} href={business.socials[key]} target="_blank" rel="noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-gold-400 hover:text-gold-300">
                  <Cmp className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 lg:col-start-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-300">Explore</h3>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 lg:col-span-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-300">Site Office</h3>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a href={telHref(business.phone)} className="group flex items-center gap-3 transition hover:text-white">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-gold-300 group-hover:bg-gold-500 group-hover:text-ink-950">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="text-base font-semibold text-white">{business.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a href={waHref(business.whatsapp)} target="_blank" rel="noreferrer" className="group flex items-center gap-3 transition hover:text-white">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-[#3ad07a] group-hover:bg-[#1fa855] group-hover:text-white">
                  <WhatsAppIcon className="h-4 w-4" />
                </span>
                Chat on WhatsApp
              </a>
            </li>
            <li>
              <a href={mapsLink(business.address || business.mapQuery)} target="_blank" rel="noreferrer" className="group flex items-start gap-3 transition hover:text-white">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-gold-300">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="pt-2">{[business.address, business.city].filter(Boolean).join(', ')}</span>
              </a>
            </li>
            {business.email && (
              <li>
                <a href={`mailto:${business.email}`} className="group flex items-center gap-3 transition hover:text-white">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-gold-300">
                    <Mail className="h-4 w-4" />
                  </span>
                  {business.email}
                </a>
              </li>
            )}
            {business.officeHours && (
              <li className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-gold-300">
                  <Clock className="h-4 w-4" />
                </span>
                {business.officeHours}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/45 sm:flex-row">
          <p>
            © {year} {business.name} {business.officeName}. All rights reserved.
          </p>
          <Link to="/admin" className="transition hover:text-gold-300" rel="nofollow">
            Office login
          </Link>
        </div>
      </div>
    </footer>
  );
}
