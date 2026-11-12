# Radar CS

**Live:** https://radar-cs-delta.vercel.app

Dashboard for Customer Success Managers to track the monthly batch of priority clients: who still needs contact, who has a meeting scheduled, and how close the month's goal is.

Built to solve a real problem: the official dashboard only lists the batch and takes 24h to update, and the client data is spread across three spreadsheets, with the same company repeated many times.

## Features

- **Monthly goal** (50% of meetings done) with live progress and a forecast (done + scheduled)
- **Five client statuses** with colors, filters and inline status change
- **Spreadsheet import**: drop the 3 work files (CSV or Excel), the app detects each one by its columns and merges them by company name
- **Contacts per company**: all emails without duplicates, company phone or "Telefone não encontrado", plus manual contact name and WhatsApp
- **Message template** with variables (`{contato}`, `{empresa}`, `{meu_nome}`, `{link_agenda}`) and live preview
- **One-click WhatsApp**: opens WhatsApp Web with the number and the message ready
- **Send queue**: goes through the selected clients one by one

## Privacy

There is no backend. Spreadsheets are read in the browser and all data stays in `localStorage`. Nothing is sent to a server, and spreadsheet files are blocked in `.gitignore`. A button clears all data from the browser.

## Tech

- React 19, TypeScript, Vite
- PapaParse for CSV
- A small custom `.xlsx` reader built on fflate: the Power BI export uses a format (prefixed XML, inline strings, no cell addresses) that common libraries fail to read, so the app unzips the file and reads the sheet XML directly

## Running locally

```bash
npm install
npm run dev
```

See [ROADMAP.md](ROADMAP.md) for the build plan and decisions.
