# see_pdfeditor — PDF Editor (MVP)

This repository contains planning docs and a lightweight client-side prototype for a secure, browser-based PDF editor.

What’s here
- `docs/` — project documentation and acceptance tests. This folder is configured to be published to GitHub Pages via Actions.
- `prototype/` — a small static demo (open → reorder → export) using `pdf.js` and `pdf-lib`.

Quick start (prototype)

```powershell
cd d:\Projects\see_pdfeditor\prototype
python -m http.server 5173
# Open http://localhost:5173 in your browser
```

Publishing docs (GitHub Pages)

- This repo includes a GitHub Actions workflow that will publish the `docs/` folder to GitHub Pages on push to the default branch.

Next steps
- Scaffold the full Next.js + TypeScript app and migrate the prototype into a React component.
- Add CI tests (Playwright) to run the open→reorder→export smoke test.
