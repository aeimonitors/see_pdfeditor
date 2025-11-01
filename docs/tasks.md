Implementation tasks & milestones (developer-facing)

This file organizes the work into concrete tasks and suggested estimates for the MVP.

Sprint 0 — Spike (2–3 days)
- Task: Prototype basic open → view → reorder → export (the `prototype/` directory is this spike).
- Deliverable: Verified demo and decision on core engine (pdf.js + pdf-lib for MVP).

Sprint 1 — Viewer & Page Management (1 week)
- Task: Integrate renderer into app shell, thumbnail panel, page navigation.
- Task: Implement drag-and-drop reorder with undo/redo.
- Tests: Unit tests for reorder logic, E2E smoke (open → reorder → export).

**COMPLETED** ✅ - Drag-and-drop reorder implemented with critical bug fix (Nov 1, 2025)
- Fixed page state issue where pages would jump back after drag
- Improved UX with smooth scroll animation
- Icon alignment and button sizing optimized

Sprint 2 — Annotations & Markup (2 weeks)
- Task: Implement highlight/underline/strike and comment pins saved as PDF annotations.
- Task: Freehand ink tool and basic shapes.
- Tests: Open exported file in Acrobat to verify annotations.

Sprint 3 — Basic Text & Image Editing (2–3 weeks)
- Task: Add text box tool and image insertion.
- Task: Best-effort existing-text edit (font matching heuristics).

Sprint 4 — Export, Autosave & UX polish (1 week)
- Task: Implement robust export, autosave to local browser storage, and confirm cross-reader compatibility.

Milestones
- M1: Spike complete + engine decision
- M2: Viewer + page manipulation (usable MVP)
- M3: Annotation set complete
- M4: Basic text/image editing complete

Notes
- Break tasks into small PRs; include unit tests where possible.
- Track performance of WASM assets and lazy-load editing modules to keep initial load fast.
