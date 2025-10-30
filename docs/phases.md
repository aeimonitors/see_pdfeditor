Project phases — see_pdfeditor

1. Discovery & Planning
   - Goal: confirm MVP scope and choose core PDF engine (WASM vs pdf-lib/pdf.js hybrid).
   - Deliverables: prioritized backlog, risk register, acceptance criteria.

2. Design & Prototyping
   - Goal: design UI flows, component library choices, accessibility plan.
   - Deliverables: wireframes, prototype (the `prototype/` folder demonstrates a minimal viewer + export flow).

3. Implementation (iterative sprints)
   - Core viewer → Page manipulation → Annotations → Text/Image editing → Export.
   - Deliverables: feature branches, tests, PRs, demo builds.

4. QA & Security
   - Goal: accessibility checks, security checklist validation, performance profiling.
   - Deliverables: test reports, performance baseline.

5. Release & Maintenance
   - Goal: publish, monitor, iterate toward Tier 2/3 features.

Acceptance criteria examples
- MVP: user can open a PDF locally, reorder pages, and download a new PDF with the new page order preserved.
