import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { api, invalidate, mediaUrl } from '../lib/api.js';
import { STATUS_LABELS, TYPE_LABELS, areaLabel, formatPrice } from '../lib/format.js';
import PlotArt from '../components/PlotArt.jsx';
import { Spinner } from '../components/ui.jsx';
import { PageTitle, useToast } from './kit.jsx';

export default function PropertiesAdmin() {
  const notify = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '20', page: String(page) });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    api(`/api/admin/properties?${params}`)
      .then(setData)
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [q, status, page, notify]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function patch(p, body) {
    try {
      const { property } = await api(`/api/admin/properties/${p._id}`, { method: 'PATCH', body });
      setData((d) => ({ ...d, items: d.items.map((x) => (x._id === p._id ? { ...x, ...property, images: x.images } : x)) }));
      invalidate('/api/properties');
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  async function remove(p) {
    if (!window.confirm(`Delete "${p.title}" (${p.ref})? Its photos will be deleted too.`)) return;
    try {
      await api(`/api/admin/properties/${p._id}`, { method: 'DELETE' });
      invalidate('/api/properties');
      notify('Listing deleted');
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  return (
    <>
      <PageTitle
        title="Properties"
        description="Add, edit and publish your listings."
        actions={
          <Link to="/admin/properties/new" className="btn btn-gold btn-sm">
            <Plus className="h-4 w-4" /> Add listing
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-10"
            placeholder="Search title, ref, block…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="input sm:w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-900/[0.08] bg-white">
        {loading && !data ? (
          <div className="grid h-64 place-items-center">
            <Spinner className="h-7 w-7 text-gold-600" />
          </div>
        ) : data?.items.length ? (
          <ul className={`divide-y divide-ink-900/5 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((p) => (
              <li key={p._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Link to={`/admin/properties/${p._id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-900">
                    {p.images?.[0] ? <img src={mediaUrl(p.images[0].thumb || p.images[0].url)} alt="" className="h-full w-full object-cover" loading="lazy" /> : <PlotArt area={p.area} type={p.type} className="h-full w-full" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold text-ink-950">{p.title}</span>
                      {p.isSample && <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-800 uppercase">Sample</span>}
                    </span>
                    <span className="block text-xs text-ink-500">
                      {p.ref} · {TYPE_LABELS[p.type]} · {areaLabel(p.area)} · {p.purpose === 'rent' ? 'Rent' : 'Sale'}
                    </span>
                    <span className="block text-sm font-semibold text-ink-800">{formatPrice(p)}</span>
                  </span>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Status"
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${p.status === 'available' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : p.status === 'booked' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
                    value={p.status}
                    onChange={(e) => patch(p, { status: e.target.value })}
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => patch(p, { featured: !p.featured })}
                    className={`grid h-9 w-9 place-items-center rounded-full border ${p.featured ? 'border-gold-400 bg-gold-50 text-gold-600' : 'border-ink-900/10 text-ink-300 hover:text-gold-600'}`}
                    aria-label={p.featured ? 'Remove from featured' : 'Mark as featured'}
                    title={p.featured ? 'Featured' : 'Mark as featured'}
                  >
                    <Star className={`h-4 w-4 ${p.featured ? 'fill-current' : ''}`} />
                  </button>
                  <span className="px-1 text-xs text-ink-400">{p.views} views</span>
                  <a href={`/properties/${p.slug}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-ink-900/10 text-ink-500 hover:text-ink-950" aria-label="View on website">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Link to={`/admin/properties/${p._id}`} className="grid h-9 w-9 place-items-center rounded-full border border-ink-900/10 text-ink-500 hover:text-ink-950" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button type="button" onClick={() => remove(p)} className="grid h-9 w-9 place-items-center rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 text-center">
            <p className="font-display text-2xl text-ink-950">No listings yet</p>
            <p className="mt-2 text-sm text-ink-500">Add your first plot, house or file. Only add listings you have confirmed.</p>
            <Link to="/admin/properties/new" className="btn btn-gold btn-sm mt-5">
              <Plus className="h-4 w-4" /> Add listing
            </Link>
          </div>
        )}
      </div>

      {data?.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-ink-500">
            Page {data.page} of {data.pages} · {data.total} listings
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn btn-light btn-sm" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
              Previous
            </button>
            <button type="button" className="btn btn-light btn-sm" disabled={page >= data.pages} onClick={() => setPage((n) => n + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
