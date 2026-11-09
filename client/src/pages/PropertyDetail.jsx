import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Bath, BedDouble, Check, ChevronLeft, ChevronRight, Copy, Eye, MapPin, Phone, Ruler, Share2, Star } from 'lucide-react';
import PlotArt from '../components/PlotArt.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import InquiryForm from '../components/InquiryForm.jsx';
import Lightbox from '../components/Lightbox.jsx';
import Seo from '../components/Seo.jsx';
import { Paragraphs } from '../components/ui.jsx';
import { WhatsAppIcon } from '../components/BrandIcons.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { mediaUrl, useApi } from '../lib/api.js';
import { telHref, waHref } from '../lib/contact.js';
import { FREQUENCY_LABELS, STATUS_LABELS, TYPE_LABELS, areaLabel, formatPrice, formatRupees, locationLine } from '../lib/format.js';
import NotFound from './NotFound.jsx';

function Gallery({ property }) {
  const images = property.images || [];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  if (!images.length) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] shadow-[0_30px_60px_-30px_rgba(7,11,22,.6)]">
        <PlotArt area={property.area} type={property.type} className="aspect-[16/10] w-full" />
      </div>
    );
  }

  const go = (d) => setIndex((i) => (i + d + images.length) % images.length);
  const img = images[index];

  return (
    <div>
      <div className="group relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-[1.75rem] bg-ink-900 shadow-[0_30px_60px_-30px_rgba(7,11,22,.6)]" onClick={() => setOpen(true)}>
        <img src={mediaUrl(img.url)} alt={img.alt || property.title} fetchPriority="high" className="h-full w-full object-cover" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute top-1/2 left-4 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-950 opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute top-1/2 right-4 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-950 opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute right-4 bottom-4 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((im, i) => (
            <button
              key={im.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${i === index ? 'border-gold-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={mediaUrl(im.thumb || im.url)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {open && <Lightbox images={images} index={index} onIndex={setIndex} onClose={() => setOpen(false)} />}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <div className="bg-ink-950 pt-32 pb-12">
        <div className="container-x space-y-4">
          <div className="h-4 w-48 rounded bg-white/10" />
          <div className="h-12 w-2/3 rounded bg-white/10" />
          <div className="h-5 w-1/3 rounded bg-white/10" />
        </div>
      </div>
      <div className="container-x grid gap-8 py-10 lg:grid-cols-3">
        <div className="skeleton aspect-[16/10] rounded-[1.75rem] lg:col-span-2" />
        <div className="skeleton h-96 rounded-[1.5rem]" />
      </div>
    </>
  );
}

export default function PropertyDetail() {
  const { slug } = useParams();
  const { business } = useSettings();
  const { data, error } = useApi(`/api/properties/${slug}`);
  const [copied, setCopied] = useState(false);

  if (error?.status === 404) return <NotFound title="Property not found" text="This listing may have been removed or sold. Browse the other properties or call the site office." />;
  if (error) return <NotFound title="Something went wrong" text="We could not load this property. Please refresh the page." />;
  if (!data) return <DetailSkeleton />;

  const p = data.property;
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const waText = `Assalam o Alaikum, I'm interested in "${p.title}" (${p.ref}) — ${formatPrice(p)}. ${url}`;
  const inst = p.installment || {};
  const totalInst = inst.available && inst.amount && inst.count ? (inst.downPayment || 0) + inst.amount * inst.count : null;

  const details = [
    ['Reference', p.ref],
    ['Type', TYPE_LABELS[p.type]],
    ['Purpose', p.purpose === 'rent' ? 'For rent' : 'For sale'],
    ['Size', areaLabel(p.area)],
    ['Status', STATUS_LABELS[p.status]],
    ['Plot no.', p.location?.plotNo],
    ['Street', p.location?.street],
    ['Block', p.location?.block],
    ['Phase', p.location?.phase],
    ['Bedrooms', p.bedrooms],
    ['Bathrooms', p.bathrooms],
    ['Address', p.location?.address],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <Seo title={p.title} description={`${areaLabel(p.area)} ${TYPE_LABELS[p.type]} — ${formatPrice(p)}. ${locationLine(p, business.city)}.`} />

      <section className="relative overflow-hidden bg-ink-950 pt-32 pb-12 text-white sm:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="container-x relative">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-white/50">
            <Link to="/" className="hover:text-gold-300">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/properties" className="hover:text-gold-300">
              Properties
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="max-w-[50vw] truncate text-white/80">{p.title}</span>
          </nav>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <span className="chip bg-white/10 text-white">{p.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
                <span className="chip bg-white/10 text-gold-200">{TYPE_LABELS[p.type]}</span>
                {p.featured && (
                  <span className="chip bg-gradient-to-r from-gold-300 to-gold-500 text-ink-950">
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </span>
                )}
                {p.status !== 'available' && <span className={`chip ${p.status === 'sold' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-ink-950'}`}>{STATUS_LABELS[p.status]}</span>}
                {p.isSample && <span className="chip border border-white/30 text-white/80">Sample listing</span>}
              </div>
              <h1 className="mt-4 font-display text-[2.2rem] leading-tight sm:text-5xl">{p.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-white/60">
                <MapPin className="h-4 w-4 text-gold-400" /> {[locationLine(p, ''), business.city].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="lg:text-right">
              <p className="text-xs font-bold tracking-[0.2em] text-white/45 uppercase">{p.purpose === 'rent' ? 'Rent' : 'Price'}</p>
              <p className="text-gold-gradient mt-1 font-display text-4xl font-semibold sm:text-5xl">{formatPrice(p)}</p>
              {p.price != null && <p className="mt-1 text-sm text-white/45">{formatRupees(p.price)}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-10 sm:py-14">
        <div className="container-x grid gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="space-y-8 lg:col-span-2">
            <Gallery property={p} />

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="card flex flex-col items-center p-4 text-center sm:p-5">
                <Ruler className="h-5 w-5 text-gold-600" />
                <span className="mt-2 font-display text-lg text-ink-950 sm:text-xl">{areaLabel(p.area)}</span>
                <span className="text-xs text-ink-500">Size</span>
              </div>
              {p.bedrooms ? (
                <div className="card flex flex-col items-center p-4 text-center sm:p-5">
                  <BedDouble className="h-5 w-5 text-gold-600" />
                  <span className="mt-2 font-display text-lg text-ink-950 sm:text-xl">{p.bedrooms}</span>
                  <span className="text-xs text-ink-500">Bedrooms</span>
                </div>
              ) : (
                <div className="card flex flex-col items-center p-4 text-center sm:p-5">
                  <MapPin className="h-5 w-5 text-gold-600" />
                  <span className="mt-2 truncate font-display text-lg text-ink-950 sm:text-xl">{p.location?.block || 'Mardan'}</span>
                  <span className="text-xs text-ink-500">{p.location?.block ? 'Block' : 'City'}</span>
                </div>
              )}
              {p.bathrooms ? (
                <div className="card flex flex-col items-center p-4 text-center sm:p-5">
                  <Bath className="h-5 w-5 text-gold-600" />
                  <span className="mt-2 font-display text-lg text-ink-950 sm:text-xl">{p.bathrooms}</span>
                  <span className="text-xs text-ink-500">Bathrooms</span>
                </div>
              ) : (
                <div className="card flex flex-col items-center p-4 text-center sm:p-5">
                  <Eye className="h-5 w-5 text-gold-600" />
                  <span className="mt-2 font-display text-lg text-ink-950 sm:text-xl">{STATUS_LABELS[p.status]}</span>
                  <span className="text-xs text-ink-500">Status</span>
                </div>
              )}
            </div>

            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink-950">Property details</h2>
              <dl className="mt-6 grid gap-x-8 sm:grid-cols-2">
                {details.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-ink-900/5 py-3 text-sm">
                    <dt className="text-ink-500">{label}</dt>
                    <dd className="text-right font-semibold text-ink-950">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {inst.available && (
              <div className="gold-frame p-6 text-white sm:p-8">
                <h2 className="font-display text-2xl">Installment plan</h2>
                <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <dt className="text-xs font-semibold text-white/50">Down payment</dt>
                    <dd className="mt-1 font-display text-xl text-gold-300">{formatRupees(inst.downPayment)}</dd>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <dt className="text-xs font-semibold text-white/50">{FREQUENCY_LABELS[inst.frequency] || 'Monthly'} installment</dt>
                    <dd className="mt-1 font-display text-xl text-gold-300">{formatRupees(inst.amount)}</dd>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <dt className="text-xs font-semibold text-white/50">Number of installments</dt>
                    <dd className="mt-1 font-display text-xl text-gold-300">{inst.count ?? '—'}</dd>
                  </div>
                </dl>
                {totalInst != null && <p className="mt-4 text-sm text-white/55">Total payable on this plan: {formatRupees(totalInst)}</p>}
                <p className="mt-2 text-xs text-white/40">Confirm the final schedule with the site office before booking.</p>
              </div>
            )}

            {p.description && (
              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-2xl text-ink-950">Description</h2>
                <Paragraphs text={p.description} className="mt-4 leading-relaxed text-ink-600" />
              </div>
            )}

            {p.features?.length > 0 && (
              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-2xl text-ink-950">Features</h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.features.map((f) => (
                    <li key={f} className="chip bg-sand py-2 text-sm text-ink-800">
                      <Check className="h-4 w-4 text-gold-600" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="card p-6">
              <p className="text-xs font-bold tracking-[0.2em] text-ink-400 uppercase">Interested?</p>
              <p className="mt-1 font-display text-2xl text-ink-950">Contact the site office</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <a href={telHref(business.phone)} className="btn btn-dark">
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a href={waHref(business.whatsapp, waText)} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
              </div>
              <div className="my-6 h-px bg-ink-900/10" />
              <InquiryForm property={p} compact />
            </div>
            <div className="card flex items-center justify-between gap-3 p-5">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                <Share2 className="h-4 w-4 text-gold-600" /> Share
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={copyLink} className="btn btn-light btn-sm">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy link'}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${p.title} — ${formatPrice(p)}\n${url}`)}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-sm" aria-label="Share on WhatsApp">
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {data.similar?.length > 0 && (
        <section className="bg-sand py-16 sm:py-20">
          <div className="container-x">
            <h2 className="font-display text-3xl text-ink-950 sm:text-4xl">Similar properties</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.similar.map((s) => (
                <PropertyCard key={s._id} property={s} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
