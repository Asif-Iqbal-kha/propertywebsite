import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ExternalLink, Plus, Save, Sparkles, X } from 'lucide-react';
import { api, invalidate } from '../lib/api.js';
import { FEATURE_PRESETS, TYPE_LABELS, TYPE_OPTIONS, areaLabel, formatRupees } from '../lib/format.js';
import { Spinner } from '../components/ui.jsx';
import { Field, ImageUploader, MoneyInput, PageTitle, Panel, Toggle, useToast } from './kit.jsx';

const EMPTY = {
  title: '',
  purpose: 'sale',
  type: 'residential-plot',
  status: 'available',
  featured: false,
  isSample: false,
  area: { value: '', unit: 'marla' },
  price: null,
  installment: { available: false, downPayment: null, amount: null, count: null, frequency: 'monthly' },
  location: { block: '', phase: '', street: '', plotNo: '', address: '' },
  bedrooms: null,
  bathrooms: null,
  features: [],
  description: '',
  images: [],
};

function fromServer(p) {
  return {
    ...EMPTY,
    ...p,
    area: { ...EMPTY.area, ...p.area, value: p.area?.value ?? '' },
    installment: { ...EMPTY.installment, ...p.installment },
    location: { ...EMPTY.location, ...p.location },
    features: p.features || [],
    images: p.images || [],
  };
}

const intOrNull = (v) => {
  const s = String(v).replace(/[^\d]/g, '').slice(0, 4);
  return s === '' ? null : Number(s);
};

