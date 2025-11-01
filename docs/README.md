see_pdfeditor — Documentation

This folder contains the developer and project documentation for the PDF Editor MVP prototype and planned roadmap.

Quick navigation:

- `phases.md` — Phase-by-phase plan and acceptance criteria.
- `setup.md` — Developer prerequisites and step-by-step local setup (Windows / PowerShell oriented).
- `checklists.md` — Security, QA, and release checklists.
- `tasks.md` — Implementation tasks and milestones (developer task list).
- `acceptance-tests.md` — Acceptance criteria and test cases for the MVP.

## Recent Updates

### Nov 1, 2025 — Critical Bug Fixes

#### Page Drag State Issue — RESOLVED ✅
A critical bug where pages would jump back to incorrect positions when dragged and reordered has been fixed.

**Issue**: When dragging a page to a new position, the view would jump back to page 1 instead of staying on the moved page.

**Fix Applied**:
- Fixed argument forwarding in `multi-pdf-app.js` wrapper function
- Added mouse/touch event conflict prevention
- Implemented proper scroll behavior with `scrollIntoView`
- Added smooth scroll animation for better UX

**Testing Evidence**:
- `docs/Error.mp4` - Demonstrates the bug behavior before fix
- `docs/new-error.mp4` - Shows the corrected behavior after fix

See `phases.md` and `checklists.md` for detailed technical notes.

How to publish these docs to GitHub Pages

1. Ensure this repo has been pushed to GitHub.
2. The repository contains a GitHub Actions workflow (`.github/workflows/pages.yml`) that will publish the contents of this `docs/` folder to Pages automatically on push to the default branch.

For a hands-on demo, see the `prototype/` folder which contains a small static prototype (open -> reorder -> export) that can be served with a static server.
