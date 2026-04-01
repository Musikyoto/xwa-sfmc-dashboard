import KPIStrip from './components/KPIStrip';
import JourneyTable from './components/JourneyTable';
import MetricChart from './components/MetricChart';
import {
  journeysWithMetrics,
  BENCHMARKS,
  getRateColor,
  getCTORColor,
} from './data/journeyData';

const chartData = journeysWithMetrics.map((j) => ({
  name: j.name,
  openRate: j.openRate,
  ctr: j.ctr,
  ctor: j.ctor,
}));

export default function App() {
  return (
    <div style={styles.root}>
      {/* ── Masthead ── */}
      <header style={styles.masthead}>
        <div style={styles.mastheadInner}>
          <div style={styles.mastheadLeft}>
            <div style={styles.wordmark}>
              <span style={styles.wordmarkAccent}>XCL</span>
              <span style={styles.wordmarkMain}>World Academy</span>
            </div>
            <div style={styles.mastheadDivider} />
            <div>
              <p style={styles.mastheadTitle}>Journey Performance Dashboard</p>
              <p style={styles.mastheadSub}>Salesforce Marketing Cloud · Singapore BU</p>
            </div>
          </div>
          <div style={styles.mastheadRight}>
            <div style={styles.livePill}>
              <span style={styles.liveGlow} />
              <span style={styles.livePillText}>LIVE</span>
            </div>
            <div style={styles.weekLabel}>W13 · 2026</div>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <main style={styles.body}>
        <KPIStrip />

        <section style={styles.section}>
          <SectionLabel>Journey Performance</SectionLabel>
          <JourneyTable />
        </section>

        <section style={styles.section}>
          <SectionLabel>Open Rate by Journey</SectionLabel>
          <MetricChart
            data={chartData}
            dataKey="openRate"
            benchmarkValue={BENCHMARKS.openRate}
            benchmarkPill={`Benchmark: ${BENCHMARKS.openRate}%`}
            legendItems={[
              { color: '#16a34a', label: `Above ${BENCHMARKS.openRate}%` },
              { color: '#d97706', label: 'Within 5% of benchmark' },
              { color: '#dc2626', label: `Below ${BENCHMARKS.openRate}%` },
            ]}
            colorFn={(v) => getRateColor(v, BENCHMARKS.openRate)}
          />
        </section>

        <section style={styles.section}>
          <SectionLabel>Click-Through Rate (CTR) by Journey</SectionLabel>
          <MetricChart
            data={chartData}
            dataKey="ctr"
            benchmarkValue={BENCHMARKS.ctr}
            benchmarkPill={`Benchmark: ${BENCHMARKS.ctr}%`}
            legendItems={[
              { color: '#16a34a', label: `Above ${BENCHMARKS.ctr}%` },
              { color: '#d97706', label: 'Within 2% of benchmark' },
              { color: '#dc2626', label: `Below ${BENCHMARKS.ctr}%` },
            ]}
            colorFn={(v) => getRateColor(v, BENCHMARKS.ctr)}
          />
        </section>

        <section style={styles.section}>
          <SectionLabel>Click-to-Open Rate (CTOR) by Journey</SectionLabel>
          <MetricChart
            data={chartData}
            dataKey="ctor"
            benchmarkValue={BENCHMARKS.ctorLow}
            benchmarkPill={`Benchmark: ${BENCHMARKS.ctorLow}–${BENCHMARKS.ctorHigh}%`}
            legendItems={[
              { color: '#16a34a', label: 'Above 20%' },
              { color: '#d97706', label: '10–20% (approaching)' },
              { color: '#dc2626', label: 'Below 10%' },
            ]}
            colorFn={getCTORColor}
          />
        </section>

        <footer style={styles.footer}>
          <span>Sample data · Benchmarks: Global Education Industry 2025–2026</span>
          <span>SFMC Dashboard v1.0</span>
        </footer>
      </main>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={sectionLabelStyle}>
      <span style={sectionLabelBar} />
      {children}
    </div>
  );
}

const sectionLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#4b5563',
  marginBottom: '12px',
};

const sectionLabelBar = {
  display: 'inline-block',
  width: '3px',
  height: '14px',
  background: '#2563eb',
  borderRadius: '2px',
  flexShrink: 0,
};

const styles = {
  root: {
    minHeight: '100vh',
    background: '#0d1117',
  },

  /* ── Masthead ── */
  masthead: {
    background: '#0d1117',
    borderBottom: '1px solid #21262d',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  mastheadInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 28px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mastheadLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  wordmark: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    flexShrink: 0,
  },
  wordmarkAccent: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  wordmarkMain: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#6b7280',
    letterSpacing: '-0.01em',
  },
  mastheadDivider: {
    width: '1px',
    height: '24px',
    background: '#21262d',
    flexShrink: 0,
  },
  mastheadTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e2e8f0',
    letterSpacing: '-0.01em',
  },
  mastheadSub: {
    fontSize: '11px',
    color: '#4b5563',
    marginTop: '1px',
  },
  mastheadRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  livePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(22,163,74,0.12)',
    border: '1px solid rgba(22,163,74,0.25)',
    borderRadius: '99px',
    padding: '3px 10px',
  },
  liveGlow: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#16a34a',
    boxShadow: '0 0 6px #16a34a',
    display: 'inline-block',
    animation: 'none',
  },
  livePillText: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#16a34a',
    letterSpacing: '0.1em',
  },
  weekLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#4b5563',
    fontVariantNumeric: 'tabular-nums',
  },

  /* ── Body ── */
  body: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 28px 60px',
  },
  section: {
    marginBottom: '36px',
  },

  /* ── Footer ── */
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0 0',
    borderTop: '1px solid #21262d',
    fontSize: '11px',
    color: '#374151',
    flexWrap: 'wrap',
    gap: '8px',
  },
};
