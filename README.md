# Radar CS

Dashboard for Customer Success Managers to track the monthly batch of priority clients: who still needs contact, who has a meeting scheduled, and how close the month's goal is.

Built to solve a real problem: the official dashboard only lists the batch and takes 24h to update, so the CSM loses track of her goal during the day.

## Features (in progress)

- Monthly goal (50% of meetings done) with live progress
- Forecast: meetings done + scheduled
- Five client statuses with colors
- Import the 3 work spreadsheets (CSV or Excel) and merge them by company
- One-click WhatsApp message with variables (planned)
- Send queue for several selected clients (planned)

## Privacy

Client data stays in the browser (localStorage). There is no server and nothing is sent anywhere.

## Tech

React 19, TypeScript, Vite. Spreadsheets are read in the browser with PapaParse (CSV) and a small custom .xlsx reader built on fflate.

## Running locally

```bash
npm install
npm run dev
```

See [ROADMAP.md](ROADMAP.md) for the build plan.
