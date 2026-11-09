import { useMemo, useState } from 'react';
import { ArrowLeftRight, Calculator, Info } from 'lucide-react';
import { formatPKR, formatRupees } from '../lib/format.js';
import { AREA_UNITS, MARLA_STANDARDS, convertArea, formatNumber } from '../lib/units.js';

const darkInput =
  'w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-[0.95rem] text-white placeholder:text-white/30 transition focus:border-gold-400 focus:outline-none focus:ring-4 focus:ring-gold-500/15';
const darkSelect = `${darkInput} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23e3c77f' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[position:right_0.9rem_center] bg-no-repeat pr-10`;
const darkLabel = 'mb-2 block text-xs font-bold tracking-wider text-white/60 uppercase';

export function InstallmentCalculator() {
  const [price, setPrice] = useState('5000000');
  const [downPct, setDownPct] = useState(20);
  const [months, setMonths] = useState(36);
  const [freq, setFreq] = useState('monthly');

  const r = useMemo(() => {
    const total = Math.max(Number(price) || 0, 0);
    const down = Math.round((total * downPct) / 100);
    const step = freq === 'quarterly' ? 3 : freq === 'half-yearly' ? 6 : 1;
    const count = Math.max(1, Math.floor(months / step));
    const each = Math.round((total - down) / count);
    return { total, down, count, each };
  }, [price, downPct, months, freq]);

  const downShare = r.total ? (r.down / r.total) * 100 : 0;

  return (
    <div className="glass flex h-full flex-col rounded-[1.75rem] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950">
          <Calculator className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-2xl text-white">Installment calculator</h3>
          <p className="text-sm text-white/50">Estimate your down payment and installments</p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={darkLabel}>Total price (PKR)</span>
          <input className={darkInput} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, '').slice(0, 12))} placeholder="e.g. 5000000" />
          <span className="mt-1.5 block text-sm font-semibold text-gold-300">{r.total ? formatPKR(r.total) : 'Enter an amount'}</span>
        </label>
        <label className="block sm:col-span-2">
          <span className={`${darkLabel} flex justify-between`}>
            <span>Down payment</span>
            <span className="text-gold-300">{downPct}%</span>
          </span>
          <input type="range" min="0" max="60" step="5" value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} className="w-full accent-gold-500" />
        </label>
        <label className="block">
          <span className={darkLabel}>Duration</span>
          <select className={darkSelect} value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            {[6, 12, 18, 24, 30, 36, 48, 60].map((m) => (
              <option key={m} value={m} className="text-ink-900">
                {m} months{m % 12 === 0 ? ` (${m / 12} yr${m > 12 ? 's' : ''})` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={darkLabel}>Frequency</span>
          <select className={darkSelect} value={freq} onChange={(e) => setFreq(e.target.value)}>
            <option value="monthly" className="text-ink-900">
              Monthly
            </option>
            <option value="quarterly" className="text-ink-900">
              Quarterly
            </option>
            <option value="half-yearly" className="text-ink-900">
              Half-yearly
            </option>
          </select>
        </label>
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="bg-gradient-to-r from-gold-300 to-gold-500 transition-all duration-500" style={{ width: `${downShare}%` }} />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-semibold text-white/50">Down payment</dt>
            <dd className="mt-1 font-display text-xl text-white">{formatRupees(r.down)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-white/50">
              {r.count} × {freq === 'monthly' ? 'monthly' : freq === 'quarterly' ? 'quarterly' : 'half-yearly'}
            </dt>
            <dd className="mt-1 font-display text-xl text-gold-300">{formatRupees(r.each)}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 flex gap-2 text-xs leading-relaxed text-white/45">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        An interest-free estimate only. Actual payment plans are set by the site office.
      </p>
    </div>
  );
}

export function AreaConverter() {
  const [value, setValue] = useState('10');
  const [unit, setUnit] = useState('marla');
  const [standard, setStandard] = useState(225);
  const result = convertArea(value, unit, standard);

  return (
    <div className="glass flex h-full flex-col rounded-[1.75rem] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950">
          <ArrowLeftRight className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-2xl text-white">Area converter</h3>
          <p className="text-sm text-white/50">Marla, Kanal, square feet and more</p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={darkLabel}>Area</span>
          <input className={darkInput} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, '').slice(0, 12))} />
        </label>
        <label className="block">
          <span className={darkLabel}>Unit</span>
          <select className={darkSelect} value={unit} onChange={(e) => setUnit(e.target.value)}>
            {AREA_UNITS.map((u) => (
              <option key={u.value} value={u.value} className="text-ink-900">
                {u.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className={darkLabel}>Marla standard</span>
          <select className={darkSelect} value={standard} onChange={(e) => setStandard(Number(e.target.value))}>
            {MARLA_STANDARDS.map((s) => (
              <option key={s.value} value={s.value} className="text-ink-900">
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
        {AREA_UNITS.map((u) => (
          <div key={u.value} className={`p-4 ${u.value === unit ? 'bg-gold-500/15' : 'bg-ink-950/60'}`}>
            <dt className="text-xs font-semibold text-white/50">{u.label}</dt>
            <dd className={`mt-1 font-display text-lg ${u.value === unit ? 'text-gold-300' : 'text-white'}`}>{result ? formatNumber(result[u.value]) : '—'}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 flex gap-2 text-xs leading-relaxed text-white/45">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        1 Kanal = 20 Marla. The size of a Marla is not the same everywhere, so confirm which standard applies to your plot with the site office.
      </p>
    </div>
  );
}
