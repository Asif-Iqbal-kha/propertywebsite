import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CircleCheck, Circle, Eye, Inbox, LandPlot, Plus, Star, TriangleAlert } from 'lucide-react';
import { api, invalidate } from '../lib/api.js';
import { formatPrice, timeAgo } from '../lib/format.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { Spinner } from '../components/ui.jsx';
import { PageTitle, Panel, useToast } from './kit.jsx';

function Stat({ icon: Ico, label, value, sub, to }) {
  const body = (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-950 text-gold-300">
        <Ico className="h-5 w-5" />
      </span>
      <p className="mt-4 font-display text-3xl text-ink-950">{value}</p>
      <p className="text-sm font-semibold text-ink-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-400">{sub}</p>}
    </>
  );
  return to ? (
    <Link to={to} className="rounded-2xl border border-ink-900/[0.08] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      {body}
    </Link>
  ) : (
    <div className="rounded-2xl border border-ink-900/[0.08] bg-white p-5">{body}</div>
  );
}

export default function Dashboard() {
  const settings = useSettings();
  const notify = useToast();
  const [stats, setStats] = useState(null);
  const [galleryCount, setGalleryCount] = useState(0);
  const [removing, setRemoving] = useState(false);

  const load = () => {
    api('/api/admin/stats').then(setStats).catch((e) => notify(e.message, 'error'));
    api('/api/gallery')
      .then((g) => setGalleryCount(g.items.length))
      .catch(() => {});
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function removeSamples() {
    if (!window.confirm('Delete all sample listings from the website?')) return;
    setRemoving(true);
    try {
      const r = await api('/api/admin/properties/samples', { method: 'DELETE' });
      invalidate('/api/properties');
      notify(`${r.removed} sample listing(s) removed`);
      load();
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setRemoving(false);
    }
  }

  if (!stats) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner className="h-8 w-8 text-gold-600" />
      </div>
    );
  }

  const realListings = stats.properties.total - stats.properties.samples;
  const checklist = [
    { done: realListings > 0, label: 'Add your first real listing', to: '/admin/properties/new' },
    { done: Boolean(settings.business.address), label: 'Add the site office address', to: '/admin/settings?tab=business' },
    { done: Boolean(settings.business.officeHours), label: 'Add office hours', to: '/admin/settings?tab=business' },
    { done: Boolean(settings.society.overview), label: 'Write the society overview (verified facts only)', to: '/admin/settings?tab=society' },
    { done: Boolean(settings.society.masterPlan), label: 'Upload the official master plan', to: '/admin/settings?tab=society' },
    { done: (settings.payment.plans || []).length > 0, label: 'Publish the current payment plans', to: '/admin/settings?tab=payment' },
    { done: galleryCount > 0, label: 'Upload real photos of the site', to: '/admin/gallery' },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <>
      <PageTitle
        title="Dashboard"
        description={`Welcome back. Here's what is happening on the ${settings.business.name} website.`}
        actions={
          <Link to="/admin/properties/new" className="btn btn-gold btn-sm">
            <Plus className="h-4 w-4" /> Add listing
          </Link>
        }
      />

      {stats.properties.samples > 0 && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">{stats.properties.samples} sample listing(s) are visible on the website</p>
              <p className="text-sm text-amber-800">They exist only to preview the design and are marked “Sample”. Remove them before sharing the website.</p>
            </div>
          </div>
          <button type="button" onClick={removeSamples} disabled={removing} className="btn btn-dark btn-sm shrink-0">
            {removing ? <Spinner className="h-4 w-4" /> : null} Remove samples
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={LandPlot} label="Listings" value={stats.properties.total} sub={`${stats.properties.available} available · ${stats.properties.booked} booked · ${stats.properties.sold} sold`} to="/admin/properties" />
        <Stat icon={Inbox} label="New inquiries" value={stats.inquiries.new} sub={`${stats.inquiries.total} in total`} to="/admin/inquiries" />
        <Stat icon={Eye} label="Listing views" value={stats.views.toLocaleString()} sub="All-time detail page views" />
        <Stat icon={Star} label="Featured" value={stats.properties.featured} sub="Shown first on the home page" to="/admin/properties" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Panel title="Recent inquiries" className="lg:col-span-3" actions={<Link to="/admin/inquiries" className="text-sm font-semibold text-gold-700 hover:underline">View all</Link>}>
          {stats.recentInquiries.length ? (
            <ul className="divide-y divide-ink-900/5">
              {stats.recentInquiries.map((q) => (
                <li key={q._id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-ink-950">
                      {q.name}
                      {q.status === 'new' && <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[0.65rem] font-extrabold text-ink-950 uppercase">New</span>}
                    </p>
                    <p className="truncate text-sm text-ink-500">
                      {q.kind === 'visit' ? 'Site visit request' : q.propertyTitle ? `About ${q.propertyTitle}` : 'General inquiry'} · {q.phone}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink-400">{timeAgo(q.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-ink-400">No inquiries yet. They will appear here when visitors contact you through the website.</p>
          )}
        </Panel>

        <Panel title="Publish verified content" description={`${doneCount} of ${checklist.length} done`} className="lg:col-span-2">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-ink-900/10">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-600" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
          </div>
          <ul className="space-y-1">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link to={c.to} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-ivory">
                  {c.done ? <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0 text-ink-300" />}
                  <span className={c.done ? 'text-ink-400 line-through' : 'font-medium text-ink-800'}>{c.label}</span>
                  {!c.done && <ArrowRight className="ml-auto h-3.5 w-3.5 text-gold-600" />}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {stats.recentProperties.length > 0 && (
        <Panel title="Latest listings" className="mt-6" actions={<Link to="/admin/properties" className="text-sm font-semibold text-gold-700 hover:underline">Manage</Link>}>
          <ul className="divide-y divide-ink-900/5">
            {stats.recentProperties.map((p) => (
              <li key={p._id} className="flex items-center justify-between gap-4 py-3">
                <Link to={`/admin/properties/${p._id}`} className="min-w-0 hover:text-gold-700">
                  <p className="truncate font-semibold text-ink-950">
                    {p.title} {p.isSample && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-amber-800 uppercase">Sample</span>}
                  </p>
                  <p className="text-xs text-ink-400">
                    {p.ref} · {p.views} views · added {timeAgo(p.createdAt)}
                  </p>
                </Link>
                <span className="shrink-0 text-sm font-semibold text-ink-700">{formatPrice(p)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
