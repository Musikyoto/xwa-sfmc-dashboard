import { useState } from 'react';
import { BENCHMARKS } from '../data/journeyData';

// ── RAG colour constants ──────────────────────────────────────────────────
const RAG = { G: '#3fb950', A: '#d29922', R: '#f85149' };

// Exact per-metric thresholds (not benchmark × 0.8)
function ragColor(key, val) {
  if (key === 'openRate') {
    if (val >= 23.4) return RAG.G;
    if (val >= 18.7) return RAG.A;
    return RAG.R;
  }
  if (key === 'ctr') {
    if (val >= 3.0) return RAG.G;
    if (val >= 2.4) return RAG.A;
    return RAG.R;
  }
  if (key === 'ctor') {
    if (val >= 20)  return RAG.G;
    if (val >= 10)  return RAG.A;
    return RAG.R;
  }
  return RAG.G;
}

// ── Table column definitions ──────────────────────────────────────────────
const COLS = [
  { key: 'name',               label: 'Journey Name', align: 'left',  minW: 190, sortable: true },
  { key: 'status',             label: 'Status',       align: 'center', minW: 80, sortable: true },
  { key: 'sends',              label: 'Sends',        align: 'right',  minW: 80, sortable: true },
  { key: 'opens',              label: 'Opens',        align: 'right',  minW: 70, sortable: true },
  { key: 'openRate',           label: 'Open %',       align: 'right',  minW: 70, sortable: true },
  { key: 'clicks',             label: 'Clicks',       align: 'right',  minW: 70, sortable: true },
  { key: 'ctr',                label: 'CTR',          align: 'right',  minW: 70, sortable: true },
  { key: 'ctor',               label: 'CTOR',         align: 'right',  minW: 70, sortable: true },
  { key: 'unsubs',             label: 'Unsubs',       align: 'right',  minW: 65, sortable: true },
  { key: 'tourScheduled',      label: 'Tour Sched',   align: 'right',  minW: 90, sortable: true },
  { key: 'tourAttended',       label: 'Tour Attd',    align: 'right',  minW: 90, sortable: true },
  { key: 'tourConversionRate', label: 'Tour Conv %',  align: 'right',  minW: 100, sortable: true },
];

const METRIC_COLS = new Set(['openRate', 'ctr', 'ctor']);

function fmt(key, val) {
  if (key === 'openRate') return `${val.toFixed(1)}%`;
  if (key === 'ctr')      return `${val.toFixed(2)}%`;
  if (key === 'ctor')     return `${val.toFixed(1)}%`;
  if (key === 'tourConversionRate') return `${val.toFixed(2)}%`;
  if (typeof val === 'number') return val.toLocaleString();
  return val;
}

const STATUS_STYLES = {
  Running: { bg: 'rgba(22,163,74,0.12)',   color: '#4ade80', border: 'rgba(22,163,74,0.25)'   },
  Stopped: { bg: 'rgba(234,179,8,0.12)',   color: '#fbbf24', border: 'rgba(234,179,8,0.25)'   },
  Paused:  { bg: 'rgba(234,179,8,0.12)',   color: '#fbbf24', border: 'rgba(234,179,8,0.25)'   },
  Draft:   { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
  Default: { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
};

export default function JourneyTable({ journeys }) {
  const [sortKey, setSortKey] = useState('sends');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = [...journeys].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc'
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });

  function handleSort(key) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  return (
    <div style={styles.card}>

      {/* ── Legend ── */}
      <div style={styles.legend}>
        {[
          { color: RAG.G, label: 'Meets benchmark'          },
          { color: RAG.A, label: 'Slightly below benchmark' },
          { color: RAG.R, label: 'Way below benchmark'      },
        ].map(({ color, label }) => (
          <span key={label} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="table-scroll-wrapper" style={styles.scrollWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {COLS.map((col) => {
                const isName = col.key === 'name';
                return (
                  <th
                    key={col.key}
                    style={{
                      ...styles.th,
                      ...(isName ? styles.thNameSticky : null),
                      textAlign: col.align,
                      minWidth: col.minW,
                      cursor: col.sortable ? 'pointer' : 'default',
                      color: sortKey === col.key ? '#93c5fd' : '#4b5563',
                    }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span style={styles.thInner}>
                      {col.label}
                      {col.sortable && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((j, i) => {
              const rowBg = i % 2 === 0 ? '#161b22' : '#1a1f26';
              return (
                <tr
                  key={j.id}
                  style={{
                    ...styles.tr,
                    background: rowBg,
                  }}
                >
                  {COLS.map((col) => {
                    const val = j[col.key];
                    const isMetric = METRIC_COLS.has(col.key);
                    const isStatus = col.key === 'status';
                    const isName = col.key === 'name';
                    const s = isStatus ? (STATUS_STYLES[val] || STATUS_STYLES.Default) : null;
                    const metricCol = isMetric ? ragColor(col.key, val) : null;

                    return (
                      <td
                        key={col.key}
                        style={{
                          ...styles.td,
                          ...(isName ? { ...styles.tdNameSticky, background: rowBg } : null),
                          textAlign: col.align,
                          color: metricCol || '#e6edf3',
                          fontWeight: col.key === 'name' ? 500 : isMetric ? 600 : 400,
                          fontVariantNumeric: typeof val === 'number' || isMetric ? 'tabular-nums' : undefined,
                        }}
                      >
                        {isStatus ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                            {val}
                          </span>
                        ) : isMetric ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: metricCol,
                              flexShrink: 0,
                              opacity: 0.85,
                            }} />
                            {fmt(col.key, val)}
                          </span>
                        ) : (
                          fmt(col.key, val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.tableFooter}>
        <span>Click column headers to sort</span>
      </div>
    </div>
  );
}

function SortIcon({ active, dir }) {
  return (
    <span style={{ opacity: active ? 0.9 : 0.25, fontSize: '9px', marginLeft: '3px' }}>
      {active ? (dir === 'asc' ? '▲' : '▼') : '▼'}
    </span>
  );
}

const styles = {
  card: {
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '10px 14px',
    borderBottom: '1px solid #21262d',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: 500,
  },
  legendDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  scrollWrapper: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '420px',
  },
  table: {
    width: '100%',
    minWidth: '1100px',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: '13px',
  },
  th: {
    padding: '12px 14px',
    fontWeight: 600,
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: '1px solid #21262d',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    background: '#0d1117',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  thNameSticky: {
    left: 0,
    zIndex: 20,
    borderRight: '1px solid #21262d',
  },
  thInner: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  tr: {
    transition: 'background 0.1s',
  },
  td: {
    padding: '11px 14px',
    borderBottom: '1px solid rgba(33,38,45,0.7)',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    lineHeight: 1.4,
  },
  tdNameSticky: {
    position: 'sticky',
    left: 0,
    zIndex: 5,
    borderRight: '1px solid #21262d',
  },
  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    fontSize: '10px',
    color: '#374151',
    borderTop: '1px solid #21262d',
    background: '#0d1117',
    flexWrap: 'wrap',
    gap: '6px',
  },
};
