# Content Security Policy (CSP) Configuration — P0 Task

This document outlines the implementation of a strict Content Security Policy for the PDF editor prototype and production app.

## Objectives
- Prevent XSS attacks by restricting script sources
- Enforce HTTPS for all external resources
- Disable unsafe inline scripts and eval
- Prepare for production deployment with hardened CSP

## Current State (Prototype)
- No CSP headers configured
- Scripts loaded from CDN (jsDelivr) or local vendor/
- Inline styles used in app (status banner)

## Target CSP Policy

### Development/Prototype CSP
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self';
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```

### Production CSP (Stricter)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}';
  style-src 'self' 'nonce-{RANDOM}';
  img-src 'self' data: blob:;
  connect-src 'self';
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

## Implementation Steps

### Step 1: Add CSP Meta Tag to Prototype
**File:** `prototype/index.html`

Add to `<head>`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';">
```

### Step 2: Remove Inline Styles
**Files:** `prototype/app.js`

Replace inline style assignments with CSS classes:
- Status banner: Use CSS classes instead of `style.background`, `style.borderColor`
- Annotation overlay: Move inline styles to `styles.css`

### Step 3: Vendor Local Files (Remove CDN Dependency)
**Files:** `prototype/vendor/`

Download and place:
- `pdf.min.js`
- `pdf.worker.min.js`
- `pdf-lib.min.js`

Update `vendor-loader.js` to prefer local files.

### Step 4: Add CSP Reporting (Production)
**Server Configuration:**

```
Content-Security-Policy-Report-Only: ... ; report-uri /csp-report
```

Implement `/csp-report` endpoint to log violations.

### Step 5: Test CSP Compliance
**Validation:**
1. Load prototype with CSP enabled
2. Check browser console for CSP violations
3. Test all features (load PDF, annotate, export)
4. Fix any violations before production

## CSP Compliance Checklist

- [ ] CSP meta tag added to `prototype/index.html`
- [ ] Inline styles removed from JavaScript
- [ ] Vendor files vendored locally (optional for prototype)
- [ ] All scripts load successfully with CSP enabled
- [ ] No CSP violations in browser console
- [ ] CSP tested in Chrome, Firefox, Edge, Safari
- [ ] Production CSP policy drafted with nonces
- [ ] CSP report endpoint planned for production

## References
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

## Owner
**Engineering Lead** — Target Completion: Phase 1, Week 2

## Status
**Planned** — Implementation tasks defined; awaiting sprint assignment.
