import { useState } from 'react';
import { CalendarCheck, CircleCheck, MessageSquareText, Phone, Send } from 'lucide-react';
import { api } from '../lib/api.js';
import { telHref, waHref } from '../lib/contact.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { WhatsAppIcon } from './BrandIcons.jsx';
import { Spinner } from './ui.jsx';

function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function InquiryForm({ property = null, defaultKind = 'general', compact = false }) {
  const { business } = useSettings();
  const defaultMessage = property ? `I'm interested in "${property.title}" (${property.ref}). Please share the details.` : '';
  const [kind, setKind] = useState(defaultKind === 'visit' ? 'visit' : 'general');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: defaultMessage, visitDate: '', preferredContact: 'call', website: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const waText = [
    `Assalam o Alaikum, my name is ${form.name || '…'}.`,
    kind === 'visit' ? `I would like to book a site visit${form.visitDate ? ` on ${form.visitDate}` : ''}.` : '',
    form.message,
  ]
    .filter(Boolean)
    .join(' ');

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await api('/api/inquiries', {
        method: 'POST',
        body: { ...form, kind, propertyId: property?._id, page: window.location.pathname },
      });
      setStatus('sent');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CircleCheck className="h-8 w-8" />
        </span>
        <h3 className="mt-5 font-display text-2xl text-ink-950">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          Your {kind === 'visit' ? 'visit request' : 'message'} has been sent to the {business.name} site office. For an immediate answer, call the office directly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={telHref(business.phone)} className="btn btn-dark btn-sm">
            <Phone className="h-4 w-4" /> {business.phoneDisplay}
          </a>
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={() => {
              setStatus('idle');
              setForm((f) => ({ ...f, message: defaultMessage, visitDate: '' }));
            }}
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate={false}>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-sand p-1" role="tablist" aria-label="Request type">
        {[
          ['general', 'Send inquiry', MessageSquareText],
          ['visit', 'Book a visit', CalendarCheck],
        ].map(([value, label, Ico]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={kind === value}
            onClick={() => setKind(value)}
            className={`flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-bold transition ${
              kind === value ? 'bg-ink-950 text-white shadow' : 'text-ink-600 hover:text-ink-950'
            }`}
          >
            <Ico className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className={`grid gap-4 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <label className="block">
          <span className="label">Full name *</span>
          <input className="input" required minLength={2} maxLength={80} autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" />
        </label>
        <label className="block">
          <span className="label">Phone / WhatsApp *</span>
          <input
            className="input"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            pattern="\+?[\d\s\(\)\-]{7,20}"
            value={form.phone}
            onChange={set('phone')}
            placeholder="03XX XXXXXXX"
          />
        </label>
      </div>

      <div className={`grid gap-4 ${compact || kind !== 'visit' ? '' : 'sm:grid-cols-2'}`}>
        <label className="block">
          <span className="label">Email (optional)</span>
          <input className="input" type="email" autoComplete="email" maxLength={120} value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </label>
        {kind === 'visit' && (
          <label className="block">
            <span className="label">Preferred visit date</span>
            <input className="input" type="date" min={today()} value={form.visitDate} onChange={set('visitDate')} />
          </label>
        )}
      </div>

      <label className="block">
        <span className="label">Message</span>
        <textarea
          className="input min-h-[110px] resize-y"
          maxLength={2000}
          value={form.message}
          onChange={set('message')}
          placeholder={kind === 'visit' ? 'Anything we should know before your visit?' : 'Which plot size, budget or block are you interested in?'}
        />
      </label>

      <fieldset>
        <legend className="label">Best way to reach you</legend>
        <div className="flex gap-2">
          {[
            ['call', 'Phone call'],
            ['whatsapp', 'WhatsApp'],
          ].map(([value, label]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                form.preferredContact === value ? 'border-gold-500 bg-gold-50 text-ink-950' : 'border-ink-900/10 text-ink-600'
              }`}
            >
              <input type="radio" name="preferredContact" value={value} checked={form.preferredContact === value} onChange={set('preferredContact')} className="accent-gold-600" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Honeypot (hidden from people, attractive to bots) */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </label>
      </div>

      {status === 'error' && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <button type="submit" disabled={status === 'sending'} className="btn btn-gold flex-1">
          {status === 'sending' ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {kind === 'visit' ? 'Request visit' : 'Send message'}
        </button>
        <a href={waHref(business.whatsapp, waText)} target="_blank" rel="noreferrer" className="btn btn-whatsapp flex-1">
          <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp
        </a>
      </div>
      <p className="text-center text-xs text-ink-400">Your details are shared only with the {business.name} site office.</p>
    </form>
  );
}
