# Vendor Outreach & Cost Analysis — Phase 1

This document tracks outreach to commercial PDF SDK vendors (PDFTron, PSPDFKit) and records pricing, licensing terms, and evaluation outcomes. Use this to inform the engine decision documented in `engine-strategy.md`.

## Objectives
- Secure evaluation licenses for PDFTron WebViewer and PSPDFKit for Web.
- Gather detailed pricing (per-seat, per-deployment, enterprise tiers).
- Understand licensing restrictions (self-hosted vs cloud, redistribution rights).
- Capture security attestations (SOC2, GDPR compliance, vulnerability disclosure).
- Document trial limitations and support SLA during evaluation.

## Vendor Contact Templates

### PDFTron WebViewer

**Initial Outreach Email Template**

```
Subject: Evaluation License Request for PDF Editor MVP

Hello PDFTron Sales Team,

We are building a secure, browser-based PDF editor MVP and are evaluating PDFTron WebViewer
as our core rendering and editing engine. Our primary use cases include:
- High-fidelity PDF viewing and navigation
- Page manipulation (reorder, rotate, delete)
- Annotations (highlights, comments, shapes)
- Basic text and image editing

We would like to request an evaluation license to assess:
1. Performance with large PDFs (100+ pages, 200MB+ files)
2. Annotation fidelity across Adobe Acrobat, Preview, and other readers
3. Bundle size and load-time impact
4. Client-side operation compatibility (strict CSP, no server-side processing)

Could you please provide:
- Evaluation license terms and duration
- Pricing structure (per-developer, per-deployment, enterprise)
- Licensing restrictions for self-hosted web apps
- Security compliance documentation (SOC2, GDPR, vulnerability disclosure policy)
- Technical support availability during evaluation

Our timeline: We aim to complete the engine evaluation spike within 2 weeks and make a
go/no-go decision by November 15, 2025.

Thank you,
[Your Name]
[Company/Project Name]
```

**Key Questions to Ask**
1. What is the licensing model for a web app with <10k monthly users? <100k?
2. Are there restrictions on self-hosting the SDK vs CDN delivery?
3. What is the bundle size (compressed/uncompressed) for the core viewer + annotation modules?
4. Do you provide a reference implementation for client-side-only workflows (no backend)?
5. How are security vulnerabilities disclosed and patched?
6. What is the typical support SLA during evaluation and post-purchase?

### PSPDFKit for Web

**Initial Outreach Email Template**

```
Subject: Evaluation License Request for Client-Side PDF Editor

Hello PSPDFKit Team,

We are developing a privacy-focused PDF editor that runs entirely in the browser and are
considering PSPDFKit for Web as our PDF engine. Our MVP scope includes:
- PDF viewing and page manipulation
- Rich annotations (highlights, notes, freehand drawing)
- Minor content editing (text boxes, images)
- Export with annotations flattened or preserved

We would appreciate an evaluation license to test:
1. Annotation export fidelity (compatibility with Acrobat, Foxit, Preview)
2. Memory and performance with large documents
3. Offline operation (no server dependency for core editing)
4. Accessibility (keyboard navigation, screen reader support)

Please provide:
- Evaluation license and trial period
- Pricing tiers (startup, SMB, enterprise)
- Licensing terms for client-side web apps (redistribution, updates)
- Compliance documentation (SOC2, GDPR, HIPAA if applicable)
- Integration support and technical resources

Our evaluation window: November 1-15, 2025, with a decision milestone by November 20, 2025.

Best regards,
[Your Name]
[Company/Project Name]
```

**Key Questions to Ask**
1. What is the licensing cost for a SaaS product with <50k users?
2. Can the SDK operate entirely offline (no PSPDFKit server dependency)?
3. What annotation formats are supported (PDF spec annotations vs proprietary)?
4. How do updates and patches work? Are they included in the license?
5. What is your security vulnerability response time and disclosure policy?
6. Do you offer a "startup tier" or discounted pricing for early-stage products?

