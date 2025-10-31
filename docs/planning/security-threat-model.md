# Security Threat Model — Phase 1 Discovery

This document catalogs the security threats relevant to the Phase 1 MVP scope (local-only, client-side PDF editing) and tracks mitigations. It should be updated as we add features or discover new attack surfaces.

## Scope & Assumptions
- MVP operates entirely in the browser; no remote API calls other than optional telemetry or update checks (currently none).
- Users load PDFs from local disk; files may be sensitive or confidential.
- Browser environment is assumed to be up-to-date Chrome/Edge/Firefox/Safari with standard sandboxing.
- Future phases may introduce optional cloud sync; note deferred risks accordingly.

## High-Level Assets
- **User PDF content** (confidential documents)
- **Annotation and edit data** (in-memory structures prior to export)
- **Exported PDF file** (downloaded artifact)
- **Application source & WASM bundles** (to protect from tampering)

## Attack Surface Overview
| Surface | Description | Notes |
|---------|-------------|-------|
| Local file ingestion | PDF parsing and rendering via pdf.js | Risk of malicious PDFs triggering parser bugs or memory pressure. |
| WASM libraries | pdf.js/pdf-lib or commercial SDK binaries | Need integrity checks and trusted distribution. |
| DOM & scripting | UI components handling annotations, drag/drop, etc. | Potential XSS if any external content injected (e.g., future collaboration). |
| Browser storage | Potential autosave/local persistence | Not in MVP but track for future autosave features. |
| Optional integrations | Telemetry, cloud storage (Phase 2+) | Out-of-scope but document deferred controls. |

## STRIDE Analysis Snapshot
| Threat | Description | Mitigations | Residual Risk |
|--------|-------------|-------------|---------------|
| **Spoofing** | User downloads tampered bundle (MITM or compromised CDN). | Publish via HTTPS with Subresource Integrity (SRI), consider self-hosting assets, enable CSP `script-src` nonce. | Medium — ensure CI signs artifacts if we move to app shell. |
| **Tampering** | Malicious PDF attempts to exploit pdf.js parsing to execute code. | Keep pdf.js updated, run fuzz-tested builds, enable `pdfjsLib.GlobalWorkerOptions.workerSrc` from trusted source, consider Content Security Policy with `sandbox`. | Medium — monitor CVEs, plan for auto-update. |
| **Repudiation** | Lack of audit for local edits. | Not applicable for local-only MVP; document gap for enterprise. | Low. |
| **Information Disclosure** | Data leakage through network calls or telemetry. | No outbound requests; run smoke tests with network inspector; pin `fetch` usage; add CSP to prevent accidental image beacons. | Low if enforced. |
| **Denial of Service** | Large PDFs cause memory exhaustion/crash. | Enforce file-size guardrails, streaming render backlog item, surface warnings to user. | Medium — communicate limits. |
| **Elevation of Privilege** | Third-party WASM executes privileged actions. | Run in browser sandbox, audit vendor modules, require signed releases. | Low/Medium depending on vendor choice. |

## Mitigation Checklist (converted to actionable work)
The items below have been converted to concrete backlog tasks (see `docs/planning/backlog.md`).

- Configure strict Content Security Policy for prototype/app shell. (Backlog task: CSP config — Planned)
- Automate dependency CVE scanning (e.g., enable Dependabot or SCA). (Backlog task: CVE scanning automation — Planned)
- Add large-file detection and user warnings (>=200 MB) to mitigate memory DoS. (Backlog task: Large-file detection & UX — Planned)
- Document and implement a secure build pipeline for WASM/CDN assets (SRI / signed assets). (Backlog task: Secure build & SRI — Planned)
- Draft an incident response procedure for malicious PDF discoveries (playbook + contact list). (Backlog task: Incident response plan — Planned)

Action: I added these tasks to the Phase 1 backlog so owners can be assigned and work planned.

## Open Questions
1. Do we require offline SRI hashes if serving assets from CDN in MVP?
2. Should we embed antivirus scanning guidance for enterprise customers (out-of-scope for MVP but good to note)?
3. For commercial SDKs, what security attestations (SOC2, ISO) do vendors provide?

## Next Actions
1. Review this model with Security team in Phase 1 Week 1.
2. Convert checked mitigations into backlog tasks (P0/P1) where engineering effort is required.
3. Align with compliance checklist once available to ensure consistency.

_Status: Draft — populate findings after security review workshop._
