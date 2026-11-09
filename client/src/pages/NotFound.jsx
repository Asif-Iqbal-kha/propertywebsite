import { Link } from 'react-router';
import { ArrowRight, House } from 'lucide-react';
import Seo from '../components/Seo.jsx';

export default function NotFound({ title = 'Page not found', text = 'The page you are looking for does not exist or has moved.' }) {
  return (
    <>
      <Seo title={title} noindex />
      <section className="relative grid min-h-[85vh] place-items-center overflow-hidden bg-ink-950 px-4 pt-28 pb-16 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="pointer-events-none absolute inset-0 bg-grid-faint" />
        <div className="relative max-w-xl">
          <p className="text-gold-gradient font-display text-[7rem] leading-none font-semibold sm:text-[9rem]">404</p>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-4 text-white/60">{text}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn btn-gold">
              <House className="h-4 w-4" /> Back home
            </Link>
            <Link to="/properties" className="btn btn-glass">
              Browse properties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
