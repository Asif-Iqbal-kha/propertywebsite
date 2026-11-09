import { useEffect, useMemo, useRef } from 'react';

/* Deterministic pseudo-random generator so the illustration is identical on every load. */
function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Road centre-lines and widths (an abstract, illustrative layout — not a real master plan).
const X = [30, 175, 320, 465, 610];
const WX = [8, 12, 40, 12, 8];
const Y = [30, 170, 330, 490, 610];
const WY = [8, 12, 30, 12, 8];
const CENTER = { x: 320, y: 330 };
const KIND = {
  '0,1': 'park',
  '3,2': 'park',
  '0,2': 'plaza',
  '1,1': 'commercial',
  '2,1': 'commercial',
  '1,2': 'commercial',
  '2,2': 'commercial',
  '0,0': 'large',
  '3,3': 'large',
  '3,0': 'large',
};
const TARGET_WIDTH = { large: 30, medium: 21, commercial: 13 };

function buildPlan() {
  const rand = rng(11);
  const plots = [];
  const parks = [];
  const plazas = [];
  for (let i = 0; i < 4; i += 1) {
    for (let j = 0; j < 4; j += 1) {
      const x0 = X[i] + WX[i] / 2 + 5;
      const x1 = X[i + 1] - WX[i + 1] / 2 - 5;
      const y0 = Y[j] + WY[j] / 2 + 5;
      const y1 = Y[j + 1] - WY[j + 1] / 2 - 5;
      const kind = KIND[`${i},${j}`] || 'medium';
      const block = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };

      if (kind === 'park') {
        parks.push({
          ...block,
          trees: Array.from({ length: 18 }, () => ({
            x: x0 + 9 + rand() * (block.w - 18),
            y: y0 + 9 + rand() * (block.h - 18),
            r: 2.5 + rand() * 4.5,
          })),
        });
        continue;
      }
      if (kind === 'plaza') {
        plazas.push(block);
        continue;
      }

      const lane = 4;
      const rowH = (block.h - lane) / 2;
      const n = Math.max(2, Math.round(block.w / TARGET_WIDTH[kind]));
      const w = block.w / n;
      for (let r = 0; r < 2; r += 1) {
        for (let k = 0; k < n; k += 1) {
          const px = x0 + k * w + 1;
          const py = y0 + r * (rowH + lane) + 1;
          const pw = w - 2;
          const ph = rowH - 2;
          const nx = Math.max(px, Math.min(CENTER.x, px + pw));
          const ny = Math.max(py, Math.min(CENTER.y, py + ph));
          const dist = Math.hypot(nx - CENTER.x, ny - CENTER.y);
          if (dist < 54) continue;
          plots.push({ x: px, y: py, w: pw, h: ph, kind, dist, pulse: kind !== 'commercial' && rand() < 0.075 });
        }
      }
    }
  }

  const lights = [];
  for (let y = 22; y <= 618; y += 36) if (Math.abs(y - CENTER.y) > 56) lights.push({ x: CENTER.x, y });
  for (let x = 22; x <= 618; x += 36) if (Math.abs(x - CENTER.x) > 56) lights.push({ x, y: CENTER.y });

  return { plots, parks, plazas, lights };
}

