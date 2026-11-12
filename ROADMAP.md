# Roadmap

Each part ends with the app running and one commit.

- [x] **Part 1: base + summary.** Vite + React + TS, status colors, sample data, header, goal card, status cards and forecast.
- [x] **Part 2: client table.** Table with filters by status, change status per client, selection checkboxes.
- [x] **Part 3: spreadsheet import.** Import the 3 spreadsheets (CSV or Excel), detect each one by its columns, merge by company name, show only the batch companies, save in localStorage.
- [x] **Part 4: contacts dropdown.** Arrow per company listing emails and company phone ("Telefone não encontrado" when missing), plus manual fields for contact name and WhatsApp number.
- [x] **Part 5: WhatsApp.** Message template with variables, one-click button that opens WhatsApp Web with the text.
- [x] **Part 6: send queue.** Send the same message to selected clients one by one.
- [ ] **Part 7: polish + deploy.** Empty states, responsive check, deploy on Vercel.

## Later

- Email (connect or replace the Apps Script)
- Shared templates for the whole team

## Decisions

- The batch (Visão Company CTA) defines which companies appear. The other two files only add data.
- Only the batch has the client ID, so files are merged by normalized company name.
- The contacts base has emails and one company phone, no person names. Name and WhatsApp are filled in by hand.
- Every imported client starts as "Não tentou ainda".
- Spreadsheets are read in the browser. The Power BI export is parsed by a small custom reader (unzip + XML), because common libraries fail on it.
