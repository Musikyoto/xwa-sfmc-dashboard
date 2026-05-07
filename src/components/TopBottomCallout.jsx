const GREEN = '#3fb950';
const RED   = '#f85149';

function isRunning(j) {
  return j.status?.trim().toLowerCase() === 'running';
}

function Panel({ title, subtitle, accent, journeys, formatRate, helperFor }) {
  return (
    <div style={{ ...styles.panel, borderLeft: `3px solid ${accent}` }}>
      <p style={{ ...styles.panelTitle, color: accent }}>{title}</p>
      <p style={styles.subtitle}>{subtitle}</p>
      <div style={styles.list}>
        {journeys.map((j, i) => (
          <div key={j.id} style={styles.entry}>
            <div style={styles.entryRow}>
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
                {formatRate(j)}
              </span>
            </div>
            <p style={styles.helper}>{helperFor(j)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TopBottomCallout({ journeys }) {
  if (!journeys || journeys.length < 1) return null;

  const running = journeys.filter(isRunning);

  // ── Top 3: ALL journeys, ≥250 sends, by tour conversion rate desc ───
  const top3 = journeys
    .filter((j) => j.sends >= 250)
    .sort((a, b) => {
      if (b.tourConversionRate !== a.tourConversionRate) {
        return b.tourConversionRate - a.tourConversionRate;
      }
      if (b.sends !== a.sends) return b.sends - a.sends;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 3);

  // ── Needs Attention: Running, ≥1000 sends, by CTOR asc ──────────────
  const bottom3 = running
    .filter((j) => j.sends >= 1000)
    .sort((a, b) => {
      if (a.ctor !== b.ctor) return a.ctor - b.ctor;
      if (b.sends !== a.sends) return b.sends - a.sends;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 3);

  return (
    <div className="callout-card" style={styles.card}>
      <Panel
        title="Top 3 performers"
        subtitle="By tour conversion rate · all journeys · min 250 sends"
        accent={GREEN}
        journeys={top3}
        formatRate={(j) => `${j.tourConversionRate.toFixed(2)}%`}
        helperFor={(j) =>
          `${j.tourScheduled.toLocaleString()} tours from ${j.sends.toLocaleString()} sends`
        }
      />
      <div className="callout-divider" style={styles.divider} />
      <Panel
        title="Needs attention"
        subtitle="By click-to-open rate · active journeys · min 1,000 sends"
        accent={RED}
        journeys={bottom3}
        formatRate={(j) => `${j.ctor.toFixed(2)}%`}
        helperFor={(j) =>
          `${j.clicks.toLocaleString()} clicks from ${j.opens.toLocaleString()} opens`
        }
      />
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
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '10px',
    color: '#6b7280',
    fontWeight: 500,
    marginBottom: '14px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  entry: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  entryRow: {
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
  // Helper text indented to align with the journey name (past rank + dot + gaps).
  // rank width 12 + gap 10 + dot 7 + gap 10 = 39px.
  helper: {
    fontSize: '10px',
    color: '#6b7280',
    fontWeight: 500,
    marginLeft: '39px',
    fontVariantNumeric: 'tabular-nums',
  },
};
