import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { ExternalLink, Images, Inbox, LandPlot, LayoutDashboard, LogOut, Menu, Settings, UserRound, X } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { api } from '../lib/api.js';
import { useAuth } from './AdminApp.jsx';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/properties', label: 'Properties', icon: LandPlot },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox, badge: true },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/settings', label: 'Site content', icon: Settings },
  { to: '/admin/account', label: 'Account', icon: UserRound },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const refreshStats = useCallback(() => {
    api('/api/admin/stats')
      .then((s) => setNewCount(s.inquiries.new))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshStats();
    setOpen(false);
  }, [pathname, refreshStats]);

  async function signOut() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="px-5 py-6">
        <Logo />
      </Link>
      <nav aria-label="Admin" className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Ico, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isActive ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-200 ring-1 ring-gold-500/30' : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Ico className="h-[18px] w-[18px]" />
            {label}
            {badge && newCount > 0 && <span className="ml-auto rounded-full bg-gold-500 px-2 py-0.5 text-[0.7rem] font-extrabold text-ink-950">{newCount}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" /> View website
        </a>
        <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white">
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
        <p className="truncate px-3.5 pt-2 text-xs text-white/35">{user?.email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f5f3ed]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink-950 lg:block">{sidebar}</aside>

      <div className={`fixed inset-0 z-50 lg:hidden ${open ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-ink-950/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 bg-ink-950 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <button type="button" onClick={() => setOpen(false)} className="absolute top-6 right-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
          {sidebar}
        </aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-900/10 bg-[#f5f3ed]/90 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-ink-900/10 bg-white" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg text-ink-950">Office Admin</span>
          <span className="w-10" />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet context={{ refreshStats }} />
        </main>
      </div>
    </div>
  );
}
