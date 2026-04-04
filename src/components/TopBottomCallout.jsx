const GREEN = '#3fb950';
const RED   = '#f85149';

function Panel({ title, accent, journeys }) {
  return (
    <div style={{ ...styles.panel, borderLeft: `3px solid ${accent}` }}>
      <p style={{ ...styles.panelTitle, color: accent }}>{title}</p>
      <div style={styles.list}>
        {journeys.map((j, i) => (
          <div key={j.id} style={styles.entry}>
            <span style={{ ...styles.rank, color: accent }}>{i + 1}</span>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 5px ${accent}88`,
                flexShrink: 0,
              }}
            />
            <span style={styles.name}>{j.name}</span>
            <span style={{ ...styles.rate, color: accent }}>
              {j.openRate.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TopBottomCallout({ journeys }) {
  const running = journeys.filter(
    (j) => j.status.trim().toLowerCase() === 'running',
  );

  const byOpenRate = [...running].sort((a, b) => b.openRate - a.openRate);
  const top3    = byOpenRate.slice(0, 3);
  const bottom3 = byOpenRate.slice(-3).reverse();

  if (running.length < 1) return null;

  return (
    <div style={styles.card}>
      <Panel title="Top 3 performers"  accent={GREEN} journeys={top3}    />
      <div style={styles.divider} />
      <Panel title="Needs attention"   accent={RED}   journeys={bottom3} />
    </div>
  );
}

const styles = {
  card: {
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr',
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '36px',
  },
  divider: {
    background: '#21262d',
    alignSelf: 'stretch',
  },
  panel: {
    padding: '18px 20px',
  },
  panelTitle: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '14px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  entry: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  rank: {
    fontSize: '10px',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    width: '12px',
    flexShrink: 0,
    opacity: 0.6,
  },
  name: {
    fontSize: '13px',
    color: '#e6edf3',
    fontWeight: 500,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rate: {
    fontSize: '13px',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
};
