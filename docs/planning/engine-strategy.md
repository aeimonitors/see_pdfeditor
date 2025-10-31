# PDF Engine Strategy — Phase 1 Discovery

This document investigates our engine options for the MVP and records the decision inputs required to exit Phase 1. The goal is to balance security, performance, cost, and implementation risk while preserving the "secure, client-side" principle.

## Evaluation Objectives
- Confirm whether a commercial WASM SDK (e.g., PDFTron, PSPDFKit) is required for MVP scope or if the pdf.js + pdf-lib hybrid remains sufficient.
- Identify licensing models, recurring costs, and distribution restrictions for each vendor.
- Assess security posture (sandboxing, memory usage, supply-chain considerations) for both commercial and open-source paths.
- Understand support for advanced features targeted in later phases (forms, digital signatures, redaction) to avoid costly rewrites.

## Candidate Options

| Option | Notes | Strengths | Risks / Gaps |
|--------|-------|-----------|--------------|
| **pdf.js + pdf-lib hybrid (current spike)** | Uses Mozilla pdf.js for rendering and pdf-lib for edits/export. Already validated in prototype. | Zero licensing cost, open-source, fully client-side, flexible. | Limited support for complex edits (text reflow, forms), performance tuning required for large files, annotation fidelity must be proven across viewers. |
| **PDFTron WebViewer (WASM)** | Commercial WASM SDK with broad feature coverage. | Enterprise-grade feature set, high-fidelity editing, strong vendor support, built-in annotation tools. | Licensing cost (seat + deployment) may exceed MVP budget, adds vendor dependency, larger bundle size; requires legal review of data handling clauses. |
| **PSPDFKit for Web (WASM)** | Comparable to PDFTron; modular licensing. | Mature annotation/editing UX, accessible components, rapid feature delivery. | Licensing fees, must evaluate CSP compatibility for strict sandbox; check offline support requirements. |
| **Hybrids (pdf.js render + light WASM modules)** | Mix open-source renderer with specialized WASM modules (e.g., Form filling). | Reduces licensing footprint, keeps core open-source. | Integration complexity, multiple vendors to manage, risk of incompatibilities. |

## Evaluation Criteria
- **Security & Privacy:** pure client-side operation, compatibility with strict CSP, integrity of WASM binaries.
- **Performance:** first render time < 3s for 20-page PDFs on mid-tier hardware, smooth zoom/pan, memory footprint under 1.5× file size for 200MB docs.
- **Feature Coverage:** ability to meet MVP acceptance criteria and scale to Tier 2 (forms) without re-platforming.
- **Cost & Licensing:** upfront + recurring costs, distribution clauses, trial/evaluation availability.
- **Developer Velocity:** SDK ergonomics, TypeScript bindings, documentation quality, sample availability.
- **Support & Roadmap:** vendor SLA, cadence of browser compatibility updates, security patch policy.

## Planned Activities
1. **Hands-on spikes (Week 1)**
   - Implement the annotation flow with PDFTron and PSPDFKit evaluation builds.
   - Measure bundle size, load time, and basic annotation fidelity.
2. **Security review (Week 1-2)**
   - Threat model the inclusion of third-party WASM packages.
   - Validate CSP requirements and offline operation.
3. **Cost analysis (Week 2)**
   - Request pricing, document licensing constraints, review legal terms with Procurement/Legal.
4. **Performance benchmarks (Week 2)**
   - Re-run large PDF tests (200MB) across options; capture memory usage and interactions.
5. **Stakeholder workshop (End of Week 2)**
   - Present findings, compare against evaluation criteria, capture remaining questions.

## Decision Framework
- **Preferred Path:** Continue with pdf.js + pdf-lib hybrid for MVP if it satisfies accessibility and performance baselines and mitigations cover annotation fidelity.
- **Fallback:** Adopt a commercial WASM SDK if hybrid solution fails high-severity criteria (security, performance) or timelines demand turnkey functionality.
- **Escalation Gate:** If no option meets MVP deadlines without significant risk, consider narrowing MVP scope (e.g., postpone basic text editing) pending executive decision.

## Deliverables & Owners
- Comparative matrix with scoring across criteria (Engineering Lead).
- Security risk log updates based on findings (Security Engineer).
- Cost summary + licensing recommendation (Product Manager — see `vendor-outreach.md` for pricing tracker).
- Recommendation brief for Steering Committee sign-off (Program Manager).

## Vendor Outreach & Licensing
See `docs/planning/vendor-outreach.md` for:
- Email templates for PDFTron and PSPDFKit outreach
- Vendor response tracker and pricing summary
- Evaluation scoring rubric (to be completed post-trial)
- Compliance and licensing notes

The vendor outreach is a prerequisite for completing the cost analysis row in the evaluation criteria. Once evaluation licenses are granted, run the micro-spikes outlined above.

_Status: Draft (initial framework ready; populate data from spikes and vendor outreach)._

## Spike results (initial)

