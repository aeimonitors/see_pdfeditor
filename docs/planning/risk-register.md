# Phase 1 Risk Register — Discovery & Planning

This register tracks the top risks identified during Phase 1 along with mitigation and contingency plans. Update continuously as new information emerges.

| ID | Risk | Impact | Likelihood | Mitigation Strategy | Contingency Plan | Owner |
|----|------|--------|------------|---------------------|------------------|-------|
| R1 | WASM engine licensing costs exceed budget | High | Medium | Engage vendors early, negotiate evaluation licenses, keep open-source fallback spike active. | Default to pdf.js + pdf-lib hybrid for MVP while deferring advanced features. | Product + Engineering |
| R2 | Browser memory constraints for large PDFs | High | Medium | Prototype memory profiling with 200MB PDFs; evaluate streaming rendering. | Provide large-file warning + chunked processing, consider native companion for enterprise. | Engineering |
| R3 | Annotation fidelity mismatch across viewers | Medium | High | Validate annotations against Acrobat, PDF Expert, Preview weekly. Adhere strictly to PDF spec. | Release patch to correct annotation export; provide user guidance about supported tools. | QA Lead |
| R4 | Security/privacy regression if optional cloud sync added | High | Medium | Mandate client-side encryption design review before any remote storage work. Use external pen-test. | Disable cloud sync by default; provide local-only mode fallback. | Security Lead |
| R5 | Accessibility goals not met due to tight schedule | Medium | Medium | Define accessibility acceptance tests in Sprint 1, integrate axe/lighthouse checks. | Schedule remediation sprint; collaborate with accessibility consultant. | UX Lead |
| R6 | Browser compatibility issues with WASM engine | Medium | Medium | Include compatibility testing matrix early; require vendor support contract. | Fallback to alternative engine build for affected browsers; document minimum requirements. | Engineering |
| R7 | Legal/compliance delays (SOC2, GDPR) | Medium | Low | Engage legal counsel during Phase 1 to review data flows; map controls to checklist. | Limit feature availability by region; postpone cloud features until compliance passes. | Compliance |

## Monitoring Cadence
- Review this register at the weekly Phase 1 stand-up.
- Update impact/likelihood ratings as discoveries are made.
- Promote mitigations into backlog tasks when action is required.
