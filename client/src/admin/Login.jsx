import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { Spinner } from '../components/ui.jsx';
import { useAuth } from './AdminApp.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={location.state?.from || '/admin'} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink-950 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint" />
      <div className="animate-fade-up relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        <form onSubmit={submit} className="gold-frame space-y-5 p-7 sm:p-9">
          <div>
            <h1 className="font-display text-3xl text-white">Office sign in</h1>
            <p className="mt-1 text-sm text-white/50">Manage listings, inquiries and website content.</p>
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-white/60 uppercase">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/30 focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-white/60 uppercase">Password</span>
            <span className="relative block">
              <input
                type={show ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15 focus:outline-none"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/50 hover:text-white" aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>
          {error && <p className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-200">{error}</p>}
          <button type="submit" disabled={busy} className="btn btn-gold w-full">
            {busy ? <Spinner className="h-4 w-4" /> : <LogIn className="h-4 w-4" />} Sign in
          </button>
        </form>
        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50 hover:text-gold-300">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>
      </div>
    </div>
  );
}
