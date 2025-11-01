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
- **Cross-browser testing**: Verify page drag-and-drop works consistently across browsers
- **Mobile testing**: Confirm touch drag-and-drop works on iOS Safari and Android Chrome

UI/UX Validation (Critical - Recently Fixed)
✅ Page Drag State Bug (Nov 1, 2025):
  - Verify pages stay in correct position after drag-and-drop
  - Confirm smooth scroll animation keeps moved page visible
  - Test both mouse drag (desktop) and touch drag (mobile)
  - Ensure no "jumping back" to page 1 after reordering
  - Reference: `docs/Error.mp4` (before fix), `docs/new-error.mp4` (after fix)

✅ Icon Alignment (Nov 1, 2025):
  - Verify page action buttons (🔍 ↻ ×) are properly aligned
  - Confirm consistent button heights across all screen sizes
  - Test button hover states and accessibility
  - Reference: `prototype/multi-pdf-styles.css` lines 381-549

Release checklist
- All critical/high issues resolved.
- Security checklist verified in staging.
- Accessibility AA checks pass.
- Release notes prepared and reviewed.
