// Charts written inside a post as a ```chart code block holding JSON.
// Grey first; the accent marks only what the title is about.

function fmt(v, unit = '', decimals) {
  if (v === null || v === undefined || Number.isNaN(v)) return '';
  const d = decimals ?? (Math.abs(v) < 10 && v % 1 !== 0 ? 1 : v % 1 !== 0 ? 1 : 0);
  const s = Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (unit === '%') return `${s}%`;
  if (unit === 'x') return `${s}x`;
  if (unit) return `${s} ${unit}`;
  return s;
}

function BarChart({ spec }) {
  const data = spec.data || [];
  const rowH = 30;
  const labelW = 150;
  const width = 680;
  const plotW = width - labelW - 70;
  const max = Math.max(...data.map((d) => d.value), spec.reference?.value || 0) || 1;
  const height = data.length * rowH + 10;
  const x = (v) => labelW + (Math.max(0, v) / max) * plotW;
  return (
    <svg viewBox={`0 0 ${width} ${height + (spec.reference ? 18 : 0)}`} role="img" aria-label={spec.title}>
      {data.map((d, i) => {
        const hi = spec.highlight ? d.label === spec.highlight : false;
        const y = i * rowH + 4;
        return (
          <g key={d.label}>
            <text x={labelW - 12} y={y + 15} textAnchor="end" fontSize="13" fill="var(--text)">
              {d.label}
            </text>
            <rect
              x={labelW}
              y={y + 3}
              width={Math.max(1, x(d.value) - labelW)}
              height={rowH - 12}
              fill={hi ? 'var(--green)' : 'var(--rule-strong)'}
              rx="1"
            >
              <title>{`${d.label}: ${fmt(d.value, spec.unit, spec.decimals)}`}</title>
            </rect>
            <text x={x(d.value) + 8} y={y + 15} fontSize="13" fill={hi ? 'var(--green)' : 'var(--muted)'} fontWeight={hi ? 600 : 400}>
              {fmt(d.value, spec.unit, spec.decimals)}
            </text>
          </g>
        );
      })}
      {spec.reference ? (
        <g>
          <line
            x1={x(spec.reference.value)}
            x2={x(spec.reference.value)}
            y1={0}
            y2={height}
            stroke="var(--ink)"
            strokeDasharray="3 3"
            opacity="0.6"
          />
          <text x={x(spec.reference.value)} y={height + 14} fontSize="12" textAnchor="middle" fill="var(--muted)">
            {spec.reference.label} {fmt(spec.reference.value, spec.unit, spec.decimals)}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

function LineChart({ spec }) {
  const labels = spec.labels || [];
  const series = spec.series || [];
  const width = 680;
  const height = 300;
  const left = 44;
  const right = 150;
  const top = 16;
  const bottom = 34;
  const all = series.flatMap((s) => s.values).filter((v) => v !== null && v !== undefined);
  if (spec.reference) all.push(spec.reference.value);
  let min = Math.min(...all);
  let max = Math.max(...all);
  if (spec.zero !== false) min = Math.min(0, min);
  const pad = (max - min) * 0.08 || 1;
  max += pad;
  if (spec.zero === false) min -= pad;
  const x = (i) => left + (i / Math.max(1, labels.length - 1)) * (width - left - right);
  const y = (v) => top + (1 - (v - min) / (max - min)) * (height - top - bottom);
  const gridVals = [];
  const step = niceStep((max - min) / 4);
  for (let g = Math.ceil(min / step) * step; g <= max; g += step) gridVals.push(+g.toFixed(6));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={spec.title}>
      {gridVals.map((g) => (
        <g key={g}>
          <line x1={left} x2={width - right} y1={y(g)} y2={y(g)} stroke="var(--rule)" />
          <text x={left - 8} y={y(g) + 4} fontSize="11" textAnchor="end" fill="var(--faint)">
            {fmt(g, '', step >= 1 ? 0 : step >= 0.1 ? 1 : 2)}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={l} x={x(i)} y={height - 10} fontSize="12" textAnchor="middle" fill="var(--muted)">
          {l}
        </text>
      ))}
      {spec.reference ? (
        <g>
          <line x1={left} x2={width - right} y1={y(spec.reference.value)} y2={y(spec.reference.value)} stroke="var(--ink)" strokeDasharray="3 3" opacity="0.55" />
          <text x={width - right + 8} y={y(spec.reference.value) + 4} fontSize="12" fill="var(--muted)">
            {spec.reference.label}
          </text>
        </g>
      ) : null}
      {(spec.markers || []).map((m) => {
        const i = labels.indexOf(m.at);
        if (i < 0) return null;
        return (
          <g key={m.at}>
            <line x1={x(i)} x2={x(i)} y1={top} y2={height - bottom} stroke="var(--ink)" strokeDasharray="3 3" opacity="0.55" />
            <text x={x(i) + 6} y={height - bottom - 8} fontSize="12" fill="var(--muted)">
              {m.label}
            </text>
          </g>
        );
      })}
      {lineSeries(spec, series, x, y).map((s) => (
        <g key={s.name}>
          <polyline
            points={s.pts.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width}
            strokeLinejoin="round"
          />
          {s.values.map((v, i) =>
            v === null || v === undefined ? null : (
              <circle key={i} cx={x(i)} cy={y(v)} r={s.hi ? 3 : 2.2} fill={s.color}>
                <title>{`${s.name}, ${labels[i]}: ${fmt(v, spec.unit, spec.decimals)}`}</title>
              </circle>
            )
          )}
          <text x={s.labelX} y={s.labelY} fontSize="12" fill={s.hi ? 'var(--green)' : s.second ? 'var(--ink)' : 'var(--muted)'} fontWeight={s.hi || s.second ? 600 : 400}>
            {s.name} {s.end ?? ''}
          </text>
        </g>
      ))}
    </svg>
  );
}

// The highlighted series is green, an optional "secondary" series is ink, the
// rest are grey. End labels that would collide are pushed apart.
function lineSeries(spec, series, x, y) {
  const out = series
    .map((s) => {
      const hi = spec.highlight ? s.name === spec.highlight : series.length === 1;
      const second = !hi && spec.secondary === s.name;
      const pts = s.values.map((v, i) => (v === null || v === undefined ? null : [x(i), y(v)])).filter(Boolean);
      if (!pts.length) return null;
      const end = pts[pts.length - 1];
      return {
        ...s,
        hi,
        second,
        pts,
        color: hi ? 'var(--green)' : second ? 'var(--ink)' : 'var(--faint)',
        width: hi ? 2.25 : second ? 1.75 : 1.5,
        labelX: end[0] + 8,
        labelY: end[1] + 4,
      };
    })
    .filter(Boolean);
  const byPos = [...out].sort((a, b) => a.labelY - b.labelY);
  for (let i = 1; i < byPos.length; i++) {
    const prev = byPos[i - 1];
    const cur = byPos[i];
    if (Math.abs(cur.labelX - prev.labelX) < 40 && cur.labelY - prev.labelY < 14) cur.labelY = prev.labelY + 14;
  }
  return out;
}

function niceStep(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / p;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p;
}

export default function Chart({ source }) {
  let spec;
  try {
    spec = JSON.parse(source);
  } catch {
    return <pre className="chart__source">Chart data could not be read. Check the JSON in this block.</pre>;
  }
  return (
    <figure className="chart">
      {spec.title ? <p className="chart__title">{spec.title}</p> : null}
      {spec.subtitle ? <p className="chart__sub">{spec.subtitle}</p> : null}
      {spec.type === 'line' ? <LineChart spec={spec} /> : <BarChart spec={spec} />}
      {spec.source ? <figcaption className="chart__source">{spec.source}</figcaption> : null}
    </figure>
  );
}
