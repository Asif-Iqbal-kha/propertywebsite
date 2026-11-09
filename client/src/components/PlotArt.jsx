import { useId } from 'react';
import { TYPE_LABELS, areaLabel } from '../lib/format.js';

/**
 * Elegant generated graphic used when a listing has no photos yet.
 * Purely decorative: it shows the size label, never invented dimensions.
 */
export default function PlotArt({ area, type, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const marla = area?.value ? (area.unit === 'kanal' ? area.value * 20 : area.unit === 'sqft' ? area.value / 225 : area.value) : 5;
  const scale = Math.min(1, 0.5 + Math.sqrt(Math.max(marla, 1)) / 10);
  const w = Math.round(118 * scale);
  const h = Math.round(186 * scale);
  const cx = 200;
  const top = 138 - h / 2;
  const left = cx - w / 2;
  const isBuilt = type === 'house' || type === 'apartment';
  const isCommercial = type === 'commercial-plot' || type === 'shop';
  const neighbourW = isCommercial ? w * 0.62 : w;

  return (
    <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${areaLabel(area)} ${TYPE_LABELS[type] || ''}`}>
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16223f" />
          <stop offset="1" stopColor="#070b16" />
        </linearGradient>
        <linearGradient id={`gd${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e2ae" />
          <stop offset=".55" stopColor="#c59a3d" />
          <stop offset="1" stopColor="#836226" />
        </linearGradient>
        <pattern id={`gr${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#ffffff" strokeOpacity=".04" />
        </pattern>
      </defs>

      <rect width="400" height="300" fill={`url(#bg${uid})`} />
      <rect width="400" height="300" fill={`url(#gr${uid})`} />
      <circle cx="320" cy="40" r="140" fill="#c59a3d" fillOpacity=".07" />

      {/* road */}
      <rect x="0" y="248" width="400" height="34" fill="#1b2747" />
      <path d="M0 265H400" stroke="#c59a3d" strokeOpacity=".45" strokeDasharray="10 10" />

      {/* neighbouring plots */}
      {[-2, -1, 1, 2].map((k) => {
        const x = k < 0 ? left + k * (neighbourW + 8) : left + w + 8 + (k - 1) * (neighbourW + 8);
        return <rect key={k} x={x} y={top} width={neighbourW} height={h} rx="3" fill="none" stroke="#ffffff" strokeOpacity=".09" />;
      })}

      {/* main plot */}
      <rect x={left} y={top} width={w} height={h} rx="4" fill="#c59a3d" fillOpacity=".09" stroke={`url(#gd${uid})`} strokeWidth="1.6" />
      <rect x={left + 9} y={top + 9} width={w - 18} height={h - 26} rx="2" fill="none" stroke="#e3c77f" strokeOpacity=".35" strokeDasharray="4 4" />

      {isBuilt && (
        <path
          d={`M${cx - 26} ${top + h * 0.42} L${cx} ${top + h * 0.26} L${cx + 26} ${top + h * 0.42} V${top + h * 0.62} H${cx - 26} Z M${cx - 7} ${top + h * 0.62} V${top + h * 0.5} H${cx + 7} V${top + h * 0.62}`}
          fill="none"
          stroke="#e3c77f"
          strokeOpacity=".7"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      )}

      {/* depth marker (no numbers — decorative only) */}
      <g stroke="#e3c77f" strokeOpacity=".55" strokeWidth="1">
        <path d={`M${left - 14} ${top}V${top + h}`} />
        <path d={`M${left - 18} ${top}H${left - 10}M${left - 18} ${top + h}H${left - 10}`} />
      </g>

      {/* labels */}
      <text x={cx} y={isBuilt ? top + h * 0.82 : 138} textAnchor="middle" fill="#f6e3a6" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }} fontSize="26">
        {areaLabel(area) || 'Plot'}
      </text>
      <text x={cx} y={(isBuilt ? top + h * 0.82 : 138) + 22} textAnchor="middle" fill="#ffffff" fillOpacity=".55" fontSize="10" letterSpacing="3" style={{ fontWeight: 700 }}>
        {(TYPE_LABELS[type] || 'Property').toUpperCase()}
      </text>

      {/* compass */}
      <g transform="translate(366 34)">
        <circle r="13" fill="none" stroke="#c59a3d" strokeOpacity=".5" />
        <path d="M0 -9 L3.5 2 L0 0 L-3.5 2Z" fill="#e3c77f" />
        <text y="-17" textAnchor="middle" fill="#e3c77f" fillOpacity=".8" fontSize="8" style={{ fontWeight: 800 }}>
          N
        </text>
      </g>
    </svg>
  );
}
