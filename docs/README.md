see_pdfeditor — Documentation

This folder contains the developer and project documentation for the PDF Editor MVP prototype and planned roadmap.

Quick navigation:

- `phases.md` — Phase-by-phase plan and acceptance criteria.
- `setup.md` — Developer prerequisites and step-by-step local setup (Windows / PowerShell oriented).
- `checklists.md` — Security, QA, and release checklists.
- `tasks.md` — Implementation tasks and milestones (developer task list).
- `acceptance-tests.md` — Acceptance criteria and test cases for the MVP.

How to publish these docs to GitHub Pages

1. Ensure this repo has been pushed to GitHub.
2. The repository contains a GitHub Actions workflow (`.github/workflows/pages.yml`) that will publish the contents of this `docs/` folder to Pages automatically on push to the default branch.

For a hands-on demo, see the `prototype/` folder which contains a small static prototype (open -> reorder -> export) that can be served with a static server.
