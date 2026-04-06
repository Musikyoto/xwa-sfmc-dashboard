import { useState, useEffect, useMemo } from 'react';
import KPIStrip from './components/KPIStrip';
import JourneyTable from './components/JourneyTable';
import MetricChart from './components/MetricChart';
import TopBottomCallout from './components/TopBottomCallout';
import {
  fetchJourneys,
  computeKPIs,
  BENCHMARKS,
  getRateColor,
  getCTORColor,
} from './data/journeyData';

function fmtShort(d) {
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

const STATUS_FILTERS = [
  { key: 'running', label: 'Running' },
  { key: 'stopped', label: 'Stopped' },
  { key: 'all',     label: 'All'     },
];

export default function App() {
  const [journeys, setJourneys]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [statusFilter, setStatusFilter]   = useState('running');

  useEffect(() => {
    fetchJourneys()
      .then((data) => { setJourneys(data); setLoading(false); })
      .catch((err)  => { setError(err.message); setLoading(false); });
  }, []);

  const kpis = useMemo(
    () => (journeys.length ? computeKPIs(journeys) : null),
    [journeys],
  );

  const filteredJourneys = useMemo(() => {
    if (statusFilter === 'all') return journeys;
    return journeys.filter(
      (j) => j.status.trim().toLowerCase() === statusFilter,
    );
  }, [journeys, statusFilter]);

  const chartData = useMemo(
    () => journeys.map((j) => ({ name: j.name, openRate: j.openRate, ctr: j.ctr, ctor: j.ctor })),
    [journeys],
  );

  // Parse the most recent WeekEnding value, avoiding UTC midnight timezone shift
  const weekDate = useMemo(() => {
    const raw = journeys.length
      ? [...journeys].sort((a, b) => (b.week ?? '').localeCompare(a.week ?? ''))[0]?.week
      : null;
    if (!raw) return null;
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }, [journeys]);

  const nextRefreshDate = weekDate
    ? new Date(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate() + 7)
    : null;

  return (
    <div style={styles.root}>
      {/* ── Masthead ── */}
      <header style={styles.masthead}>
        <div className="masthead-inner" style={styles.mastheadInner}>
          {/* On mobile: display:contents flattens children into masthead-inner flex */}
          <div className="masthead-brand" style={styles.mastheadLeft}>
            <div className="masthead-wordmark" style={styles.wordmark}>
              <span style={styles.wordmarkAccent}>XCL</span>
              <span style={styles.wordmarkMain}>World Academy</span>
            </div>
            <div className="masthead-divider-bar" style={styles.mastheadDivider} />
            <div className="masthead-titles">
              <p style={styles.mastheadTitle}>Journey Performance Dashboard</p>
              <p style={styles.mastheadSub}>Salesforce Marketing Cloud · Singapore BU</p>
            </div>
          </div>
          <div className="masthead-right" style={styles.mastheadRight}>
            <div className="mhd-live-pill" style={styles.livePill}>
              <span style={styles.liveGlow} />
              <span style={styles.livePillText}>LIVE</span>
            </div>
            <div className="mhd-week-label" style={styles.weekLabel}>
              {weekDate ? (
                <>
                  Last updated:&nbsp;
                  <span style={styles.weekDateValue}>{fmtShort(weekDate)}</span>
                  &nbsp;·&nbsp;Next refresh:&nbsp;
                  <span style={styles.weekDateValue}>{fmtShort(nextRefreshDate)}</span>
                </>
              ) : (
                'Loading…'
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <main className="page-body" style={styles.body}>

        {/* ── Loading state ── */}
        {loading && (
          <div style={styles.stateBox}>
            <div style={styles.spinner} />
            <p style={styles.stateText}>Loading journey data…</p>
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div style={{ ...styles.stateBox, ...styles.errorBox }}>
            <p style={styles.errorIcon}>⚠</p>
            <p style={styles.stateText}>Failed to load data</p>
            <p style={styles.errorDetail}>{error}</p>
            <button
              style={styles.retryBtn}
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchJourneys()
                  .then((data) => { setJourneys(data); setLoading(false); })
                  .catch((err)  => { setError(err.message); setLoading(false); });
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Dashboard (only rendered once data is ready) ── */}
        {!loading && !error && kpis && (
          <>
            <KPIStrip kpis={kpis} />

            <TopBottomCallout journeys={filteredJourneys} />

            <section style={styles.section}>
              {/* Section header row: label + count badge + filter toggle */}
              <div style={styles.sectionHeader}>
                <div style={styles.sectionLabelGroup}>
                  <span style={sectionLabelBar} />
                  <span style={styles.sectionLabelText}>Journey Performance</span>
                  <span style={styles.countBadge}>
                    {filteredJourneys.length} {filteredJourneys.length === 1 ? 'journey' : 'journeys'}
                  </span>
                </div>
                <FilterToggle value={statusFilter} onChange={setStatusFilter} />
              </div>
              <p className="table-scroll-hint">← Scroll table horizontally →</p>
              <JourneyTable journeys={filteredJourneys} />
            </section>

            <section style={styles.section}>
              <SectionLabel>Open Rate by Journey</SectionLabel>
              <MetricChart
                data={chartData}
                dataKey="openRate"
                benchmarkValue={BENCHMARKS.openRate}
                benchmarkPill={`Benchmark: ${BENCHMARKS.openRate}%`}
                legendItems={[
                  { color: '#16a34a', label: 'Above 23.4%'           },
                  { color: '#d97706', label: 'Between 18.7–23.3%'    },
                  { color: '#dc2626', label: 'Below 18.7%'            },
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
                  { color: '#16a34a', label: 'Above 3.0%'        },
                  { color: '#d97706', label: 'Between 2.4–2.9%'  },
                  { color: '#dc2626', label: 'Below 2.4%'         },
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
              <span>Google Sheets live feed · Benchmarks: Global Education Industry 2025–2026</span>
              <span>SFMC Dashboard v1.0</span>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

/* ── Filter toggle component ── */
function FilterToggle({ value, onChange }) {
  return (
    <div style={ftStyles.group}>
      {STATUS_FILTERS.map(({ key, label }, i) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              ...ftStyles.btn,
              ...(i > 0 ? ftStyles.btnBorder : {}),
              ...(active ? ftStyles.active[key] : ftStyles.inactive),
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

const ftStyles = {
  group: {
    display: 'flex',
    border: '1px solid #30363d',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  btn: {
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s, color 0.15s',
    lineHeight: 1.4,
  },
  btnBorder: {
    borderLeft: '1px solid #30363d',
  },
  inactive: {
    background: '#0d1117',
    color: '#4b5563',
  },
  active: {
    running: {
      background: 'rgba(63,185,80,0.12)',
      color: '#3fb950',
    },
    stopped: {
      background: 'rgba(100,100,110,0.18)',
      color: '#9ca3af',
    },
    all: {
      background: '#21262d',
      color: '#e6edf3',
    },
  },
};

/* ── Generic section label (used by chart sections) ── */
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
  },
  livePillText: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#16a34a',
    letterSpacing: '0.1em',
  },
  weekLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#4b5563',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
  },
  weekDateValue: {
    color: '#3fb950',
    fontWeight: 600,
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

  /* ── Journey Performance section header ── */
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  sectionLabelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionLabelText: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#4b5563',
  },
  countBadge: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6b7280',
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '99px',
    padding: '1px 8px',
    fontVariantNumeric: 'tabular-nums',
  },

  /* ── Loading / Error states ── */
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    minHeight: '320px',
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '8px',
  },
  errorBox: {
    borderColor: 'rgba(220,38,38,0.3)',
    background: 'rgba(220,38,38,0.05)',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '2px solid #21262d',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  stateText: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: 500,
  },
  errorIcon: {
    fontSize: '24px',
    color: '#dc2626',
  },
  errorDetail: {
    fontSize: '11px',
    color: '#4b5563',
    fontFamily: 'monospace',
  },
  retryBtn: {
    marginTop: '4px',
    padding: '6px 18px',
    background: 'transparent',
    border: '1px solid #30363d',
    borderRadius: '6px',
    color: '#9ca3af',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
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