export default function PropertyForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [custom, setCustom] = useState('');

  useEffect(() => {
    if (isNew) return;
    api(`/api/admin/properties/${id}`)
      .then(({ property }) => setForm(fromServer(property)))
      .catch((e) => {
        notify(e.message, 'error');
        navigate('/admin/properties', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, isNew, navigate, notify]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setIn = (group, key, value) => setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  const toggleFeature = (feat) => set('features', form.features.includes(feat) ? form.features.filter((x) => x !== feat) : [...form.features, feat]);

  const isBuilt = form.type === 'house' || form.type === 'apartment';
  const inst = form.installment;
  const suggestedInstallment = form.price && inst.count ? Math.round((form.price - (inst.downPayment || 0)) / inst.count) : null;

  function suggestTitle() {
    const size = areaLabel({ value: Number(form.area.value), unit: form.area.unit });
    const where = form.location.block ? ` in ${form.location.block}` : '';
    const purpose = form.purpose === 'rent' ? ' for Rent' : '';
    set('title', `${size ? `${size} ` : ''}${TYPE_LABELS[form.type]}${purpose}${where}`.trim());
  }

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim()) return notify('Please add a title.', 'error');
    if (!Number(form.area.value)) return notify('Please enter the size.', 'error');
    setSaving(true);
    try {
      const body = { ...form, area: { ...form.area, value: Number(form.area.value) } };
      const res = isNew ? await api('/api/admin/properties', { method: 'POST', body }) : await api(`/api/admin/properties/${id}`, { method: 'PUT', body });
      invalidate('/api/properties');
      notify(isNew ? `Listing ${res.property.ref} published` : 'Changes saved');
      navigate('/admin/properties');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner className="h-8 w-8 text-gold-600" />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="pb-24">
      <Link to="/admin/properties" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-950">
        <ArrowLeft className="h-4 w-4" /> All properties
      </Link>
      <PageTitle
        title={isNew ? 'Add listing' : 'Edit listing'}
        description={isNew ? 'Only publish details you have confirmed.' : `${form.ref} · ${form.views ?? 0} views`}
        actions={
          !isNew && (
            <a href={`/properties/${form.slug}`} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">
              <ExternalLink className="h-4 w-4" /> View on website
            </a>
          )
        }
      />

      <div className="space-y-6">
        <Panel title="Basics">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Purpose">
              <select className="input" value={form.purpose} onChange={(e) => set('purpose', e.target.value)}>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
              </select>
            </Field>
            <Field label="Property type">
              <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="sold">Sold</option>
              </select>
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
            <Field label="Size *">
              <input
                className="input"
                inputMode="decimal"
                value={form.area.value}
                onChange={(e) => setIn('area', 'value', e.target.value.replace(/[^\d.]/g, '').slice(0, 9))}
                placeholder="e.g. 10"
                required
              />
            </Field>
            <Field label="Unit">
              <select className="input" value={form.area.unit} onChange={(e) => setIn('area', 'unit', e.target.value)}>
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
                <option value="sqft">Square feet</option>
              </select>
            </Field>
            <Field label="Title *" hint="Shown on cards and search results.">
              <div className="flex gap-2">
                <input className="input" value={form.title} maxLength={140} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 10 Marla Corner Plot" required />
                <button type="button" onClick={suggestTitle} className="btn btn-light btn-sm shrink-0" title="Suggest a title">
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-6">
            <Toggle checked={form.featured} onChange={(v) => set('featured', v)} label="Featured" description="Show first on the home page" />
            {form.isSample && <Toggle checked={form.isSample} onChange={(v) => set('isSample', v)} label="Sample listing" description="Turn off once this listing is real" />}
          </div>
        </Panel>

        <Panel title="Price & payment">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={form.purpose === 'rent' ? 'Monthly rent (PKR)' : 'Price (PKR)'}>
              <MoneyInput value={form.price} onChange={(v) => set('price', v)} />
            </Field>
          </div>
          {form.purpose === 'sale' && (
            <div className="mt-5 rounded-xl border border-ink-900/10 bg-ivory/60 p-4">
              <Toggle checked={inst.available} onChange={(v) => setIn('installment', 'available', v)} label="Available on installments" description="Show an installment plan on the listing" />
              {inst.available && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Down payment (PKR)">
                    <MoneyInput value={inst.downPayment} onChange={(v) => setIn('installment', 'downPayment', v)} />
                  </Field>
                  <Field label="No. of installments">
                    <input className="input" inputMode="numeric" value={inst.count ?? ''} onChange={(e) => setIn('installment', 'count', intOrNull(e.target.value))} placeholder="e.g. 36" />
                  </Field>
                  <Field label="Frequency">
                    <select className="input" value={inst.frequency} onChange={(e) => setIn('installment', 'frequency', e.target.value)}>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half-yearly">Half-yearly</option>
                    </select>
                  </Field>
                  <Field label="Installment amount (PKR)">
                    <MoneyInput value={inst.amount} onChange={(v) => setIn('installment', 'amount', v)} />
                    {suggestedInstallment > 0 && suggestedInstallment !== inst.amount && (
                      <button type="button" onClick={() => setIn('installment', 'amount', suggestedInstallment)} className="mt-1 text-xs font-semibold text-ink-500 underline hover:text-ink-950">
                        Use {formatRupees(suggestedInstallment)} (price − down payment ÷ installments)
                      </button>
                    )}
                  </Field>
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Location">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Plot / house no.">
              <input className="input" value={form.location.plotNo} maxLength={30} onChange={(e) => setIn('location', 'plotNo', e.target.value)} />
            </Field>
            <Field label="Street">
              <input className="input" value={form.location.street} maxLength={60} onChange={(e) => setIn('location', 'street', e.target.value)} />
            </Field>
            <Field label="Block">
              <input className="input" value={form.location.block} maxLength={60} onChange={(e) => setIn('location', 'block', e.target.value)} placeholder="e.g. Block A" />
            </Field>
            <Field label="Phase">
              <input className="input" value={form.location.phase} maxLength={60} onChange={(e) => setIn('location', 'phase', e.target.value)} />
            </Field>
          </div>
          <Field label="Address / landmark (optional)" className="mt-4">
            <input className="input" value={form.location.address} maxLength={200} onChange={(e) => setIn('location', 'address', e.target.value)} />
          </Field>
        </Panel>

        <Panel title="Details">
          {isBuilt && (
            <div className="mb-4 grid gap-4 sm:grid-cols-4">
              <Field label="Bedrooms">
                <input className="input" inputMode="numeric" value={form.bedrooms ?? ''} onChange={(e) => set('bedrooms', intOrNull(e.target.value))} />
              </Field>
              <Field label="Bathrooms">
                <input className="input" inputMode="numeric" value={form.bathrooms ?? ''} onChange={(e) => set('bathrooms', intOrNull(e.target.value))} />
              </Field>
            </div>
          )}
          <span className="label">Features</span>
          <div className="flex flex-wrap gap-2">
            {[...new Set([...FEATURE_PRESETS, ...form.features])].map((feat) => {
              const on = form.features.includes(feat);
              return (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleFeature(feat)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${on ? 'border-gold-500 bg-gold-50 text-ink-950' : 'border-ink-900/10 bg-white text-ink-500 hover:border-ink-900/30'}`}
                >
                  {feat}
                  {on && !FEATURE_PRESETS.includes(feat) && <X className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex max-w-sm gap-2">
            <input
              className="input"
              value={custom}
              maxLength={40}
              placeholder="Add another feature"
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (custom.trim() && !form.features.includes(custom.trim())) set('features', [...form.features, custom.trim()]);
                  setCustom('');
                }
              }}
            />
            <button
              type="button"
              className="btn btn-light btn-sm shrink-0"
              onClick={() => {
                if (custom.trim() && !form.features.includes(custom.trim())) set('features', [...form.features, custom.trim()]);
                setCustom('');
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Field label="Description" className="mt-5" hint="Blank lines start a new paragraph.">
            <textarea className="input min-h-[160px] resize-y" maxLength={5000} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
        </Panel>

        <Panel title="Photos" description="The first photo is the cover. Use real photos of this property only.">
          <ImageUploader images={form.images} onChange={(images) => set('images', images)} />
        </Panel>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-900/10 bg-white/90 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link to="/admin/properties" className="btn btn-light btn-sm">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn btn-gold btn-sm">
            {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />} {isNew ? 'Publish listing' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
