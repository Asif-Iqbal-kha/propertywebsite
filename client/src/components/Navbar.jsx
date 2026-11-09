import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Menu, Phone, X, ArrowUpRight } from 'lucide-react';
import Logo from './Logo.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { telHref, waHref } from '../lib/contact.js';
import { prefetchRoute } from '../routes.js';
import { WhatsAppIcon } from './BrandIcons.jsx';

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/society', label: 'Society' },
  { to: '/payment-plans', label: 'Payment Plans' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { business } = useSettings();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid ? 'border-b border-white/10 bg-ink-950/85 py-3 shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl' : 'border-b border-transparent py-5'
        }`}
      >
        <div className="container-x flex items-center justify-between gap-6">
          <Link to="/" aria-label={`${business.name} home`}>
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onMouseEnter={() => prefetchRoute(link.to)}
                onFocus={() => prefetchRoute(link.to)}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 text-[0.88rem] font-semibold transition-colors ${isActive ? 'text-gold-300' : 'text-white/75 hover:text-white'}`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute inset-x-3.5 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={telHref(business.phone)}
              className="hidden items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-2 pr-4 pl-2 text-sm font-semibold text-white transition hover:border-gold-300/60 md:flex"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950">
                <Phone className="h-4 w-4" />
              </span>
              {business.phoneDisplay}
            </a>
            <Link to="/contact?visit=1" className="btn btn-gold btn-sm hidden lg:inline-flex">
              Book a Visit
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu lives outside <header>: a backdrop-filter parent would trap position:fixed. */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[45] bg-ink-950 transition-opacity duration-500 xl:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-glow opacity-70" />
        <div className="container-x relative flex h-dvh flex-col pt-28 pb-8">
          <nav aria-label="Mobile" className="flex flex-col overflow-y-auto">
            {NAV_LINKS.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                tabIndex={open ? 0 : -1}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : '0ms' }}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-white/10 py-4 font-display text-[1.65rem] transition-all duration-500 ${
                    open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                  } ${isActive ? 'text-gold-300' : 'text-white'}`
                }
              >
                {link.label}
                <ArrowUpRight className="h-5 w-5 text-gold-400/70" />
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
            <a href={telHref(business.phone)} className="btn btn-gold" tabIndex={open ? 0 : -1}>
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={waHref(business.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-whatsapp" tabIndex={open ? 0 : -1}>
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