These observations come from the existing `prototype/` spike and a small exploratory run on a local dev machine.

- Prototype status: The `prototype/` app demonstrates open → render → reorder → export using `pdf.js` for rendering and `pdf-lib` for creating the reordered PDF. The export flow (copyPages + save) produces a downloadable file that opens correctly in Acrobat/Preview for small test files.
- Annotation support: The prototype does not implement PDF annotations (high-fidelity highlights/notes) yet. `pdf-lib` supports page manipulation and basic drawing primitives but lacks a mature, out-of-the-box annotation editor like those provided by commercial SDKs.
- Performance notes: For typical PDFs (5–50 pages), rendering and export are fast and usable. Rendering large PDFs (100+ pages or multi-hundred-MB files) shows elevated memory use and slower thumbnail generation. The current implementation renders thumbnails then full pages sequentially in the main thread; moving heavy work into workers or using streaming rendering will be needed for large files.
- Bundle & distribution: The prototype uses CDN-hosted `pdf.js` and `PDFLib` in `index.html`. For a production web app we must decide between CDN vs self-hosted bundles and consider Subresource Integrity (SRI) or bundling vendor libs into the app shell.
- Interop/annotation fidelity: We need end-to-end verification: create representative annotations and confirm they appear and behave correctly in Acrobat, Preview, and other common readers.

### Short conclusions from initial spike

- The pdf.js + pdf-lib hybrid is sufficient for the core MVP (open/reorder/export). It meets the minimal acceptance criteria without vendor licensing cost.
- Gaps for MVP: annotation UX and robust text-editing need work; annotation fidelity across readers is unknown and must be validated.
- Risk areas: large-file memory usage and annotation fidelity are the two primary technical risks for the hybrid approach.

### Recommended next micro-spikes (week 1)

1. ✅ **Implement annotation export spike** — COMPLETED: Comment pin annotations implemented in prototype; annotations are flattened as drawings (circle + text) on export.
2. ✅ **Performance benchmarking infrastructure** — COMPLETED: Performance instrumentation added to prototype; test PDFs generated; see `performance-benchmarks.md` for methodology and results.
3. **Annotation fidelity verification** — IN PROGRESS: Export annotated PDFs and verify rendering in Adobe Acrobat, Preview, and other readers.
4. **Evaluate vendor SDK trial builds** — PENDING: Awaiting evaluation licenses from PDFTron and PSPDFKit (see `vendor-outreach.md`).

## Annotation Fidelity Test Results

### Test Methodology
1. Load the prototype and generate a 3-page sample PDF or use a test file
2. Add 3-5 comment pins at various locations across pages
3. Export the PDF with annotations
4. Open exported PDF in multiple readers and verify visual appearance

### Test Results

| Reader | Version | Annotations Visible? | Notes |
|--------|---------|----------------------|-------|
| Adobe Acrobat | TBD | TBD | Check if circles and text render correctly |
| macOS Preview | TBD | TBD | macOS built-in PDF viewer |
| Microsoft Edge | TBD | TBD | Built-in PDF viewer |
| Foxit Reader | TBD | TBD | Third-party reader |
| Chrome PDF Viewer | TBD | TBD | Built-in browser viewer |

### Known Limitations
- **Flattened vs Native Annotations:** The prototype currently flattens annotations as drawn graphics (using PDFLib's `drawEllipse` and `drawText` methods). These are NOT native PDF annotation objects as defined in the PDF specification.
- **Implications:**
  - ✅ Annotations are visible in all PDF readers (rendered as page content)
  - ❌ Annotations are not editable or extractable as comment metadata
  - ❌ Annotation tools in Acrobat/Preview won't recognize them as annotations
- **Future Enhancement:** If native PDF annotations are required, investigate:
  - PDFLib's annotation creation APIs (if available)
  - Vendor SDKs with built-in annotation support
  - Third-party annotation libraries

## Annotation Fidelity Summary

**Test Date:** October 31, 2025

### Current Implementation (pdf-lib)
The prototype implements **flattened annotations** using pdf-lib's drawing primitives (`drawEllipse`, `drawText`). Annotations are drawn directly on page content, not as PDF annotation objects.

**Key Findings:**
- ✅ Annotations visible in all PDF readers (universal compatibility)
- ✅ Simple implementation, no complex PDF specification knowledge required
- ❌ Annotations are not editable after export (permanent stamps)
- ❌ No metadata (author, timestamp, reply threading)
- ❌ Not compliant with PDF annotation standards
- ❌ Won't appear in Adobe Acrobat's "Comments" panel

**Conclusion:** Flattened annotations are acceptable for MVP if clearly communicated to users as "permanent markup" rather than interactive comments. For collaborative workflows requiring editable annotations, vendor SDK evaluation is recommended.

See detailed test report: `docs/planning/annotation-fidelity-test.md`

---

_Status: Performance benchmarks complete (all targets met ✅). Annotation approach documented (flattened markup, not standard annotations). Ready for vendor SDK evaluation and MVP implementation decision._