## Vendor Response Tracker

| Vendor | Contact Date | Response Date | License Granted? | Trial Period | Notes |
|--------|-------------|---------------|------------------|--------------|-------|
| PDFTron | To be sent Nov 1, 2025 | Pending | No | — | Email ready; send after stakeholder approval. |
| PSPDFKit | To be sent Nov 1, 2025 | Pending | No | — | Email ready; send after stakeholder approval. |

## Pricing Summary (to be populated)

| Vendor | Pricing Model | Estimated Annual Cost (10k users) | Estimated Annual Cost (100k users) | Notes |
|--------|---------------|-----------------------------------|-------------------------------------|-------|
| PDFTron | TBD | TBD | TBD | Pending sales conversation. |
| PSPDFKit | TBD | TBD | TBD | Pending sales conversation. |

## Licensing & Compliance Notes

### PDFTron
- **Licensing Restrictions:** TBD
- **Security Compliance:** TBD (SOC2, GDPR)
- **Redistribution Rights:** TBD
- **Support SLA:** TBD

### PSPDFKit
- **Licensing Restrictions:** TBD
- **Security Compliance:** TBD (SOC2, GDPR)
- **Redistribution Rights:** TBD
- **Support SLA:** TBD

## Evaluation Criteria Scoring (Post-Trial)

Use this rubric to score each vendor SDK after hands-on evaluation.

| Criterion | Weight | PDFTron Score (1-5) | PSPDFKit Score (1-5) | Notes |
|-----------|--------|---------------------|----------------------|-------|
| Performance (large PDFs) | 20% | TBD | TBD | Memory usage, render time, responsiveness. |
| Annotation Fidelity | 20% | TBD | TBD | Cross-reader compatibility, PDF spec adherence. |
| Feature Coverage (MVP scope) | 15% | TBD | TBD | Viewer, page mgmt, annotations, basic editing. |
| Bundle Size / Load Time | 10% | TBD | TBD | Impact on initial page load. |
| Ease of Integration | 10% | TBD | TBD | API ergonomics, TypeScript support, docs quality. |
| Security Posture | 10% | TBD | TBD | Vulnerability disclosure, CSP compatibility, audits. |
| Cost / Licensing | 10% | TBD | TBD | Annual cost, restrictions, startup-friendly terms. |
| Support & Roadmap | 5% | TBD | TBD | Responsiveness, feature updates, community. |
| **Total Weighted Score** | 100% | TBD | TBD | — |

## Next Steps
1. ✅ **Email templates finalized** with specific dates (evaluation Nov 1-15, decision by Nov 20)
2. ⏳ **Obtain stakeholder approval** to send vendor outreach emails
3. ⏳ **Send emails** to PDFTron and PSPDFKit sales teams (target: November 1, 2025)
4. ⏳ **Schedule vendor calls** to clarify licensing, pricing, and evaluation setup
5. ⏳ **Grant evaluation licenses** and run micro-spikes from `engine-strategy.md`
6. ⏳ **Populate pricing tables** after vendor conversations
7. ⏳ **Complete scoring rubric** after hands-on evaluation
8. ⏳ **Update engine-strategy.md** with final recommendation

## Outreach Status Summary

**As of October 31, 2025:**
- ✅ Email templates complete and ready to send
- ✅ Evaluation timeline defined (Nov 1-15, 2025)
- ✅ Decision deadline set (Nov 20, 2025)
- ⏳ Awaiting stakeholder approval to initiate vendor contact

**Recommendation:** The current prototype (pdf.js + pdf-lib) meets all performance targets. Vendor evaluation is **optional** unless:
- Advanced annotation features are required (editable annotations, reply threading)
- Enterprise support SLA is mandatory
- Compliance certifications (SOC2/HIPAA) must be vendor-provided

If MVP can launch with flattened annotations (current prototype capability), vendor evaluation can be deferred to Phase 2.

_Status: Ready to send — awaiting stakeholder decision on vendor evaluation priority._
