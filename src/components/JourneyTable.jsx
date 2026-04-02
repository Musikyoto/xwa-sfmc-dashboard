import { useState } from 'react';
import {
  getRateColor,
  getCTORColor,
  BENCHMARKS,
} from '../data/journeyData';

const COLS = [
  { key: 'name',     label: 'Journey Name', align: 'left',   minW: 190 },
  { key: 'status',   label: 'Status',       align: 'center', minW: 80  },
  { key: 'sends',    label: 'Sends',        align: 'right',  minW: 80  },
  { key: 'opens',    label: 'Opens',        align: 'right',  minW: 70  },
  { key: 'openRate', label: 'Open %',       align: 'right',  minW: 70  },
  { key: 'clicks',   label: 'Clicks',       align: 'right',  minW: 70  },
  { key: 'ctr',      label: 'CTR',          align: 'right',  minW: 70  },
  { key: 'ctor',     label: 'CTOR',         align: 'right',  minW: 70  },
  { key: 'unsubs',   label: 'Unsubs',       align: 'right',  minW: 65  },
  { key: 'week',     label: 'Week',         align: 'center', minW: 80  },
];

const METRIC_COLS = new Set(['openRate', 'ctr', 'ctor']);

function fmt(key, val) {
  if (key === 'openRate') return `${val.toFixed(1)}%`;
  if (key === 'ctr')      return `${val.toFixed(2)}%`;
  if (key === 'ctor')     return `${val.toFixed(1)}%`;
  if (typeof val === 'number') return val.toLocaleString();
  return val;
}

function metricColor(key, val) {
  if (key === 'openRate') return getRateColor(val, BENCHMARKS.openRate);
  if (key === 'ctr')      return getRateColor(val, BENCHMARKS.ctr);
  if (key === 'ctor')     return getCTORColor(val);
  return null;
}

const STATUS_STYLES = {
  Running: { bg: 'rgba(22,163,74,0.12)',   color: '#4ade80', border: 'rgba(22,163,74,0.25)'   },
  Stopped: { bg: 'rgba(234,179,8,0.12)',   color: '#fbbf24', border: 'rgba(234,179,8,0.25)'   },
  Paused:  { bg: 'rgba(234,179,8,0.12)',   color: '#fbbf24', border: 'rgba(234,179,8,0.25)'   },
  Draft:   { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
  // Fallback for any other status values
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
      <div style={styles.scrollWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...styles.th,
                    textAlign: col.align,
                    minWidth: col.minW,
                    cursor: 'pointer',
                    color: sortKey === col.key ? '#93c5fd' : '#4b5563',
                  }}
                  onClick={() => handleSort(col.key)}
                >
                  <span style={styles.thInner}>
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((j, i) => (
              <tr
                key={j.id}
                style={{
                  ...styles.tr,
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                }}
              >
                {COLS.map((col) => {
                  const val = j[col.key];
                  const isMetric = METRIC_COLS.has(col.key);
                  const color = isMetric ? metricColor(col.key, val) : null;
                  const isStatus = col.key === 'status';
                  const s = isStatus ? (STATUS_STYLES[val] || STATUS_STYLES.Default) : null;

                  return (
                    <td
                      key={col.key}
                      style={{
                        ...styles.td,
                        textAlign: col.align,
                        color: color || (col.key === 'name' ? '#e2e8f0' : '#6b7280'),
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
                            background: color,
                            flexShrink: 0,
                            opacity: 0.8,
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
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.tableFooter}>
        <span>Click column headers to sort</span>
        <span>
          <ColorDot color="#4ade80" /> Above benchmark &nbsp;
          <ColorDot color="#fbbf24" /> Near benchmark &nbsp;
          <ColorDot color="#f87171" /> Below benchmark
        </span>
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

function ColorDot({ color }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: color,
      marginRight: '3px',
      verticalAlign: 'middle',
    }} />
  );
}

const styles = {
  card: {
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  scrollWrapper: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '420px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
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
