import { useMemo, useState } from 'react';
import { ImageOff, Phone } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { PageHeader } from '../components/ui.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { mediaUrl, useApi } from '../lib/api.js';
import { telHref } from '../lib/contact.js';

export default function Gallery() {
  const { business } = useSettings();
  const { data, loading } = useApi('/api/gallery');
  const [category, setCategory] = useState('All');
  const [index, setIndex] = useState(-1);

  const items = useMemo(() => data?.items || [], [data]);
  const categories = useMemo(() => ['All', ...new Set(items.map((i) => i.category).filter(Boolean))], [items]);
  const shown = category === 'All' ? items : items.filter((i) => i.category === category);

  return (
    <>
      <Seo title="Gallery" description={`Photos from ${business.name}, Mardan.`} />
      <PageHeader eyebrow="Gallery" title="Photos from the site" subtitle={`A look at ${business.name}, published by the site office.`} crumbs={[{ label: 'Gallery' }]} />

      <section className="min-h-[50vh] bg-ivory py-14 sm:py-20">
        <div className="container-x">
          {categories.length > 2 && (
            <div className="scrollbar-none mb-8 flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${category === c ? 'bg-ink-950 text-white' : 'border border-ink-900/10 bg-white text-ink-600 hover:border-gold-500'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading && !data ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {[260, 340, 220, 300, 260, 340].map((h, i) => (
                <div key={i} className="skeleton mb-4 rounded-2xl" style={{ height: h }} />
              ))}
            </div>
          ) : shown.length ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {shown.map((item, i) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-ink-900 text-left"
                >
                  <img
                    src={mediaUrl(item.thumb || item.url)}
                    alt={item.caption || `${business.name} photo`}
                    loading="lazy"
                    decoding="async"
                    width={item.width || undefined}
                    height={item.height || undefined}
                    className="h-auto w-full transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                  {item.caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 to-transparent p-4 pt-10 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {item.caption}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="card mx-auto max-w-2xl p-10 text-center sm:p-14">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink-950 text-gold-300">
                <ImageOff className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <h2 className="mt-6 font-display text-3xl text-ink-950">No photos published yet</h2>
              <p className="mx-auto mt-3 max-w-md text-ink-500">The best way to see the site is in person. Call the site office to arrange a visit.</p>
              <a href={telHref(business.phone)} className="btn btn-dark mt-7">
                <Phone className="h-4 w-4" /> {business.phoneDisplay}
              </a>
            </div>
          )}
        </div>
      </section>

      {index >= 0 && <Lightbox images={shown} index={index} onIndex={setIndex} onClose={() => setIndex(-1)} />}
    </>
  );
}
