import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Reveal from './Reveal.jsx';

/** Dark banner used at the top of every inner page (keeps the transparent navbar readable). */
export function PageHeader({ eyebrow, title, subtitle, crumbs = [], children }) {
  return (
    <section className="relative overflow-hidden bg-ink-950 pt-32 pb-16 text-white sm:pt-40 sm:pb-20">
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
      <div className="container-x relative">
        <nav aria-label="Breadcrumb" className="animate-fade-up mb-7 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-white/50">
          <Link to="/" className="hover:text-gold-300">
            Home
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              {c.to ? (
                <Link to={c.to} className="hover:text-gold-300">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white/80">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        {eyebrow && (
          <p className="eyebrow eyebrow-light animate-fade-up" style={{ '--d': '60ms' }}>
            {eyebrow}
          </p>
        )}
        <h1 className="animate-fade-up mt-4 max-w-4xl font-display text-[2.4rem] leading-[1.08] sm:text-5xl lg:text-6xl" style={{ '--d': '120ms' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="animate-fade-up mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg" style={{ '--d': '180ms' }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, dark = false, center = false, action }) {
  return (
    <Reveal className={`flex flex-col gap-6 ${center ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'}`}>
      <div className={center ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className={`eyebrow ${dark ? 'eyebrow-light' : ''}`}>{eyebrow}</p>}
        <h2 className={`mt-4 font-display text-[2rem] leading-[1.12] sm:text-4xl lg:text-[2.75rem] ${dark ? 'text-white' : 'text-ink-950'}`}>{title}</h2>
        {subtitle && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? 'text-white/60' : 'text-ink-500'}`}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}

/** Renders text with blank-line-separated paragraphs. */
export function Paragraphs({ text, className = '' }) {
  if (!text) return null;
  return (
    <div className={`prose-lite ${className}`}>
      {String(text)
        .split(/\n{2,}/)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageFallback() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-ivory">
      <Spinner className="h-8 w-8 text-gold-500" />
    </div>
  );
}
