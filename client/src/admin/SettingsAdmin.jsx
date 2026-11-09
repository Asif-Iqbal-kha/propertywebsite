import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Info, Save } from 'lucide-react';
import { api, invalidate } from '../lib/api.js';
import { useReplaceSettings } from '../context/SettingsContext.jsx';
import { Spinner } from '../components/ui.jsx';
import { Field, ImageUploader, ListEditor, PageTitle, Panel, useToast } from './kit.jsx';

const TABS = [
  ['business', 'Business & contact'],
  ['hero', 'Home page'],
  ['society', 'Society'],
  ['payment', 'Payment plans'],
  ['about', 'About'],
  ['city', 'Why Mardan'],
  ['guide', 'Buyer checklist'],
  ['seo', 'SEO'],
];

const FREQ_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-yearly' },
];

function Notice({ children }) {
  return (
    <div className="mb-5 flex gap-3 rounded-xl border border-gold-500/30 bg-gold-50 p-4 text-sm text-ink-700">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
      <div>{children}</div>
    </div>
  );
}

export default function SettingsAdmin() {
  const notify = useToast();
  const replaceSettings = useReplaceSettings();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'business';
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/api/settings')
      .then((s) => {
        setSaved(s);
        setDraft(structuredClone(s));
      })
      .catch((e) => notify(e.message, 'error'));
  }, [notify]);

  const dirty = useMemo(() => draft && saved && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!draft) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner className="h-8 w-8 text-gold-600" />
      </div>
    );
  }

  const set = (section, key, value) => setDraft((d) => ({ ...d, [section]: { ...d[section], [key]: value } }));
  const setSocial = (key, value) => setDraft((d) => ({ ...d, business: { ...d.business, socials: { ...d.business.socials, [key]: value } } }));
  const text = (section, key, props = {}) => (
    <input className="input" value={draft[section]?.[key] ?? ''} onChange={(e) => set(section, key, e.target.value)} {...props} />
  );
  const area = (section, key, props = {}) => (
    <textarea className="input min-h-[120px] resize-y" value={draft[section]?.[key] ?? ''} onChange={(e) => set(section, key, e.target.value)} {...props} />
  );

  async function save() {
    setSaving(true);
    try {
      const next = await api('/api/admin/settings', { method: 'PUT', body: draft });
      setSaved(next);
      setDraft(structuredClone(next));
      replaceSettings(next);
      invalidate('/api/settings');
      notify('Website content saved');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <PageTitle title="Site content" description="Everything visitors read on the website. Empty sections are hidden automatically." />

      <div className="scrollbar-none mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-ink-900/10">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setParams({ tab: key }, { replace: true })}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === key ? 'bg-ink-950 text-white' : 'text-ink-500 hover:text-ink-950'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'business' && (
        <Panel title="Business & contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name">{text('business', 'name', { maxLength: 60 })}</Field>
            <Field label="Office name">{text('business', 'officeName', { maxLength: 60 })}</Field>
            <Field label="Tagline" className="sm:col-span-2">
              {text('business', 'tagline', { maxLength: 120 })}
            </Field>
            <Field label="Phone (international format)" hint="Used for call buttons, e.g. +923429423521">
              {text('business', 'phone', { maxLength: 30 })}
            </Field>
            <Field label="Phone (as displayed)" hint="e.g. +92 342 9423521">
              {text('business', 'phoneDisplay', { maxLength: 30 })}
            </Field>
            <Field label="WhatsApp number" hint="Country code + number, digits only, e.g. 923429423521. Make sure this number uses WhatsApp.">
              {text('business', 'whatsapp', { maxLength: 20 })}
            </Field>
            <Field label="Email (optional)">{text('business', 'email', { maxLength: 120, type: 'email' })}</Field>
            <Field label="Site office address" className="sm:col-span-2" hint="Shown in the footer, contact and society pages.">
              {text('business', 'address', { maxLength: 200 })}
            </Field>
            <Field label="City / region">{text('business', 'city', { maxLength: 80 })}</Field>
            <Field label="Office hours" hint="e.g. Mon–Sat, 9:00 am – 6:00 pm">
              {text('business', 'officeHours', { maxLength: 120 })}
            </Field>
            <Field label="Map location" className="sm:col-span-2" hint="A place name or exact coordinates of the site office, e.g. 34.1986, 72.0404 (copy from Google Maps).">
              {text('business', 'mapQuery', { maxLength: 160 })}
            </Field>
          </div>
          <h3 className="mt-8 mb-3 font-display text-lg text-ink-950">Social media (optional)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {['facebook', 'instagram', 'youtube', 'tiktok'].map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
                <input className="input" placeholder="https://…" value={draft.business.socials?.[k] ?? ''} maxLength={200} onChange={(e) => setSocial(k, e.target.value)} />
              </Field>
            ))}
          </div>
        </Panel>
      )}

      {tab === 'hero' && (
        <Panel title="Home page hero">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Small heading (eyebrow)" className="sm:col-span-2">
              {text('hero', 'eyebrow', { maxLength: 80 })}
            </Field>
            <Field label="Headline">{text('hero', 'title', { maxLength: 80 })}</Field>
            <Field label="Highlighted words (gold)">{text('hero', 'highlight', { maxLength: 60 })}</Field>
            <Field label="Introduction" className="sm:col-span-2">
              {area('hero', 'subtitle', { maxLength: 400 })}
            </Field>
          </div>
          <h3 className="mt-8 mb-1 font-display text-lg text-ink-950">Background photo (optional)</h3>
          <p className="mb-3 text-sm text-ink-500">A real wide photo of the society. Without one, the hero shows the animated gold layout illustration.</p>
          <ImageUploader single images={draft.hero.image ? [draft.hero.image] : []} onChange={(imgs) => set('hero', 'image', imgs[0] || null)} label="Choose photo" />
        </Panel>
      )}

      {tab === 'society' && (
        <div className="space-y-6">
          <Notice>
            Publish <strong>verified information only</strong>, such as approval/NOC status, total area, location and amenities, exactly as stated in official documents. Leave a section empty rather than guessing; empty sections are hidden on the website.
          </Notice>
          <Panel title="Overview">
            <Field label="About the society" hint="Blank lines start a new paragraph.">
              {area('society', 'overview', { maxLength: 4000, className: 'input min-h-[200px] resize-y' })}
            </Field>
          </Panel>
          <Panel title="Key facts" description="Short label + value pairs, e.g. “Location” → “Mardan”.">
            <ListEditor
              items={draft.society.facts}
              onChange={(v) => set('society', 'facts', v)}
              newItem={{ label: '', value: '' }}
              addLabel="Add fact"
              fields={[
                { key: 'label', label: 'Label', span: 2, max: 60 },
                { key: 'value', label: 'Value', span: 4, max: 120 },
              ]}
            />
          </Panel>
          <Panel title="Amenities" description="Facilities that actually exist or are officially planned.">
            <ListEditor
              items={draft.society.amenities}
              onChange={(v) => set('society', 'amenities', v)}
              newItem={{ icon: 'sparkles', title: '', description: '' }}
              addLabel="Add amenity"
              fields={[
                { key: 'icon', label: 'Icon', type: 'icon', span: 2 },
                { key: 'title', label: 'Title', span: 4, max: 80 },
                { key: 'description', label: 'Description (optional)', type: 'textarea', max: 400 },
              ]}
            />
          </Panel>
          <Panel title="Master plan" description="Upload the official master plan image.">
            <ImageUploader single images={draft.society.masterPlan ? [draft.society.masterPlan] : []} onChange={(imgs) => set('society', 'masterPlan', imgs[0] || null)} label="Choose image" />
          </Panel>
        </div>
      )}

      {tab === 'payment' && (
        <div className="space-y-6">
          <Panel title="Introduction">
            <Field label="Intro text">{area('payment', 'intro', { maxLength: 600 })}</Field>
          </Panel>
          <Panel title="Payment plans" description="Shown as a table on the Payment Plans page.">
            <ListEditor
              items={draft.payment.plans}
              onChange={(v) => set('payment', 'plans', v)}
              newItem={{ title: '', totalPrice: null, downPayment: null, installmentAmount: null, installmentCount: null, frequency: 'monthly', possessionAmount: null, notes: '' }}
              addLabel="Add plan"
              fields={[
                { key: 'title', label: 'Plan name', span: 3, max: 80, placeholder: 'e.g. 5 Marla Residential' },
                { key: 'totalPrice', label: 'Total price (PKR)', type: 'money', span: 3 },
                { key: 'downPayment', label: 'Down payment (PKR)', type: 'money', span: 2 },
                { key: 'installmentAmount', label: 'Installment (PKR)', type: 'money', span: 2 },
                { key: 'installmentCount', label: 'No. of installments', type: 'number', span: 2 },
                { key: 'frequency', label: 'Frequency', type: 'select', options: FREQ_OPTIONS, span: 2 },
                { key: 'possessionAmount', label: 'On possession (PKR)', type: 'money', span: 2 },
                { key: 'notes', label: 'Notes (optional)', span: 2, max: 300 },
              ]}
            />
          </Panel>
          <Panel title="Terms">
            <Field label="Terms & conditions (optional)">{area('payment', 'terms', { maxLength: 1500 })}</Field>
          </Panel>
        </div>
      )}

      {tab === 'about' && (
        <div className="space-y-6">
          <Panel title="About page">
            <Field label="Heading">{text('about', 'heading', { maxLength: 120 })}</Field>
            <Field label="Text" className="mt-4" hint="Blank lines start a new paragraph.">
              {area('about', 'body', { maxLength: 4000, className: 'input min-h-[200px] resize-y' })}
            </Field>
          </Panel>
          <Panel title="Services">
            <ListEditor
              items={draft.about.services}
              onChange={(v) => set('about', 'services', v)}
              newItem={{ icon: 'house', title: '', description: '' }}
              addLabel="Add service"
              max={6}
              fields={[
                { key: 'icon', label: 'Icon', type: 'icon', span: 2 },
                { key: 'title', label: 'Title', span: 4, max: 80 },
                { key: 'description', label: 'Description', type: 'textarea', max: 400 },
              ]}
            />
          </Panel>
        </div>
      )}

      {tab === 'city' && (
        <div className="space-y-6">
          <Notice>These facts were verified from Wikipedia (2023 Census figures). Keep the source line if you edit them.</Notice>
          <Panel title="Why Mardan">
            <Field label="Heading">{text('city', 'heading', { maxLength: 80 })}</Field>
            <Field label="Introduction" className="mt-4">
              {area('city', 'intro', { maxLength: 600 })}
            </Field>
          </Panel>
          <Panel title="Facts">
            <ListEditor
              items={draft.city.facts}
              onChange={(v) => set('city', 'facts', v)}
              newItem={{ value: '', label: '', detail: '' }}
              addLabel="Add fact"
              max={6}
              fields={[
                { key: 'value', label: 'Big value', span: 2, max: 30 },
                { key: 'label', label: 'Label', span: 4, max: 80 },
                { key: 'detail', label: 'Detail', max: 200 },
              ]}
            />
          </Panel>
          <Panel title="Source">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Source note">{text('city', 'sourceNote', { maxLength: 200 })}</Field>
              <Field label="Source link">{text('city', 'sourceUrl', { maxLength: 300 })}</Field>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'guide' && (
        <div className="space-y-6">
          <Panel title="Buyer checklist">
            <Field label="Heading">{text('guide', 'heading', { maxLength: 100 })}</Field>
          </Panel>
          <Panel title="Checklist items">
            <ListEditor
              items={draft.guide.items}
              onChange={(v) => set('guide', 'items', v)}
              newItem={{ title: '', body: '' }}
              addLabel="Add item"
              max={8}
              fields={[
                { key: 'title', label: 'Title', max: 100 },
                { key: 'body', label: 'Text', type: 'textarea', max: 500 },
              ]}
            />
          </Panel>
          <Panel title="Source">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Source note">{text('guide', 'sourceNote', { maxLength: 200 })}</Field>
              <Field label="Source link">{text('guide', 'sourceUrl', { maxLength: 300 })}</Field>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'seo' && (
        <Panel title="Search engines & link previews" description="How the home page appears on Google and when shared on WhatsApp or Facebook.">
          <Field label="Title" hint={`${(draft.seo.title || '').length}/80`}>
            {text('seo', 'title', { maxLength: 80 })}
          </Field>
          <Field label="Description" className="mt-4" hint={`${(draft.seo.description || '').length}/200`}>
            {area('seo', 'description', { maxLength: 200, className: 'input min-h-[90px] resize-y' })}
          </Field>
        </Panel>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-900/10 bg-white/90 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <span className={`text-sm font-semibold ${dirty ? 'text-amber-700' : 'text-ink-400'}`}>{dirty ? 'You have unsaved changes' : 'All changes saved'}</span>
          <div className="flex gap-2">
            {dirty && (
              <button type="button" className="btn btn-light btn-sm" onClick={() => setDraft(structuredClone(saved))}>
                Discard
              </button>
            )}
            <button type="button" onClick={save} disabled={saving || !dirty} className="btn btn-gold btn-sm">
              {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />} Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
