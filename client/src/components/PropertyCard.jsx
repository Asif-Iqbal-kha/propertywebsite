import { Link } from 'react-router';
import { BedDouble, Bath, MapPin, Ruler, Star } from 'lucide-react';
import PlotArt from './PlotArt.jsx';
import { mediaUrl, prefetch } from '../lib/api.js';
import { TYPE_LABELS, areaLabel, formatPrice, locationLine } from '../lib/format.js';
import { prefetchRoute } from '../routes.js';
import { useSettings } from '../context/SettingsContext.jsx';

const STATUS_STYLE = {
  booked: 'bg-amber-400 text-ink-950',
  sold: 'bg-rose-500 text-white',
};

export default function PropertyCard({ property, priority = false }) {
  const { business } = useSettings();
  const img = property.images?.[0];
  const href = `/properties/${property.slug}`;
  const warm = () => {
    prefetchRoute(href);
    prefetch(`/api/properties/${property.slug}`);
  };

  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(11,18,34,.45)]">
      <Link to={href} onMouseEnter={warm} onFocus={warm} onTouchStart={warm} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-900">
          {img ? (
            <img
              src={mediaUrl(img.thumb || img.url)}
              alt={img.alt || property.title}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              width={img.width || undefined}
              height={img.height || undefined}
              className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <PlotArt area={property.area} type={property.type} className="h-full w-full transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-80" />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="chip bg-white/95 text-ink-900 shadow">{property.purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>
            {property.featured && (
              <span className="chip bg-gradient-to-r from-gold-300 to-gold-500 text-ink-950 shadow">
                <Star className="h-3 w-3 fill-current" /> Featured
              </span>
            )}
          </div>
          {STATUS_STYLE[property.status] && (
            <span className={`chip absolute top-4 right-4 shadow ${STATUS_STYLE[property.status]}`}>{property.status === 'sold' ? 'Sold' : 'Booked'}</span>
          )}
          {property.isSample && (
            <span className="absolute bottom-4 left-4 rounded-md border border-white/30 bg-black/60 px-2 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-white uppercase">
              Sample listing
            </span>
          )}
          <span className="absolute right-4 bottom-4 rounded-full bg-black/45 px-2.5 py-1 text-[0.68rem] font-bold tracking-wider text-white/90 backdrop-blur">
            {property.ref}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="text-[0.7rem] font-extrabold tracking-[0.2em] text-gold-700 uppercase">{TYPE_LABELS[property.type]}</p>
          <h3 className="mt-2 line-clamp-2 font-display text-[1.3rem] leading-snug text-ink-950 transition-colors group-hover:text-gold-700">{property.title}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin className="h-4 w-4 shrink-0 text-gold-600" />
            <span className="truncate">{locationLine(property, business.city)}</span>
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-ink-600">
            <span className="chip bg-sand">
              <Ruler className="h-3.5 w-3.5" /> {areaLabel(property.area)}
            </span>
            {property.bedrooms ? (
              <span className="chip bg-sand">
                <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms} Beds
              </span>
            ) : null}
            {property.bathrooms ? (
              <span className="chip bg-sand">
                <Bath className="h-3.5 w-3.5" /> {property.bathrooms} Baths
              </span>
            ) : null}
            {property.installment?.available && <span className="chip bg-emerald-50 text-emerald-700">Installments</span>}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-900/5 pt-4">
            <p className={`font-display text-xl font-semibold ${property.price == null ? 'text-ink-500 italic' : 'text-ink-950'}`}>{formatPrice(property)}</p>
            <span className="text-xs font-bold tracking-wider text-gold-700 uppercase opacity-0 transition-opacity group-hover:opacity-100">View →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-6">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-6 w-4/5 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton mt-6 h-6 w-1/3 rounded" />
      </div>
    </div>
  );
}
