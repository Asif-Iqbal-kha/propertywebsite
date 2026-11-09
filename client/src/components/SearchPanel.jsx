import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { BUDGET_OPTIONS, SIZE_OPTIONS, TYPE_OPTIONS } from '../lib/format.js';
import { prefetchRoute } from '../routes.js';

export default function SearchPanel() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState('sale');
  const [type, setType] = useState('');
  const [size, setSize] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (purpose) params.set('purpose', purpose);
    if (type) params.set('type', type);
    if (size) params.set('size', size);
    if (maxPrice) params.set('maxPrice', maxPrice);
    navigate(`/properties?${params}`);
  }

  return (
    <form
      onSubmit={submit}
      onMouseEnter={() => prefetchRoute('/properties')}
      className="relative rounded-[1.75rem] bg-white p-3 shadow-[0_40px_80px_-30px_rgba(7,11,22,.55)] ring-1 ring-ink-900/5 sm:p-4"
    >
      <div className="mb-3 flex gap-1 px-1 pt-1">
        {[
          ['sale', 'Buy'],
          ['rent', 'Rent'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setPurpose(value)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${purpose === value ? 'bg-ink-950 text-white' : 'text-ink-500 hover:text-ink-950'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="block rounded-2xl bg-sand/70 px-4 py-2.5">
          <span className="block text-[0.68rem] font-extrabold tracking-[0.18em] text-gold-700 uppercase">Property type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-0.5 w-full appearance-none bg-transparent text-[0.95rem] font-semibold text-ink-950 outline-none">
            <option value="">All types</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block rounded-2xl bg-sand/70 px-4 py-2.5">
          <span className="block text-[0.68rem] font-extrabold tracking-[0.18em] text-gold-700 uppercase">Size</span>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="mt-0.5 w-full appearance-none bg-transparent text-[0.95rem] font-semibold text-ink-950 outline-none">
            <option value="">Any size</option>
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block rounded-2xl bg-sand/70 px-4 py-2.5">
          <span className="block text-[0.68rem] font-extrabold tracking-[0.18em] text-gold-700 uppercase">Max budget</span>
          <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="mt-0.5 w-full appearance-none bg-transparent text-[0.95rem] font-semibold text-ink-950 outline-none">
            <option value="">Any budget</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-gold h-full min-h-14 rounded-2xl px-8">
          <Search className="h-5 w-5" /> Search
        </button>
      </div>
    </form>
  );
}
