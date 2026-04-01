// ─── Benchmark constants ───────────────────────────────────────────────
export const BENCHMARKS = {
  openRate: 23.4,   // %
  ctr: 3.0,         // %
  ctorLow: 20.0,    // % lower bound
  ctorHigh: 30.0,   // % upper bound
  unsubRate: 0.10,  // %
};

// ─── Color logic ──────────────────────────────────────────────────────
// near = within 20% below benchmark, e.g. openRate near = >= 18.72%
export function getRateColor(value, benchmark) {
  const nearThreshold = benchmark * 0.8;
  if (value >= benchmark) return '#16a34a';       // green
  if (value >= nearThreshold) return '#d97706';   // amber
  return '#dc2626';                               // red
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

// ─── Sample journey data ───────────────────────────────────────────────
// Replace this array with a fetch from Google Sheets CSV when ready.
export const journeys = [
  {
    id: 1,
    name: 'Open Day Nurture',
    type: 'Multi-Step',
    status: 'Active',
    sends: 4820,
    opens: 1265,
    clicks: 214,
    unsubs: 3,
    week: 'W13 2026',
  },
  {
    id: 2,
    name: 'Admissions Welcome',
    type: 'Triggered',
    status: 'Active',
    sends: 3110,
    opens: 892,
    clicks: 178,
    unsubs: 2,
    week: 'W13 2026',
  },
  {
    id: 3,
    name: 'Re-enquiry Winback',
    type: 'Multi-Step',
    status: 'Active',
    sends: 2540,
    opens: 431,
    clicks: 52,
    unsubs: 5,
    week: 'W13 2026',
  },
  {
    id: 4,
    name: 'XWA Conversations Webinar',
    type: 'Event',
    status: 'Active',
    sends: 1980,
    opens: 623,
    clicks: 145,
    unsubs: 1,
    week: 'W13 2026',
  },
  {
    id: 5,
    name: 'Prospectus Download',
    type: 'Triggered',
    status: 'Active',
    sends: 3750,
    opens: 1050,
    clicks: 188,
    unsubs: 4,
    week: 'W13 2026',
  },
  {
    id: 6,
    name: 'Deposit Reminder',
    type: 'Triggered',
    status: 'Paused',
    sends: 870,
    opens: 162,
    clicks: 18,
    unsubs: 1,
    week: 'W12 2026',
  },
];

// ─── Derived metrics ───────────────────────────────────────────────────
export const journeysWithMetrics = journeys.map((j) => {
  const openRate = (j.opens / j.sends) * 100;
  const ctr = (j.clicks / j.sends) * 100;
  const ctor = (j.clicks / j.opens) * 100;
  const unsubRate = (j.unsubs / j.sends) * 100;
  return { ...j, openRate, ctr, ctor, unsubRate };
});

// ─── KPI aggregates ────────────────────────────────────────────────────
const active = journeysWithMetrics.filter((j) => j.status === 'Active');

export const kpis = {
  totalSends: journeysWithMetrics.reduce((s, j) => s + j.sends, 0),
  avgOpenRate:
    active.reduce((s, j) => s + j.openRate, 0) / active.length,
  avgCTR:
    active.reduce((s, j) => s + j.ctr, 0) / active.length,
  avgCTOR:
    active.reduce((s, j) => s + j.ctor, 0) / active.length,
  activeJourneys: active.length,
};
