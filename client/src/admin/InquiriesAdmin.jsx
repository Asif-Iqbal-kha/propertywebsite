import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { CalendarCheck, ExternalLink, Mail, Phone, Search, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { telHref, waHref } from '../lib/contact.js';
import { formatDate, timeAgo } from '../lib/format.js';
import { WhatsAppIcon } from '../components/BrandIcons.jsx';
import { Spinner } from '../components/ui.jsx';
import { PageTitle, useToast } from './kit.jsx';

const TABS = [
  ['', 'All'],
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['closed', 'Closed'],
];

export default function InquiriesAdmin() {
  const notify = useToast();
  const { refreshStats } = useOutletContext();
  const [status, setStatus] = useState('new');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    api(`/api/admin/inquiries?${params}`)
      .then(setData)
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [status, q, page, notify]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function update(item, body) {
    try {
      const { inquiry } = await api(`/api/admin/inquiries/${item._id}`, { method: 'PATCH', body });
      setData((d) => ({ ...d, items: d.items.map((x) => (x._id === item._id ? inquiry : x)) }));
      if (body.status) refreshStats();
      if (body.notes !== undefined) notify('Note saved');
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete the inquiry from ${item.name}?`)) return;
    try {
      await api(`/api/admin/inquiries/${item._id}`, { method: 'DELETE' });
      notify('Inquiry deleted');
      refreshStats();
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  const counts = data?.counts || {};
  const all = (counts.new || 0) + (counts.contacted || 0) + (counts.closed || 0);

  return (
    <>
      <PageTitle title="Inquiries" description="Messages and site-visit requests sent from the website." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 rounded-full bg-white p-1 ring-1 ring-ink-900/10">
          {TABS.map(([value, label]) => (
            <button
              key={value || 'all'}
              type="button"
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${status === value ? 'bg-ink-950 text-white' : 'text-ink-500 hover:text-ink-950'}`}
            >
              {label} <span className="opacity-60">{value ? counts[value] || 0 : all}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-10"
            placeholder="Search name, phone, ref…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading && !data ? (
        <div className="grid h-64 place-items-center">
          <Spinner className="h-7 w-7 text-gold-600" />
        </div>
      ) : data?.items.length ? (
        <ul className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>
          {data.items.map((item) => (
            <li key={item._id} className={`rounded-2xl border bg-white p-5 ${item.status === 'new' ? 'border-gold-400/60 shadow-[0_0_0_3px_rgba(197,154,61,.08)]' : 'border-ink-900/[0.08]'}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl text-ink-950">{item.name}</p>
                    {item.kind === 'visit' ? (
                      <span className="chip bg-emerald-50 text-emerald-700">
                        <CalendarCheck className="h-3.5 w-3.5" /> Site visit{item.visitDate ? ` · ${formatDate(item.visitDate)}` : ''}
                      </span>
                    ) : item.propertyTitle ? (
                      <span className="chip bg-gold-50 text-gold-800">Property inquiry</span>
                    ) : (
                      <span className="chip bg-sand text-ink-600">General</span>
                    )}
                    <span className="text-xs text-ink-400" title={formatDate(item.createdAt, true)}>
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <a href={telHref(item.phone)} className="flex items-center gap-1.5 font-semibold text-ink-800 hover:text-gold-700">
                      <Phone className="h-4 w-4" /> {item.phone}
                    </a>
                    <a href={waHref(item.phone.replace(/^0/, '92'))} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline">
                      <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                    </a>
                    {item.email && (
                      <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 text-ink-600 hover:text-gold-700">
                        <Mail className="h-4 w-4" /> {item.email}
                      </a>
                    )}
                    <span className="text-ink-400">Prefers: {item.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Phone call'}</span>
                  </div>
                  {item.propertyTitle && (
                    <Link to={`/properties/${item.propertySlug}`} target="_blank" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:underline">
                      {item.propertyRef} · {item.propertyTitle} <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  {item.message && <p className="mt-3 rounded-xl bg-ivory p-3 text-sm whitespace-pre-line text-ink-700">{item.message}</p>}
                  <textarea
                    className="input mt-3 min-h-[44px] text-sm"
                    placeholder="Private note (saved when you click away)…"
                    defaultValue={item.notes}
                    onBlur={(e) => e.target.value !== item.notes && update(item, { notes: e.target.value })}
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-end">
                  <select
                    aria-label="Status"
                    className="input w-auto py-2 text-sm font-semibold"
                    value={item.status}
                    onChange={(e) => update(item, { status: e.target.value })}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button type="button" onClick={() => remove(item)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-ink-900/[0.08] bg-white p-10 text-center text-sm text-ink-500">No inquiries here.</div>
      )}

      {data?.pages > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn btn-light btn-sm" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
            Previous
          </button>
          <button type="button" className="btn btn-light btn-sm" disabled={page >= data.pages} onClick={() => setPage((n) => n + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
}