export default function MasterPlanArt({ className = '' }) {
  const plan = useMemo(buildPlan, []);
  const ref = useRef(null);

  // Pause the subtle animations while the illustration is off-screen (saves battery).
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => el.classList.toggle('mp-paused', !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} viewBox="0 0 640 640" className={className} role="img" aria-label="Illustrative housing-society layout">
      <defs>
        <radialGradient id="mp-bg" cx="50%" cy="48%" r="72%">
          <stop offset="0" stopColor="#15223f" />
          <stop offset="1" stopColor="#070b16" />
        </radialGradient>
        <linearGradient id="mp-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e2ae" />
          <stop offset=".5" stopColor="#c59a3d" />
          <stop offset="1" stopColor="#836226" />
        </linearGradient>
      </defs>

      <rect width="640" height="640" rx="28" fill="url(#mp-bg)" />

      {/* roads */}
      <g stroke="#1d2a4a" fill="none" strokeLinecap="butt">
        {X.map((x, i) => (
          <path key={`x${x}`} d={`M${x} 10V630`} strokeWidth={WX[i]} pathLength="1" className="mp-road" style={{ '--d': `${i === 2 ? 0 : 350 + i * 110}ms` }} />
        ))}
        {Y.map((y, j) => (
          <path key={`y${y}`} d={`M10 ${y}H630`} strokeWidth={WY[j]} pathLength="1" className="mp-road" style={{ '--d': `${j === 2 ? 160 : 480 + j * 110}ms` }} />
        ))}
      </g>

      {/* green median on the main boulevard + dashed centre line on the avenue */}
      <g className="mp-fade" style={{ '--d': '1000ms' }}>
        <path d="M320 12V282M320 378V628" stroke="#1f5c4a" strokeWidth="7" />
        <path d="M12 330H272M368 330H628" stroke="#c59a3d" strokeOpacity=".35" strokeWidth="1" strokeDasharray="6 8" />
      </g>

      {/* parks */}
      {plan.parks.map((p, i) => (
        <g key={`park${i}`} className="mp-fade" style={{ '--d': `${1100 + i * 220}ms` }}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="12" fill="#123a31" stroke="#2f7d62" strokeOpacity=".7" />
          <path
            d={`M${p.x + 10} ${p.y + p.h - 14} Q ${p.x + p.w / 2} ${p.y + p.h / 2 - 30} ${p.x + p.w - 10} ${p.y + 16}`}
            fill="none"
            stroke="#e3c77f"
            strokeOpacity=".35"
            strokeWidth="2"
            strokeDasharray="1 5"
            strokeLinecap="round"
          />
          {p.trees.map((t, k) => (
            <circle key={k} cx={t.x} cy={t.y} r={t.r} fill={k % 3 ? '#2e8b6b' : '#43a883'} fillOpacity=".72" />
          ))}
        </g>
      ))}

      {/* central plaza with fountain */}
      {plan.plazas.map((p, i) => (
        <g key={`plaza${i}`} className="mp-fade" style={{ '--d': '1300ms' }}>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="12" fill="#0f182c" stroke="#c59a3d" strokeOpacity=".35" />
          <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r="34" fill="none" stroke="#c59a3d" strokeOpacity=".45" strokeDasharray="3 5" />
          <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r="20" fill="#123a31" stroke="#e3c77f" strokeOpacity=".7" />
          <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r="6" fill="#f0d892" fillOpacity=".85" />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={p.x + 12 + k * ((p.w - 36) / 3)} y={p.y + 10} width="12" height="12" rx="2" fill="#2e8b6b" fillOpacity=".55" />
          ))}
        </g>
      ))}

      {/* plots — fade in like a ripple from the centre */}
      <g strokeWidth=".8">
        {plan.plots.map((p, i) => (
          <rect
            key={i}
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            rx="1.5"
            fill="#c59a3d"
            fillOpacity={p.kind === 'commercial' ? 0.2 : 0.06}
            stroke="#d6b15a"
            strokeOpacity={p.kind === 'commercial' ? 0.8 : 0.5}
            className="mp-fade"
            style={{ '--d': `${750 + Math.round((p.dist / 460) * 1500)}ms` }}
          />
        ))}
        {plan.plots
          .filter((p) => p.pulse)
          .map((p, i) => (
            <rect key={`pulse${i}`} x={p.x} y={p.y} width={p.w} height={p.h} rx="1.5" fill="#f0d892" fillOpacity="0" className="mp-pulse" style={{ '--d': `${2600 + i * 430}ms` }} />
          ))}
      </g>

      {/* roundabout */}
      <g className="mp-fade" style={{ '--d': '420ms' }}>
        <circle cx={CENTER.x} cy={CENTER.y} r="46" fill="#1d2a4a" />
        <circle cx={CENTER.x} cy={CENTER.y} r="30" fill="#123a31" stroke="url(#mp-gold)" strokeWidth="1.6" />
        <circle cx={CENTER.x} cy={CENTER.y} r="12" fill="none" stroke="#e3c77f" strokeOpacity=".8" />
        <circle cx={CENTER.x} cy={CENTER.y} r="3.5" fill="#f6e3a6" />
      </g>

      {/* street lights */}
      <g fill="#f6e3a6">
        {plan.lights.map((l, i) => (
          <circle key={i} cx={l.x} cy={l.y} r="1.8" className="mp-light" style={{ '--d': `${(i % 7) * 380}ms` }} />
        ))}
      </g>

      {/* boundary */}
      <rect x="8" y="8" width="624" height="624" rx="24" fill="none" stroke="url(#mp-gold)" strokeOpacity=".6" strokeWidth="1.2" strokeDasharray="2 6" />
    </svg>
  );
}
