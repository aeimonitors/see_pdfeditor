Security, QA & release checklists

Security (critical)
- Client-side processing: Verify no raw PDF bytes are sent to servers by default.
- CSP: enforce a strict Content-Security-Policy, disallow unsafe-eval and inline scripts where possible.
- TLS: all endpoints (auth, metadata) must use HTTPS.
- Secrets: never bake private keys or secrets into client bundles.
- Zero-knowledge uploads: If cloud save is implemented, perform AES-256 client-side encryption and derive keys with PBKDF2/Argon2.

QA
- Unit tests for core utilities and UI logic.
- Integration tests for engine adapters.
- E2E tests for core flows (open, annotate, export).
- Accessibility: automations (axe) + keyboard/manual checks.

Release checklist
- All critical/high issues resolved.
- Security checklist verified in staging.
- Accessibility AA checks pass.
- Release notes prepared and reviewed.
