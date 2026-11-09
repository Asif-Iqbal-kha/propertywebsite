import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, Phone, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import PropertyCard, { PropertyCardSkeleton } from '../components/PropertyCard.jsx';
import Seo from '../components/Seo.jsx';
import { PageHeader } from '../components/ui.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useApi } from '../lib/api.js';
import { telHref } from '../lib/contact.js';
import { BUDGET_OPTIONS, SIZE_OPTIONS, TYPE_LABELS, TYPE_OPTIONS, formatPKR } from '../lib/format.js';

const SORT_OPTIONS = [
  ['recommended', 'Recommended'],
  ['newest', 'Newest first'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['size-asc', 'Size: small to large'],
  ['size-desc', 'Size: large to small'],
];

const STATUS_OPTIONS = [
  ['', 'Available & booked'],
  ['available', 'Available only'],
  ['booked', 'Booked'],
  ['sold', 'Sold'],
];

function SearchInput({ value, onChange }) {
  const [text, setText] = useState(value);
  const first = useRef(true);

  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    const t = setTimeout(() => text !== value && onChange(text), 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input className="input pl-10" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Block, plot no., keyword…" maxLength={60} />
    </div>
  );
}

function Filters({ params, update, reset }) {
  const get = (k) => params.get(k) || '';
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="label">Search</span>
        <SearchInput value={get('q')} onChange={(q) => update({ q })} />
      </label>

      <div>
        <span className="label">Purpose</span>
        <div className="grid grid-cols-3 gap-1 rounded-full bg-sand p-1">
          {[
            ['', 'All'],
            ['sale', 'Buy'],
            ['rent', 'Rent'],
          ].map(([value, label]) => (
            <button
              key={value || 'all'}
              type="button"
              onClick={() => update({ purpose: value })}
              className={`rounded-full py-2 text-sm font-bold transition ${get('purpose') === value ? 'bg-ink-950 text-white' : 'text-ink-600 hover:text-ink-950'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="label">Property type</span>
        <select className="input" value={get('type')} onChange={(e) => update({ type: e.target.value })}>
          <option value="">All types</option>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label">Size</span>
        <select className="input" value={get('size')} onChange={(e) => update({ size: e.target.value })}>
          <option value="">Any size</option>
          {SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Min price</span>
          <select className="input" value={get('minPrice')} onChange={(e) => update({ minPrice: e.target.value })}>
            <option value="">No min</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Max price</span>
          <select className="input" value={get('maxPrice')} onChange={(e) => update({ maxPrice: e.target.value })}>
            <option value="">No max</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="label">Status</span>
        <select className="input" value={get('status')} onChange={(e) => update({ status: e.target.value })}>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value || 'default'} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <button type="button" onClick={reset} className="btn btn-light w-full">
        <RotateCcw className="h-4 w-4" /> Reset filters
      </button>
    </div>
  );
}

function pageList(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

export default function Properties() {
  const { business } = useSettings();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const topRef = useRef(null);

  const apiParams = new URLSearchParams(params);
  apiParams.set('limit', '12');
  const { data, loading, error } = useApi(`/api/properties?${apiParams}`);
  const items = data?.items || [];
  const page = data?.page || 1;
  const pages = data?.pages || 1;

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, String(v));
    }
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: !('page' in patch) });
  };
  const reset = () => setParams(new URLSearchParams(), { replace: true });

  const goPage = (n) => {
    update({ page: n === 1 ? '' : n });
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  const chips = [
    params.get('q') && ['q', `“${params.get('q')}”`],
    params.get('purpose') && ['purpose', params.get('purpose') === 'rent' ? 'For rent' : 'For sale'],
    params.get('type') && ['type', TYPE_LABELS[params.get('type')]],
    params.get('size') && ['size', SIZE_OPTIONS.find((o) => o.value === params.get('size'))?.label || params.get('size')],
    params.get('minPrice') && ['minPrice', `From ${formatPKR(params.get('minPrice'))}`],
    params.get('maxPrice') && ['maxPrice', `Up to ${formatPKR(params.get('maxPrice'))}`],
    params.get('status') && ['status', STATUS_OPTIONS.find(([v]) => v === params.get('status'))?.[1]],
  ].filter(Boolean);

  return (
    <>
      <Seo title="Properties for Sale & Rent" description={`Browse plots, homes and commercial property listed by the ${business.name} site office in Mardan.`} />
      <PageHeader
        eyebrow="Listings"
        title="Properties for sale & rent"
        subtitle={`Browse plots, homes and commercial property listed by the ${business.name} site office.`}
        crumbs={[{ label: 'Properties' }]}
      />

      <section className="bg-ivory py-12 sm:py-16">
        <div ref={topRef} className="container-x scroll-mt-28 lg:grid lg:grid-cols-[290px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="card sticky top-28 p-6">
              <h2 className="mb-5 flex items-center gap-2 font-display text-xl text-ink-950">
                <SlidersHorizontal className="h-5 w-5 text-gold-600" /> Filters
              </h2>
              <Filters params={params} update={update} reset={reset} />
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-500">
                {loading && !data ? 'Loading…' : (
                  <>
                    <span className="font-display text-2xl text-ink-950">{data?.total ?? 0}</span> {data?.total === 1 ? 'property' : 'properties'} found
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setDrawer(true)} className="btn btn-light btn-sm lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Filters{chips.length ? ` (${chips.length})` : ''}
                </button>
                <select aria-label="Sort by" className="input w-auto py-2 text-sm" value={params.get('sort') || 'recommended'} onChange={(e) => update({ sort: e.target.value === 'recommended' ? '' : e.target.value })}>
                  {SORT_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {chips.map(([key, label]) => (
                  <button key={key} type="button" onClick={() => update({ [key]: '' })} className="chip border border-gold-500/40 bg-gold-50 text-ink-800 hover:border-gold-600">
                    {label} <X className="h-3.5 w-3.5" />
                  </button>
                ))}
                <button type="button" onClick={reset} className="chip text-gold-700 hover:underline">
                  Clear all
                </button>
              </div>
            )}

            <div className="mt-8">
              {error ? (
                <div className="card p-10 text-center text-ink-500">Could not load properties. Please refresh the page.</div>
              ) : loading && !data ? (
                <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </div>
              ) : items.length ? (
                <div className={`grid gap-6 transition-opacity sm:grid-cols-2 2xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
                  {items.map((p, i) => (
                    <PropertyCard key={p._id} property={p} priority={i < 2} />
                  ))}
                </div>
              ) : (
                <div className="card p-10 text-center sm:p-14">
                  <h3 className="font-display text-2xl text-ink-950">No properties match these filters</h3>
                  <p className="mx-auto mt-3 max-w-md text-ink-500">Try removing a filter, or tell the site office what you are looking for. New listings may not be on the website yet.</p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={reset} className="btn btn-light">
                      <RotateCcw className="h-4 w-4" /> Reset filters
                    </button>
                    <a href={telHref(business.phone)} className="btn btn-dark">
                      <Phone className="h-4 w-4" /> Call {business.phoneDisplay}
                    </a>
                    <Link to="/contact" className="btn btn-gold">
                      Send a request
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {pages > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => goPage(page - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink-900/10 bg-white disabled:opacity-40" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {pageList(page, pages).map((n, i) =>
                  n === '…' ? (
                    <span key={`gap${i}`} className="px-1 text-ink-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => goPage(n)}
                      aria-current={n === page ? 'page' : undefined}
                      className={`h-11 min-w-11 rounded-full px-3 text-sm font-bold ${n === page ? 'bg-ink-950 text-white' : 'border border-ink-900/10 bg-white text-ink-700 hover:border-gold-500'}`}
                    >
                      {n}
                    </button>
                  ),
                )}
                <button type="button" disabled={page >= pages} onClick={() => goPage(page + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink-900/10 bg-white disabled:opacity-40" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>

      {/* mobile filter drawer */}
      <div className={`fixed inset-0 z-[60] lg:hidden ${drawer ? 'visible' : 'invisible'}`} aria-hidden={!drawer}>
        <div className={`absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity ${drawer ? 'opacity-100' : 'opacity-0'}`} onClick={() => setDrawer(false)} />
        <div className={`absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col bg-ivory shadow-2xl transition-transform duration-300 ${drawer ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between border-b border-ink-900/10 p-5">
            <h2 className="font-display text-xl">Filters</h2>
            <button type="button" onClick={() => setDrawer(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white" aria-label="Close filters">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <Filters params={params} update={update} reset={reset} />
          </div>
          <div className="border-t border-ink-900/10 p-5">
            <button type="button" onClick={() => setDrawer(false)} className="btn btn-gold w-full">
              Show {data?.total ?? ''} results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
