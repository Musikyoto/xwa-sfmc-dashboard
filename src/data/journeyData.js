// ─── Benchmark constants ───────────────────────────────────────────────
export const BENCHMARKS = {
  openRate: 23.4,   // %
  ctr: 3.0,         // %
  ctorLow: 20.0,    // % lower bound
  ctorHigh: 30.0,   // % upper bound
  unsubRate: 0.10,  // %
};

// ─── Color logic ──────────────────────────────────────────────────────
export function getRateColor(value, benchmark) {
  const nearThreshold = benchmark * 0.8;
  if (value >= benchmark) return '#16a34a';
  if (value >= nearThreshold) return '#d97706';
  return '#dc2626';
}

export function getCTORColor(value) {
  if (value >= BENCHMARKS.ctorLow) return '#16a34a';  // >= 20%
  if (value >= 10) return '#d97706';                  // 10–19.9%
  return '#dc2626';                                   // < 10%
}

export function getUnsubColor(value) {
  if (value <= BENCHMARKS.unsubRate) return '#16a34a';
  if (value <= BENCHMARKS.unsubRate * 1.5) return '#d97706';
  return '#dc2626';
}

// ─── Google Sheets CSV feed ────────────────────────────────────────────
// To swap the data source, update this URL only.
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1kjiayOLkpd8pJ1Uron3DTHxD6dcLDlSNqEO5cGcaBmQ/gviz/tq?tqx=out:csv&sheet=SG';

// Minimal CSV parser — handles quoted fields with embedded commas/newlines.
function parseRow(row) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (const ch of row) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

function parseCSV(text) {
  // Normalise line endings (\r\n → \n) before splitting.
  const lines = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  // Skip the header row (index 0), ignore blank lines.
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line, i) => {
      const [
        JourneyName,
        JourneyStatus,
        TotalSends,
        UniqueOpens,
        OpenRate,
        UniqueClicks,
        CTR,
        CTOR,
        Unsubscribes,
        UnsubRate,
        WeekEnding,
        // BU — not needed in the UI, intentionally omitted
      ] = parseRow(line).map((f) => f.trim()); // trim every field

      return {
        id: i + 1,
        name: JourneyName,
        type: 'Journey Builder',      // not in CSV; default value
        status: JourneyStatus,
        sends: Number(TotalSends),
        opens: Number(UniqueOpens),
        openRate: Number(OpenRate),   // pre-calculated in sheet
        clicks: Number(UniqueClicks),
        ctr: Number(CTR),             // pre-calculated in sheet
        ctor: Number(CTOR),           // pre-calculated in sheet
        unsubs: Number(Unsubscribes),
        unsubRate: Number(UnsubRate), // pre-calculated in sheet
        week: WeekEnding,
      };
    });
}

// Exported async fetch — call this from App.jsx on mount.
export async function fetchJourneys() {
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error(`Could not load sheet (HTTP ${res.status})`);
  const text = await res.text();
  return parseCSV(text);
}

// ─── KPI aggregates (pure — computed from fetched data) ────────────────
export function computeKPIs(journeys) {
  const n = journeys.length || 1;
  // "Running" is the live status value from SFMC exported via Google Sheets.
  const running = journeys.filter((j) => j.status.trim().toLowerCase() === 'running');
  return {
    totalSends:     journeys.reduce((s, j) => s + j.sends, 0),
    avgOpenRate:    journeys.reduce((s, j) => s + j.openRate, 0) / n,
    avgCTR:         journeys.reduce((s, j) => s + j.ctr, 0) / n,
    avgCTOR:        journeys.reduce((s, j) => s + j.ctor, 0) / n,
    activeJourneys: running.length,
  };
}
