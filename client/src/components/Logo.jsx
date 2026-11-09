import { useSettings } from '../context/SettingsContext.jsx';

export default function Logo({ tone = 'light', size = 'md' }) {
  const { business } = useSettings();
  const initial = (business.name || 'P').trim().charAt(0).toUpperCase();
  const big = size === 'lg';
  return (
    <span className="flex items-center gap-3">
      <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-200 via-gold-500 to-gold-700 p-[1.5px] shadow-[0_8px_24px_-10px_rgba(197,154,61,.8)] ${big ? 'h-14 w-14' : 'h-11 w-11'}`}>
        <span className={`grid h-full w-full place-items-center rounded-full bg-ink-950 font-display font-semibold text-gold-300 ${big ? 'text-2xl' : 'text-xl'}`}>{initial}</span>
      </span>
      <span className="leading-tight">
        <span className={`block font-display font-semibold tracking-[0.06em] ${big ? 'text-2xl' : 'text-[1.05rem]'} ${tone === 'light' ? 'text-white' : 'text-ink-950'}`}>
          {(business.name || 'Prem Housing').toUpperCase()}
        </span>
        <span className={`block text-[0.62rem] font-bold uppercase tracking-[0.32em] ${tone === 'light' ? 'text-gold-300' : 'text-gold-700'}`}>
          {[business.officeName, 'Mardan'].filter(Boolean).join(' · ')}
        </span>
      </span>
    </span>
  );
}
