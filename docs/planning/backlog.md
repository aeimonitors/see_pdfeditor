# Phase 1 Backlog — Discovery & Planning

This backlog captures the prioritized work items that should be completed during Phase 1 (Discovery & Planning). Items are grouped by priority with an explicit owner and expected output. Status should be updated as work progresses.

| Priority | Item | Description | Owner | Output/Deliverable | Status |
|----------|------|-------------|-------|--------------------|--------|
| P0 | Confirm PDF engine strategy | Compare WASM SDK options (PDFTron, PSPDFKit) versus pdf.js + pdf-lib hybrid; document trade-offs, licensing, and security posture. | Engineering Lead | Engine decision document + recommendation (`planning/engine-strategy.md`) | Complete |
| P0 | Security threat modeling | Identify attack surfaces (client bundle, optional backend APIs, encryption key handling) and document mitigations aligned with "secure, client-side" requirements. | Security Engineer | Threat model & mitigation matrix (`planning/security-threat-model.md`) | Complete |
| P0 | MVP scope validation | Validate MVP user stories against stakeholder expectations (review, annotate, minor edits). Ensure scope aligns with Tier 1 requirements in `specs.md`. | Product | Approved MVP scope summary | Not Started |
| P1 | Analytics of target users | Interview 3–5 representative users to capture workflows, pain points, and document sensitivity requirements. | UX/Product | Interview notes + persona updates | Planned |
| P1 | Acceptance criteria refinement | Expand MVP acceptance criteria to include quantifiable performance and accessibility baselines (render times, keyboard navigation). | QA/Engineering | Updated `docs/acceptance-tests.md` | Planned |
| P1 | Compliance checklist alignment | Map existing security checklist to SOC2-type controls and Data Privacy requirements for enterprise prospects. | Legal/Security | Checklist mapping document | Planned |
| P0 | CSP & app shell hardening | Implement strict Content Security Policy for the app shell and prototype; validate during smoke runs. | Engineering | CSP config + sample headers (`implementation/csp-configuration.md`) | Complete |
| P0 | Automate dependency CVE scanning | Enable Dependabot/SCA for pdf.js/pdf-lib and baseline current vulnerabilities; add CI check. | DevOps | Dependabot config + GitHub Actions workflow (`implementation/cve-scanning.md`) | Complete |
| P0 | Large-file detection & UX | Add file-size guardrail (>=200MB) with user warning and optional chunking/streaming plan. | Engineering | UX warning + instrumentation (`implementation/large-file-detection.md`) | Complete |
| P0 | Secure build & SRI | Define secure distribution: self-host vs CDN, apply Subresource Integrity (SRI) or signed bundles for WASM assets. | DevOps + Engineering | Build pipeline doc + SRI hashes (`implementation/secure-build-sri.md`) | Complete |
| P0 | Incident response playbook | Create a lightweight incident response playbook for malicious PDF or supply-chain compromise. | Engineering + DevOps + Legal | Incident response doc (`implementation/incident-response.md`) | Complete |
| P2 | Roadmap drafting | Produce 4-quarter roadmap covering Tier 1 → Tier 3 features with dependency callouts. | Product | Roadmap slide/one-pager | Planned |
| P2 | Partner ecosystem scan | Identify commercial integrations (cloud storage providers, e-sign partners) and note required APIs. | Business/Product | Integration opportunity list | Planned |
| P3 | Pricing & packaging exploration | Outline potential licensing tiers (local-only, cloud-enhanced) and required feature gates. | Product | Pricing framework draft | Backlog |

## Notes
- **Priorities:** P0 (critical to Phase 1 exit), P1 (must complete before Phase 2), P2 (nice-to-have for Phase 1), P3 (can slip to Phase 2 if needed).
- **Owners:** Assigned by functional role (Engineering, DevOps, Product, QA, UX, Security, Legal, Business). Map to specific team members once staffing is finalized.
- **Status:** Use standard kanban states (`Not Started`, `Planned`, `In Progress`, `Blocked`, `Complete`).

## Recent Updates (October 31, 2025)
- ✅ **P0 Security Tasks Complete:** All 5 P0 security implementation documents created (CSP, CVE scanning, large-file detection, secure build/SRI, incident response)
- ✅ **Engine Strategy Complete:** Performance benchmarks executed, all targets met. Annotation approach documented (flattened markup).
- ✅ **Security Threat Model Complete:** Attack surfaces identified, mitigations documented.
