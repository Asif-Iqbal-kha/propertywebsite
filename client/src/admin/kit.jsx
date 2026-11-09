import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, ImagePlus, Plus, Star, Trash2 } from 'lucide-react';
import { api, mediaUrl } from '../lib/api.js';
import { formatPKR } from '../lib/format.js';
import { ICONS } from '../components/Icon.jsx';
import { Spinner } from '../components/ui.jsx';

/* ------------------------------------------------------------------ toasts */
const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const notify = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed right-4 bottom-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-up flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl ${t.type === 'error' ? 'bg-rose-600 text-white' : 'bg-ink-950 text-white'}`}
          >
            {t.type === 'error' ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ layout */
export function Panel({ title, description, actions, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-ink-900/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(11,18,34,.04)] sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-xl text-ink-950">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-ink-950">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-ink-400">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-gold-500' : 'bg-ink-900/15'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      <span className="cursor-pointer" onClick={() => onChange(!checked)}>
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {description && <span className="block text-xs text-ink-500">{description}</span>}
      </span>
    </div>
  );
}

/** Integer-only money input with a live Lakh / Crore preview. */
export function MoneyInput({ value, onChange, placeholder = 'e.g. 4500000' }) {
  return (
    <>
      <input
        className="input"
        inputMode="numeric"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d]/g, '').slice(0, 12);
          onChange(v === '' ? null : Number(v));
        }}
      />
      <span className="mt-1.5 block text-xs font-semibold text-gold-700">{value ? formatPKR(value) : 'Leave empty to show “Price on request”'}</span>
    </>
  );
}

/* ---------------------------------------------------------------- uploader */
/** Resizes a photo to max 2400px and re-encodes as JPEG (keeps uploads well under 4 MB). */
async function shrinkImage(file) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function ImageUploader({ images = [], onChange, max = 20, single = false, label = 'Choose photos' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);

  async function upload(fileList) {
    const room = single ? 1 : max - images.length;
    const files = Array.from(fileList || [])
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, room);
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      // One photo per request, shrunk in the browser first: serverless hosts cap uploads at ~4.5 MB.
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('images', await shrinkImage(file), file.name.replace(/\.\w+$/, '') + '.jpg');
        const res = await api('/api/admin/uploads', { method: 'POST', body: fd });
        uploaded.push(...res.images);
      }
      onChange(single ? uploaded.slice(0, 1) : [...images, ...uploaded]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i) => onChange(images.filter((_, j) => j !== i));
  const canAdd = single ? images.length === 0 : images.length < max;

  return (
    <div>
      {images.length > 0 && (
        <div className={`grid gap-3 ${single ? 'max-w-md grid-cols-1' : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'}`}>
          {images.map((img, i) => (
            <div key={img.url} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-900/10 bg-ink-900">
              <img src={mediaUrl(img.thumb || img.url)} alt="" className="h-full w-full object-cover" />
              {!single && i === 0 && (
                <span className="chip absolute top-2 left-2 bg-gold-400 text-ink-950">
                  <Star className="h-3 w-3 fill-current" /> Cover
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
                {!single ? (
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-ink-900 disabled:opacity-40" aria-label="Move left">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-ink-900 disabled:opacity-40" aria-label="Move right">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span />
                )}
                <button type="button" onClick={() => remove(i)} className="grid h-8 w-8 place-items-center rounded-lg bg-rose-600 text-white" aria-label="Remove photo">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            upload(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition ${images.length ? 'mt-3' : ''} ${
            drag ? 'border-gold-500 bg-gold-50' : 'border-ink-900/15 bg-sand/40'
          }`}
        >
          {busy ? <Spinner className="h-7 w-7 text-gold-600" /> : <ImagePlus className="h-7 w-7 text-gold-600" strokeWidth={1.6} />}
          <p className="mt-2 text-sm font-semibold text-ink-700">{busy ? 'Uploading and optimising…' : 'Drag photos here, or'}</p>
          <button type="button" className="btn btn-light btn-sm mt-3" onClick={() => inputRef.current?.click()} disabled={busy}>
            {label}
          </button>
          <p className="mt-2 text-xs text-ink-400">JPG, PNG or WebP · up to 12 MB each · automatically compressed for fast loading</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple={!single} hidden onChange={(e) => upload(e.target.files)} />
        </div>
      )}
      {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------- list editor */
const SPAN = { 1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4', 6: 'sm:col-span-6' };

function ItemField({ field, value, onChange }) {
  let control;
  if (field.type === 'textarea') {
    control = <textarea className="input min-h-[84px] resize-y" value={value ?? ''} maxLength={field.max} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
  } else if (field.type === 'money') {
    control = <MoneyInput value={value} onChange={onChange} placeholder={field.placeholder} />;
  } else if (field.type === 'number') {
    control = (
      <input
        className="input"
        inputMode="numeric"
        value={value ?? ''}
        placeholder={field.placeholder}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
          onChange(v === '' ? null : Number(v));
        }}
      />
    );
  } else if (field.type === 'select') {
    control = (
      <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (field.type === 'icon') {
    control = (
      <select className="input" value={value || 'sparkles'} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(ICONS).map(([key, v]) => (
          <option key={key} value={key}>
            {v.label}
          </option>
        ))}
      </select>
    );
  } else {
    control = <input className="input" value={value ?? ''} maxLength={field.max} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <label className={`block ${SPAN[field.span || 6]}`}>
      <span className="label">{field.label}</span>
      {control}
      {field.hint && <span className="mt-1 block text-xs text-ink-400">{field.hint}</span>}
    </label>
  );
}

export function ListEditor({ items = [], onChange, fields, newItem = {}, addLabel = 'Add item', empty = 'Nothing added yet — this section stays hidden on the website.', max = 30 }) {
  const update = (i, key, value) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="rounded-xl border border-dashed border-ink-900/15 p-4 text-center text-sm text-ink-400">{empty}</p>}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-ink-900/10 bg-ivory/70 p-4">
          <div className="grid gap-3 sm:grid-cols-6">
            {fields.map((f) => (
              <ItemField key={f.key} field={f} value={item[f.key]} onChange={(v) => update(i, f.key, v)} />
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-1.5">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 bg-white disabled:opacity-40" aria-label="Move up">
              <ArrowUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid h-8 w-8 place-items-center rounded-lg border border-ink-900/10 bg-white disabled:opacity-40" aria-label="Move down">
              <ArrowDown className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => remove(i)} className="flex h-8 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-bold text-rose-700" aria-label="Remove">
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" disabled={items.length >= max} onClick={() => onChange([...items, { ...newItem }])} className="btn btn-light btn-sm">
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
