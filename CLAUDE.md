# SFMC Journey Performance Dashboard — XCL World Academy, Singapore BU

## Project Overview
A React web dashboard for monitoring Salesforce Marketing Cloud (SFMC) journey performance metrics for XCL World Academy's Singapore Business Unit.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Charts**: Recharts
- **Styling**: Inline CSS / component styles (no CSS framework)
- **Data source**: Currently sample data in `src/data/journeyData.js` — will later be replaced with a live Google Sheets CSV feed

## Key Files
- `src/data/journeyData.js` — all sample journey data and benchmark constants (replace with CSV feed here)
- `src/components/KPIStrip.jsx` — summary KPI cards across the top
- `src/components/JourneyTable.jsx` — sortable journey performance table
- `src/components/MetricChart.jsx` — reusable full-width bar chart with benchmark line
- `src/App.jsx` — main layout, orchestrates all components

## Benchmark References (Global Education Industry 2025–2026)
| Metric    | Benchmark | Source |
|-----------|-----------|--------|
| Open Rate | 23.4%     | Industry 2025 |
| CTR       | 3.0%      | Industry 2025 |
| CTOR      | 20–30%    | Industry 2025 |
| Unsub     | < 0.10%   | Industry 2025 |

## Color Coding Logic
- **Green**: at or above benchmark
- **Amber**: within 20% below benchmark (near benchmark)
- **Red**: more than 20% below benchmark

## Journeys Tracked (Singapore BU)
1. Open Day Nurture
2. Admissions Welcome
3. Re-enquiry Winback
4. XWA Conversations Webinar
5. Prospectus Download
6. Deposit Reminder

## Future Work
- Replace `src/data/journeyData.js` with a Google Sheets CSV fetch (CORS-safe public sheet URL)
- Add date range filter
- Add export to CSV/PDF

## Running Locally
```bash
npm install
npm run dev
```
