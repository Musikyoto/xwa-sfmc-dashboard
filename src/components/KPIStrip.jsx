import { getRateColor, getCTORColor, BENCHMARKS } from '../data/journeyData';

function delta(value, benchmark) {
  const d = value - benchmark;
  return { sign: d >= 0 ? '+' : '', value: d.toFixed(1) };
}

// Neutral accent for absolute-count cards (no benchmark comparison).
const NEUTRAL_ACCENT = '#2C2C2A';
const NEUTRAL_VALUE_COLOR = '#e6edf3';

function buildCards(kpis) {
  return [
    {
      label: 'Total Sends',
      value: kpis.totalSends.toLocaleString(),
      sub: 'All journeys',
      accent: '#3b82f6',
      delta: null,
    },
    {
      label: 'Avg Open Rate',
      value: `${kpis.avgOpenRate.toFixed(2)}%`,
      sub: `Benchmark ${BENCHMARKS.openRate}%`,
      accent: getRateColor(kpis.avgOpenRate, BENCHMARKS.openRate),
      delta: delta(kpis.avgOpenRate, BENCHMARKS.openRate),
    },
    {
      label: 'Avg CTR',
      value: `${kpis.avgCTR.toFixed(2)}%`,
      sub: `Benchmark ${BENCHMARKS.ctr}%`,
      accent: getRateColor(kpis.avgCTR, BENCHMARKS.ctr),
      delta: delta(kpis.avgCTR, BENCHMARKS.ctr),
    },
    {
      label: 'Avg CTOR',
      value: `${kpis.avgCTOR.toFixed(2)}%`,
      sub: `Benchmark ${BENCHMARKS.ctorLow}–${BENCHMARKS.ctorHigh}%`,
      accent: getCTORColor(kpis.avgCTOR),
      delta: delta(kpis.avgCTOR, BENCHMARKS.ctorLow),
    },
    // ── Second row: absolute counts, no benchmark, neutral styling ─────
    {
      label: 'Total Opens',
      value: kpis.totalOpens.toLocaleString(),
      sub: 'Unique opens',
      accent: NEUTRAL_ACCENT,
      valueColor: NEUTRAL_VALUE_COLOR,
      delta: null,
    },
    {
      label: 'Total Clicks',
      value: kpis.totalClicks.toLocaleString(),
      sub: 'Unique clicks',
      accent: NEUTRAL_ACCENT,
      valueColor: NEUTRAL_VALUE_COLOR,
      delta: null,
    },
    {
      label: 'Tour Scheduled',
      value: kpis.totalTourScheduled.toLocaleString(),
      sub: 'All journeys',
      accent: NEUTRAL_ACCENT,
      valueColor: NEUTRAL_VALUE_COLOR,
      delta: null,
    },
    {
      label: 'Tour Attended',
      value: kpis.totalTourAttended.toLocaleString(),
      sub: 'All journeys',
      accent: NEUTRAL_ACCENT,
      valueColor: NEUTRAL_VALUE_COLOR,
      delta: null,
    },
  ];
}

export default function KPIStrip({ kpis }) {
  const cards = buildCards(kpis);

  return (
    <div className="kpi-grid" style={styles.grid}>
      {cards.map((c) => (
        <div
          key={c.label}
          className="kpi-card"
          style={styles.card}
        >
          <div style={styles.cardTop}>
            <p style={styles.label}>{c.label}</p>
            {c.delta && (
              <span
                style={{
                  ...styles.deltaBadge,
                  color: c.accent,
                  background: hexAlpha(c.accent, 0.1),
                  border: `1px solid ${hexAlpha(c.accent, 0.2)}`,
                }}
              >
                {c.delta.sign}{c.delta.value}pp
              </span>
            )}
          </div>
          <p style={{ ...styles.value, color: c.valueColor || c.accent }}>{c.value}</p>
          <p style={styles.sub}>{c.sub}</p>
          <div style={{ ...styles.accentBar, background: c.accent }} />
        </div>
      ))}
    </div>
  );
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '36px',
  },
  card: {
    position: 'relative',
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '8px',
    padding: '20px 18px 16px',
    overflow: 'hidden',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  label: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#4b5563',
  },
  deltaBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  value: {
    fontSize: '30px',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.03em',
    marginBottom: '6px',
    fontVariantNumeric: 'tabular-nums',
  },
  sub: {
    fontSize: '11px',
    color: '#374151',
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    opacity: 0.5,
  },
};
