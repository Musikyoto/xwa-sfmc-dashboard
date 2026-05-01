import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

const DEFAULT_VISIBLE = 10;

const GREEN  = '#16a34a';
const AMBER  = '#d97706';
const RED    = '#dc2626';

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Badge ────────────────────────────────────────────────────────────────
function computeBadge(data, dataKey, colorFn, benchmarkPill) {
  const colors = data.map((d) => colorFn(d[dataKey]));
  const greens = colors.filter((c) => c === GREEN).length;
  const ambers = colors.filter((c) => c === AMBER).length;
  const reds   = colors.filter((c) => c === RED).length;
  const n = data.length;

  if (greens === n) return { text: `All above benchmark`, color: GREEN };
  if (greens > n / 2) return { text: `Most above benchmark`, color: GREEN };
  if (reds === n)  return { text: 'All below benchmark', color: RED };
  if (reds > n / 2)   return { text: 'Most below benchmark', color: RED };

  const parts = [];
  if (greens > 0) parts.push(`${greens} above`);
  if (ambers > 0) parts.push(`${ambers} in range`);
  if (reds > 0)   parts.push(`${reds} below`);
  return { text: parts.join(' · '), color: AMBER };
}

// ── Tooltip ───────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const color = payload[0].fill;
  return (
    <div style={tooltipStyle}>
      <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: '18px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
        {val.toFixed(2)}%
      </p>
    </div>
  );
}

// ── Bar end label ─────────────────────────────────────────────────────────
function ValueLabel({ x, y, width, height, value }) {
  if (value == null) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy="0.35em"
      textAnchor="start"
      fontSize={12}
      fontWeight={600}
      fontFamily="Inter, sans-serif"
      fill="#9ca3af"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {Number(value).toFixed(2)}%
    </text>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function MetricChart({
  data,
  dataKey,
  benchmarkValue,
  benchmarkPill,
  legendItems = [],
  colorFn,
}) {
  const [expanded, setExpanded]   = useState(false);
  const [sortMode, setSortMode]   = useState('alpha'); // 'alpha' | 'perf'

  const sorted = [...data].sort((a, b) =>
    sortMode === 'alpha'
      ? a.name.localeCompare(b.name)
      : b[dataKey] - a[dataKey],
  );
  const visible = expanded ? sorted : sorted.slice(0, DEFAULT_VISIBLE);
  const hasMore = sorted.length > DEFAULT_VISIBLE;

  const maxVal = Math.max(...visible.map((d) => d[dataKey]), benchmarkValue) * 1.25;
  const chartHeight = visible.length * 46 + 16;
  const badge = computeBadge(data, dataKey, colorFn, benchmarkPill);

  return (
    <div style={styles.card}>
      {/* ── Summary badge + benchmark pill ── */}
      <div style={styles.headerRow}>
        <span
          style={{
            ...styles.badge,
            color: badge.color,
            background: hexAlpha(badge.color, 0.1),
            border: `1px solid ${hexAlpha(badge.color, 0.25)}`,
          }}
        >
          <span style={{ ...styles.badgeDot, background: badge.color }} />
          {badge.text}
        </span>
        <span
          style={{
            ...styles.benchmarkPill,
            color: '#9ca3af',
            background: 'rgba(75,85,99,0.15)',
            border: '1px solid rgba(75,85,99,0.2)',
          }}
        >
          {benchmarkPill}
        </span>
      </div>

      {/* ── Sort toggle ── */}
      <div style={styles.sortRow}>
        {[
          { key: 'alpha', label: 'A–Z' },
          { key: 'perf',  label: 'By Performance' },
        ].map((opt) => (
          <button
            key={opt.key}
            style={{
              ...styles.sortBtn,
              ...(sortMode === opt.key ? styles.sortBtnActive : {}),
            }}
            onClick={() => setSortMode(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Chart ── */}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={visible}
          margin={{ top: 8, right: 56, left: 0, bottom: 4 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="rgba(255,255,255,0.04)"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, maxVal]}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            tick={{ fontSize: 10, fill: '#374151', fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v.length > 20 ? v.slice(0, 19) + '…' : v)}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <ReferenceLine
            x={benchmarkValue}
            stroke="#4b5563"
            strokeDasharray="5 4"
            strokeWidth={1.5}
            label={{
              value: `▸ ${benchmarkPill.replace('Benchmark: ', '')}`,
              position: 'top',
              fontSize: 10,
              fill: '#4b5563',
              fontFamily: 'Inter',
              fontWeight: 500,
              dy: -4,
            }}
          />
          <Bar dataKey={dataKey} radius={[0, 3, 3, 0]} maxBarSize={22}>
            {visible.map((entry) => (
              <Cell key={entry.name} fill={colorFn(entry[dataKey])} opacity={0.85} />
            ))}
            <LabelList content={<ValueLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ── Legend + expand toggle ── */}
      <div style={styles.legendRow}>
        <div style={styles.legendGroup}>
          {legendItems.map((item) => (
            <span key={item.label} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: item.color }} />
              <span style={{ ...styles.legendText, color: item.color }}>{item.label}</span>
            </span>
          ))}
        </div>
        {hasMore && (
          <button style={styles.expandBtn} onClick={() => setExpanded((e) => !e)}>
            {expanded
              ? 'Show less'
              : `Show all ${sorted.length} journeys`}
          </button>
        )}
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: '#1c2128',
  border: '1px solid #30363d',
  borderRadius: '6px',
  padding: '10px 14px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};

const styles = {
  card: {
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '8px',
    padding: '16px 20px 12px',
    overflow: 'hidden',
  },
  sortRow: {
    display: 'flex',
    gap: '4px',
    marginBottom: '4px',
  },
  sortBtn: {
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: 500,
    fontFamily: 'inherit',
    borderRadius: '5px',
    border: '1px solid #30363d',
    background: 'transparent',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s, border-color 0.12s',
  },
  sortBtnActive: {
    background: '#21262d',
    border: '1px solid #3b82f6',
    color: '#93c5fd',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #21262d',
  },
  legendGroup: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
  },
  expandBtn: {
    background: 'transparent',
    border: '1px solid #30363d',
    borderRadius: '6px',
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: 500,
    padding: '4px 12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    transition: 'border-color 0.15s, color 0.15s',
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
  },
  legendDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
    opacity: 0.9,
  },
  legendText: {
    fontSize: '11px',
    fontWeight: 500,
  },
  benchmarkPill: {
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '4px',
    padding: '2px 8px',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  badgeRow: {
    marginBottom: '4px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '99px',
    padding: '3px 10px',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
};
