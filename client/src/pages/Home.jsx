import { Link } from 'react-router';
import { ArrowRight, CalendarCheck, ExternalLink, MapPin, Phone, Store, Building2 } from 'lucide-react';
import MasterPlanArt from '../components/MasterPlanArt.jsx';
import SearchPanel from '../components/SearchPanel.jsx';
import PropertyCard, { PropertyCardSkeleton } from '../components/PropertyCard.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import Icon from '../components/Icon.jsx';
import { AreaConverter, InstallmentCalculator } from '../components/Tools.jsx';
import { SectionHeading } from '../components/ui.jsx';
import { WhatsAppIcon } from '../components/BrandIcons.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { mediaUrl, useApi } from '../lib/api.js';
import { telHref, waHref } from '../lib/contact.js';

const SIZE_TILES = [
  { key: '5-marla', label: '5 Marla', marla: 5 },
  { key: '7-marla', label: '7 Marla', marla: 7 },
  { key: '10-marla', label: '10 Marla', marla: 10 },
  { key: '1-kanal', label: '1 Kanal', marla: 20 },
  { key: '2-kanal', label: '2 Kanal', marla: 40 },
];

function SizeGlyph({ marla }) {
  const side = 18 + Math.sqrt(marla) * 6.5;
  const o = (64 - side) / 2;
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
      <rect x="1" y="1" width="62" height="62" rx="14" fill="#ffffff" fillOpacity=".03" stroke="#ffffff" strokeOpacity=".08" />
      <rect x={o} y={o} width={side} height={side} rx="3" className="fill-gold-500/10 stroke-gold-400 transition-all duration-500 group-hover:fill-gold-500/30" strokeWidth="1.4" />
      <rect x={o + 4} y={o + 4} width={side - 8} height={side - 8} rx="2" fill="none" stroke="#e3c77f" strokeOpacity=".4" strokeDasharray="2 3" />
    </svg>
  );
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export default function Home() {
  const { business, hero, society, city, guide } = useSettings();
  const listings = useApi('/api/properties?limit=6&sort=recommended');
  const facets = useApi('/api/properties/facets');
  const items = listings.data?.items || [];
  const total = facets.data?.total || 0;
  const hasSociety = Boolean(society.overview || society.facts?.length || society.amenities?.length || society.masterPlan);
  const brand = [business.name, business.officeName].filter(Boolean).join(' ');

  return (
    <>
      <Seo />

      {/* ------------------------------------------------------------ HERO */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        {hero.image?.url && (
          <>
            <img src={mediaUrl(hero.image.url)} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/40" />
          </>
        )}
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="pointer-events-none absolute inset-0 bg-grid-faint" />

        <div className="container-x relative grid items-center gap-14 pt-32 pb-36 sm:pt-40 lg:grid-cols-12 lg:gap-6 lg:pt-44 lg:pb-48">
          <div className="lg:col-span-6">
            <p className="eyebrow eyebrow-light animate-fade-up">{hero.eyebrow || brand}</p>
            <h1 className="animate-fade-up mt-6 font-display text-[2.85rem] leading-[1.02] font-medium sm:text-6xl lg:text-[4.35rem]" style={{ '--d': '80ms' }}>
              {hero.title}
              <span className="text-gold-gradient block pb-2 italic">{hero.highlight || business.name}</span>
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/65 sm:text-lg" style={{ '--d': '160ms' }}>
              {hero.subtitle}
            </p>
            <div className="animate-fade-up mt-9 flex flex-wrap gap-3" style={{ '--d': '240ms' }}>
              <Link to="/properties" className="btn btn-gold">
                Explore properties <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={telHref(business.phone)} className="btn btn-glass">
                <Phone className="h-4 w-4" /> Call site office
              </a>
            </div>

            <dl className="animate-fade-up mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-8" style={{ '--d': '320ms' }}>
              <div>
                <dt className="sr-only">Dealing</dt>
                <dd className="font-display text-2xl text-gold-300 sm:text-3xl">Direct</dd>
                <dd className="mt-1 text-xs leading-snug text-white/50">Site-office dealing</dd>
              </div>
              <div>
                <dt className="sr-only">Listings</dt>
                <dd className="font-display text-2xl text-gold-300 sm:text-3xl">{total > 0 ? total : '—'}</dd>
                <dd className="mt-1 text-xs leading-snug text-white/50">Live listings</dd>
              </div>
              <div>
                <dt className="sr-only">Location</dt>
                <dd className="font-display text-2xl text-gold-300 sm:text-3xl">Mardan</dd>
                <dd className="mt-1 text-xs leading-snug text-white/50">Khyber Pakhtunkhwa</dd>
              </div>
            </dl>
          </div>

          <div className="animate-fade-up relative mx-auto w-full max-w-[540px] lg:col-span-6" style={{ '--d': '200ms' }}>
            <div className="absolute -inset-8 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="mp-tilt relative">
              <div className="gold-frame p-2 shadow-[0_60px_120px_-40px_rgba(0,0,0,.9)]">
                <MasterPlanArt className="block h-auto w-full rounded-[1.35rem]" />
              </div>
            </div>
            <div className="glass animate-float absolute top-6 -left-2 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950">
                <Building2 className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[0.68rem] font-bold tracking-wider text-white/50 uppercase">{business.name}</span>
                <span className="block text-sm font-semibold">Property Site Office</span>
              </span>
            </div>
            <div className="glass animate-float absolute -right-1 bottom-20 hidden items-center gap-3 rounded-2xl px-4 py-3 [animation-delay:1.6s] sm:flex">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-gold-300">
                <MapPin className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[0.68rem] font-bold tracking-wider text-white/50 uppercase">Location</span>
                <span className="block text-sm font-semibold">Mardan, KP</span>
              </span>
            </div>
            <p className="mt-6 text-center text-[0.62rem] font-bold tracking-[0.32em] text-white/30 uppercase">Illustrative layout</p>
          </div>
        </div>
      </section>

      {/* search overlaps the hero */}
      <div className="relative z-10 -mt-24 lg:-mt-28">
        <div className="container-x">
          <div className="animate-fade-up" style={{ '--d': '380ms' }}>
            <SearchPanel />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- QUICK CONTACT */}
      <section className="bg-ivory pt-10 pb-4">
        <div className="container-x grid gap-4 md:grid-cols-3">
          {[
            { icon: <Phone className="h-5 w-5" />, title: 'Call the site office', text: business.phoneDisplay, href: telHref(business.phone) },
            { icon: <WhatsAppIcon className="h-5 w-5" />, title: 'Chat on WhatsApp', text: 'Ask about availability & prices', href: waHref(business.whatsapp), external: true },
            { icon: <CalendarCheck className="h-5 w-5" />, title: 'Book a site visit', text: 'Choose a day that suits you', to: '/contact?visit=1' },
          ].map((c, i) => {
            const inner = (
              <>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink-950 text-gold-300 transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-gold-300 group-hover:to-gold-600 group-hover:text-ink-950">
                  {c.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink-950">{c.title}</span>
                  <span className="block truncate text-sm text-ink-500">{c.text}</span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gold-600 transition-transform group-hover:translate-x-1" />
              </>
            );
            const cls = 'group card flex items-center gap-4 p-5 transition hover:-translate-y-0.5';
            return (
              <Reveal key={c.title} delay={i * 80}>
                {c.to ? (
                  <Link to={c.to} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <a href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noreferrer' : undefined} className={cls}>
                    {inner}
                  </a>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------ LISTINGS */}
      <section className="bg-ivory py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Listings"
            title="Featured & latest properties"
            subtitle="Plots and homes currently listed by the site office."
            action={
              <Link to="/properties" className="btn btn-light">
                View all properties <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-12">
            {listings.loading && !items.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : items.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <Reveal key={p._id} delay={(i % 3) * 90} className="h-full">
                    <PropertyCard property={p} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal className="card relative overflow-hidden p-8 text-center sm:p-12">
                <div className="mx-auto max-w-xl">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-950 text-gold-300">
                    <Icon name="plot" className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-3xl text-ink-950">New listings are on the way</h3>
                  <p className="mt-3 text-ink-500">Listings on the website are being updated. Call or WhatsApp the site office to hear what is available today.</p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <a href={telHref(business.phone)} className="btn btn-dark">
                      <Phone className="h-4 w-4" /> {business.phoneDisplay}
                    </a>
                    <a href={waHref(business.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                      <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                    </a>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- BROWSE BY SIZE */}
      <section className="relative overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-glow opacity-80" />
        <div className="container-x relative">
          <SectionHeading dark eyebrow="Browse" title="Find the right plot size" subtitle="Explore listings by size, or ask the site office about the size you need." />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {SIZE_TILES.map((t, i) => {
              const n = facets.data?.sizes?.[t.marla] || 0;
              return (
                <Reveal key={t.key} delay={i * 70}>
                  <Link to={`/properties?size=${t.key}`} className="group glass flex h-full flex-col rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-gold-400/50">
                    <SizeGlyph marla={t.marla} />
                    <span className="mt-6 font-display text-2xl">{t.label}</span>
                    <span className="mt-1 text-xs font-semibold text-white/50">{n ? plural(n, 'listing') : 'Ask the office'}</span>
                  </Link>
                </Reveal>
              );
            })}
            <Reveal delay={SIZE_TILES.length * 70}>
              <Link to="/properties?type=commercial-plot" className="group glass flex h-full flex-col rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-gold-400/50">
                <span className="grid h-14 w-14 place-items-center rounded-[14px] border border-white/10 bg-white/[0.03] text-gold-300 transition group-hover:text-gold-200">
                  <Store className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <span className="mt-6 font-display text-2xl">Commercial</span>
                <span className="mt-1 text-xs font-semibold text-white/50">
                  {facets.data?.types?.['commercial-plot'] ? plural(facets.data.types['commercial-plot'], 'listing') : 'Ask the office'}
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- SOCIETY (if set) */}
      {hasSociety && (
        <section className="bg-ivory py-20 sm:py-28">
          <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="eyebrow">The society</p>
              <h2 className="mt-4 font-display text-[2rem] leading-tight text-ink-950 sm:text-4xl lg:text-[2.75rem]">About {business.name}</h2>
              {society.overview && <p className="mt-5 line-clamp-5 text-lg leading-relaxed text-ink-500">{society.overview.split(/\n{2,}/)[0]}</p>}
              {society.facts?.length > 0 && (
                <dl className="mt-8 grid grid-cols-2 gap-4">
                  {society.facts.slice(0, 4).map((f) => (
                    <div key={f.label} className="rounded-2xl border border-ink-900/10 bg-white p-4">
                      <dt className="text-xs font-bold tracking-wider text-gold-700 uppercase">{f.label}</dt>
                      <dd className="mt-1 font-display text-xl text-ink-950">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <Link to="/society" className="btn btn-dark mt-8">
                Explore the society <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <Reveal delay={120}>
              {society.masterPlan?.url ? (
                <Link to="/society" className="gold-frame block overflow-hidden p-2">
                  <img src={mediaUrl(society.masterPlan.thumb || society.masterPlan.url)} alt={`${business.name} master plan`} loading="lazy" className="w-full rounded-[1.3rem]" />
                </Link>
              ) : society.amenities?.length ? (
                <div className="grid grid-cols-2 gap-4">
                  {society.amenities.slice(0, 6).map((a) => (
                    <div key={a.title} className="card p-5">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-ink-950 text-gold-300">
                        <Icon name={a.icon} />
                      </span>
                      <p className="mt-4 font-semibold text-ink-950">{a.title}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- WHY MARDAN */}
      {city.facts?.length > 0 && (
        <section className="bg-sand py-20 sm:py-28">
          <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow">Location</p>
              <h2 className="mt-4 font-display text-[2rem] leading-tight text-ink-950 sm:text-4xl lg:text-[2.75rem]">{city.heading}</h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-500">{city.intro}</p>
              {city.sourceUrl && (
                <a href={city.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-gold-700">
                  {city.sourceNote || 'Source'} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {city.facts.map((f, i) => (
                <Reveal key={f.label} delay={i * 80} className="card p-7">
                  <p className="text-gold-gradient font-display text-5xl font-semibold">{f.value}</p>
                  <p className="mt-3 font-bold text-ink-950">{f.label}</p>
                  {f.detail && <p className="mt-1 text-sm leading-relaxed text-ink-500">{f.detail}</p>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------------- TOOLS */}
      <section className="relative overflow-hidden bg-ink-900 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="container-x relative">
          <SectionHeading dark center eyebrow="Plan ahead" title="Tools for smart buyers" subtitle="Estimate installments and convert Marla, Kanal and square feet in seconds." />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal className="h-full">
              <InstallmentCalculator />
            </Reveal>
            <Reveal delay={120} className="h-full">
              <AreaConverter />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- BUYER CHECKLIST */}
      {guide.items?.length > 0 && (
        <section className="bg-ivory py-20 sm:py-28">
          <div className="container-x">
            <SectionHeading eyebrow="Buy with confidence" title={guide.heading} />
            <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {guide.items.map((item, i) => (
                <Reveal as="li" key={item.title} delay={i * 80} className="card p-7">
                  <span className="text-gold-gradient font-display text-5xl font-semibold">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-4 font-display text-xl text-ink-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.body}</p>
                </Reveal>
              ))}
            </ol>
            {guide.sourceUrl && (
              <a href={guide.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-gold-700">
                Source: {guide.sourceNote || guide.sourceUrl} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- CTA */}
      <section className="bg-ivory pb-20 sm:pb-28">
        <div className="container-x">
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-ink-950 px-6 py-14 text-center text-white sm:px-12 lg:py-20">
            <div className="pointer-events-none absolute inset-0 bg-glow" />
            <div className="pointer-events-none absolute inset-0 bg-grid-faint" />
            <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full border border-gold-500/20" />
            <div className="pointer-events-none absolute -top-56 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-gold-500/10" />
            <div className="relative">
              <p className="eyebrow eyebrow-light justify-center">Visit us</p>
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
                See it for yourself at the <span className="text-gold-gradient italic">site office</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-white/60">
                Talk to the {business.name} site office about availability, prices and documents, then visit the location in person.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <a href={telHref(business.phone)} className="btn btn-gold">
                  <Phone className="h-4 w-4" /> {business.phoneDisplay}
                </a>
                <a href={waHref(business.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
                <Link to="/contact?visit=1" className="btn btn-glass">
                  <CalendarCheck className="h-4 w-4" /> Book a visit
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
