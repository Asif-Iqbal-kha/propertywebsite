import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api, invalidate, mediaUrl } from '../lib/api.js';
import { Spinner } from '../components/ui.jsx';
import { Field, ImageUploader, PageTitle, Panel, useToast } from './kit.jsx';

export default function GalleryAdmin() {
  const notify = useToast();
  const [items, setItems] = useState(null);
  const [category, setCategory] = useState('General');

  const load = () =>
    api('/api/gallery')
      .then((d) => setItems(d.items))
      .catch((e) => notify(e.message, 'error'));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(images) {
    try {
      await api('/api/admin/gallery', { method: 'POST', body: { images, category } });
      invalidate('/api/gallery');
      notify(`${images.length} photo(s) added`);
      load();
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  async function patch(item, body) {
    try {
      const { item: updated } = await api(`/api/admin/gallery/${item._id}`, { method: 'PATCH', body });
      setItems((list) => list.map((x) => (x._id === item._id ? updated : x)));
      invalidate('/api/gallery');
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  async function remove(item) {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api(`/api/admin/gallery/${item._id}`, { method: 'DELETE' });
      setItems((list) => list.filter((x) => x._id !== item._id));
      invalidate('/api/gallery');
      notify('Photo deleted');
    } catch (e) {
      notify(e.message, 'error');
    }
  }

  return (
    <>
      <PageTitle title="Gallery" description="Real photos of the society, development work and the site office." />

      <Panel title="Upload photos" className="mb-6">
        <Field label="Category for this upload" hint="Visitors can filter the gallery by category, e.g. Development, Site Office, Events." className="mb-4 max-w-xs">
          <input className="input" value={category} maxLength={40} onChange={(e) => setCategory(e.target.value)} />
        </Field>
        <ImageUploader images={[]} onChange={add} max={30} label="Choose photos" />
      </Panel>

      {!items ? (
        <div className="grid h-40 place-items-center">
          <Spinner className="h-7 w-7 text-gold-600" />
        </div>
      ) : items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-2xl border border-ink-900/[0.08] bg-white">
              <div className="relative aspect-[4/3] bg-ink-900">
                <img src={mediaUrl(item.thumb || item.url)} alt="" loading="lazy" className="h-full w-full object-cover" />
                <button type="button" onClick={() => remove(item)} className="absolute top-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-rose-600 text-white shadow" aria-label="Delete photo">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 p-3">
                <input className="input py-2 text-sm" placeholder="Caption (optional)" defaultValue={item.caption} maxLength={160} onBlur={(e) => e.target.value !== item.caption && patch(item, { caption: e.target.value })} />
                <input className="input py-2 text-sm" placeholder="Category" defaultValue={item.category} maxLength={40} onBlur={(e) => e.target.value !== item.category && patch(item, { category: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-ink-900/15 p-10 text-center text-sm text-ink-400">No photos yet. The Gallery page shows a friendly message until you upload some.</p>
      )}
    </>
  );
}
