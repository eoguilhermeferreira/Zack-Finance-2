// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#1565E0', width = 160, height = 52 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    4 + ((1 - (v - min) / range) * (height - 8)),
  ]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length-1][0]} ${height} L0 ${height} Z`;
  const uid = color.replace(/[^a-z0-9]/gi, '');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spk-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spk-${uid})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
function LineChart({ data, keys, colors, labels, height = 220 }) {
  const pad = { top: 20, right: 20, bottom: 36, left: 52 };
  const W = 620, H = height;
  const allVals = data.flatMap(d => keys.map(k => d[k]));
  const maxV = Math.max(...allVals, 1);
  const minV = 0;
  const rng = maxV - minV;
  const xp = i => pad.left + i * (W - pad.left - pad.right) / Math.max(data.length - 1, 1);
  const yp = v => pad.top + (1 - (v - minV) / rng) * (H - pad.top - pad.bottom);
  const linePath = key => data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xp(i).toFixed(1)} ${yp(d[key]).toFixed(1)}`).join(' ');
  const areaPath = key => `${linePath(key)} L${xp(data.length-1).toFixed(1)} ${H - pad.bottom} L${xp(0).toFixed(1)} ${H - pad.bottom}Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => minV + t * rng);

  return (
    <div>
      {labels && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          {keys.map((k, i) => (
            <div key={k} className="legend-item">
              <span className="legend-dot" style={{ background: colors[i] }}/>
              <span style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600 }}>{labels[i]}</span>
            </div>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          {keys.map((k, i) => (
            <linearGradient key={k} id={`lg-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[i]} stopOpacity="0.15"/>
              <stop offset="100%" stopColor={colors[i]} stopOpacity="0"/>
            </linearGradient>
          ))}
        </defs>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.left} y1={yp(v)} x2={W - pad.right} y2={yp(v)}
              stroke="var(--line)" strokeWidth="1" strokeDasharray="4 4"/>
            <text x={pad.left - 8} y={yp(v) + 4} fontSize="10.5" fill="var(--text-3)" textAnchor="end">
              {v >= 1000 ? 'R$' + (v/1000).toFixed(0) + 'k' : v.toFixed(0)}
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={xp(i)} y={H - pad.bottom + 16} fontSize="11" fill="var(--text-3)" textAnchor="middle">
            {d.month}
          </text>
        ))}
        {keys.map((k, i) => <path key={k} d={areaPath(k)} fill={`url(#lg-${k})`}/>)}
        {keys.map((k, i) => (
          <path key={k} d={linePath(k)} fill="none" stroke={colors[i]} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        ))}
        {keys.map((k, i) => data.map((d, j) => (
          <circle key={`${k}-${j}`} cx={xp(j)} cy={yp(d[k])} r="4"
            fill="var(--surface)" stroke={colors[i]} strokeWidth="2.5"/>
        )))}
      </svg>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, keys, colors, labels, height = 220 }) {
  const pad = { top: 20, right: 20, bottom: 36, left: 52 };
  const W = 620, H = height;
  const allVals = data.flatMap(d => keys.map(k => d[k]));
  const maxV = Math.max(...allVals, 1);
  const yp = v => H - pad.bottom - (v / maxV) * (H - pad.top - pad.bottom);
  const bh = v => Math.max((v / maxV) * (H - pad.top - pad.bottom), 2);
  const groupW = (W - pad.left - pad.right) / data.length;
  const barW = groupW * 0.3;
  const barX = (i, ki) => pad.left + i * groupW + groupW * 0.1 + ki * (barW + 3);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => t * maxV);

  return (
    <div>
      {labels && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          {keys.map((k, i) => (
            <div key={k} className="legend-item">
              <span className="legend-dot" style={{ background: colors[i] }}/>
              <span style={{ color: 'var(--text-2)', fontSize: 12.5, fontWeight: 600 }}>{labels[i]}</span>
            </div>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.left} y1={yp(v)} x2={W - pad.right} y2={yp(v)}
              stroke="var(--line)" strokeWidth="1" strokeDasharray="4 4"/>
            <text x={pad.left - 8} y={yp(v) + 4} fontSize="10.5" fill="var(--text-3)" textAnchor="end">
              {v >= 1000 ? 'R$' + (v/1000).toFixed(0) + 'k' : v.toFixed(0)}
            </text>
          </g>
        ))}
        <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom}
          stroke="var(--line)" strokeWidth="1"/>
        {data.map((d, i) => (
          <g key={i}>
            {keys.map((k, ki) => (
              <rect key={k} x={barX(i, ki)} y={yp(d[k])} width={barW} height={bh(d[k])}
                rx="4" fill={colors[ki]} opacity="0.88"/>
            ))}
            <text x={pad.left + i * groupW + groupW / 2} y={H - pad.bottom + 16}
              fontSize="11" fill="var(--text-3)" textAnchor="middle">
              {d.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data, size = 180, thickness = 30, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = data.map(d => {
    const len = (d.value / total) * circ;
    const s = { ...d, len, offset };
    offset += len;
    return s;
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line-2)" strokeWidth={thickness}/>
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${Math.max(s.len - 2, 0)} ${circ}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"/>
        ))}
      </svg>
      {(centerLabel || centerValue) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {centerValue && <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>{centerValue}</span>}
          {centerLabel && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Donut with legend ────────────────────────────────────────────────────────
function DonutWithLegend({ data, size = 160, thickness = 28 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <DonutChart data={data} size={size} thickness={thickness}
        centerValue={fmt.brl(total, true)}
        centerLabel="total"/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{d.label}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span className="tabular" style={{ fontSize: 13, fontWeight: 600 }}>{fmt.brl(d.value)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{((d.value / total) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
