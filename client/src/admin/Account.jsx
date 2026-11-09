import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { api } from '../lib/api.js';
import { Spinner } from '../components/ui.jsx';
import { useAuth } from './AdminApp.jsx';
import { Field, PageTitle, Panel, useToast } from './kit.jsx';

export default function Account() {
  const { user } = useAuth();
  const notify = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (form.next.length < 8) return notify('The new password must be at least 8 characters.', 'error');
    if (form.next !== form.confirm) return notify('The new passwords do not match.', 'error');
    setBusy(true);
    try {
      await api('/api/auth/password', { method: 'POST', body: { current: form.current, next: form.next } });
      setForm({ current: '', next: '', confirm: '' });
      notify('Password changed. Other devices have been signed out.');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="Account" description={`Signed in as ${user?.email}`} />
      <Panel title="Change password" className="max-w-xl">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Current password">
            <input className="input" type="password" autoComplete="current-password" required value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
          </Field>
          <Field label="New password" hint="At least 8 characters.">
            <input className="input" type="password" autoComplete="new-password" required minLength={8} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
          </Field>
          <Field label="Confirm new password">
            <input className="input" type="password" autoComplete="new-password" required minLength={8} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </Field>
          <button type="submit" disabled={busy} className="btn btn-gold btn-sm">
            {busy ? <Spinner className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />} Update password
          </button>
        </form>
      </Panel>
    </>
  );
}
