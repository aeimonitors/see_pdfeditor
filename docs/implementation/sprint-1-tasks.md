# Sprint 1 Tasks — Security Infrastructure

**Sprint Duration:** November 1-14, 2025 (2 weeks)
**Sprint Goal:** Implement all P0 security controls and establish CI/CD foundation

---

## Week 1 Tasks (Nov 1-7)

### Task 1.1: Implement Content Security Policy
**Owner:** Engineering
**Priority:** P0
**Estimate:** 4 hours
**Reference:** `docs/implementation/csp-configuration.md`

**Subtasks:**
- [ ] Add CSP meta tag to `prototype/index.html` (dev policy)
- [ ] Create production CSP configuration file
- [ ] Test CSP with browser DevTools
- [ ] Verify no violations in console
- [ ] Document any exceptions/bypasses needed

**Acceptance Criteria:**
- CSP meta tag present in HTML
- Zero CSP violations in browser console
- External scripts (jsDelivr CDN) load successfully
- Inline styles work where needed (with nonce or hash)

**Testing:**
```bash
# Open prototype in browser
# Check DevTools Console for CSP violations
# Verify no red errors
```

---

### Task 1.2: Set Up Dependabot for CVE Scanning
**Owner:** DevOps
**Priority:** P0
**Estimate:** 2 hours
**Reference:** `docs/implementation/cve-scanning.md`

**Subtasks:**
- [ ] Create `.github/dependabot.yml` configuration
- [ ] Enable npm ecosystem scanning
- [ ] Enable Python ecosystem scanning (if applicable)
- [ ] Set weekly update schedule
- [ ] Configure PR auto-labeling

**Acceptance Criteria:**
- Dependabot config file exists
- First scan completes successfully
- Sample PR created for dependency update
- Alerts visible in Security tab

**Configuration:**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

### Task 1.3: GitHub Actions Security Scan Workflow
**Owner:** DevOps
**Priority:** P0
**Estimate:** 3 hours
**Reference:** `docs/implementation/cve-scanning.md`

**Subtasks:**
- [ ] Create `.github/workflows/security-scan.yml`
- [ ] Add `npm audit` step
- [ ] Add Python `safety` check (if using pip)
- [ ] Configure to fail on high/critical vulns
- [ ] Test workflow execution

**Acceptance Criteria:**
- Workflow runs on every push to main
- npm audit executes successfully
- Build fails if critical vulnerabilities found
- Workflow status visible in PR checks

**Workflow:**
```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1'  # Weekly Monday midnight
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --audit-level=moderate
```

---

### Task 1.4: Generate SRI Hashes for Vendor Assets
**Owner:** Engineering
**Priority:** P0
**Estimate:** 3 hours
**Reference:** `docs/implementation/secure-build-sri.md`

**Subtasks:**
- [ ] Create `prototype/generate-sri.js` script
- [ ] Generate hashes for pdf.js, pdf-lib, pdf.worker
- [ ] Save hashes to `prototype/vendor-sri.json`
- [ ] Update `vendor-loader.js` with integrity attributes
- [ ] Test SRI verification in browser

**Acceptance Criteria:**
- SRI hashes generated for all vendor assets
- `vendor-loader.js` includes integrity attributes
- Scripts load successfully with SRI
- Tampered script is rejected by browser

**Script:**
```javascript
// prototype/generate-sri.js
const crypto = require('crypto');
const https = require('https');

const assets = [
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js'
];

// Fetch, hash, output SRI
```

---

## Week 2 Tasks (Nov 8-14)

### Task 2.1: Implement Large-File Detection UX
**Owner:** Engineering
**Priority:** P0
**Estimate:** 6 hours
**Reference:** `docs/implementation/large-file-detection.md`

**Subtasks:**
- [ ] Add file size check to file input handler
- [ ] Create warning dialog component (50-200 MB)
- [ ] Create error dialog component (> 200 MB)
- [ ] Add info banner for 10-50 MB files
- [ ] Implement thumbnail-only rendering mode
- [ ] Add UI toggle for render mode

**Acceptance Criteria:**
- Files 10-50 MB show info banner
- Files 50-200 MB show warning dialog with proceed/cancel
- Files > 200 MB blocked with error message
- Thumbnail-only mode renders first 10 thumbnails
- Toggle button switches between modes

**Testing:**
```bash
# Generate test files
python prototype/generate_test_pdf.py --pages 5000 --output test-huge.pdf

# Load in prototype
# Verify warning appears
# Test proceed and cancel actions
```

---

### Task 2.2: Add Memory Monitoring
**Owner:** Engineering
**Priority:** P1
**Estimate:** 4 hours

**Subtasks:**
- [ ] Create `src/utils/performance-monitor.js` module
- [ ] Track `performance.memory.usedJSHeapSize`
- [ ] Log memory usage at key milestones
- [ ] Add warning if approaching 800 MB
- [ ] Display memory usage in dev mode

**Acceptance Criteria:**
- Memory tracking active during PDF operations
- Console logs show memory at load, render, export
- Warning appears if memory > 800 MB
- No memory leaks (10 consecutive loads)

---

### Task 2.3: Refactor Prototype Code
**Owner:** Engineering
**Priority:** P0
**Estimate:** 8 hours

**Subtasks:**
- [ ] Split `app.js` into modules (viewer, annotations, export)
- [ ] Add error handling to all async functions
- [ ] Create constants file for configuration
- [ ] Add JSDoc comments to functions
- [ ] Set up ESLint and Prettier

**Acceptance Criteria:**
- Code organized into logical modules
- Try/catch blocks around all async operations
- All functions have JSDoc comments
- ESLint passes with zero warnings
- Code follows consistent style guide

---

### Task 2.4: Set Up CI/CD Pipeline
**Owner:** DevOps
**Priority:** P0
**Estimate:** 6 hours

**Subtasks:**
- [ ] Create `.github/workflows/ci.yml`
- [ ] Add linting step (ESLint)
- [ ] Add unit test runner (if tests exist)
- [ ] Configure to run on PR and push
- [ ] Set up status checks for PR merges

**Acceptance Criteria:**
- CI workflow runs on every PR
- Linting passes before merge allowed
- PR cannot merge if CI fails
- Workflow status visible in GitHub UI

---

## Sprint 1 Checklist

### Security Controls
- [ ] CSP implemented and tested
- [ ] Dependabot active and scanning
- [ ] Security scan workflow running
- [ ] SRI hashes generated and integrated
- [ ] Large-file detection functional

### Code Quality
- [ ] Prototype refactored into modules
- [ ] Error handling added
- [ ] Code documentation (JSDoc)
- [ ] Linting configured and passing

### CI/CD
- [ ] CI workflow running on PRs
- [ ] Security scans automated
- [ ] Status checks enforced

### Documentation
- [ ] Implementation notes captured
- [ ] Known issues documented
- [ ] Next sprint tasks identified

---

## Sprint Review (Nov 14, 2025)

**Agenda:**
1. Demo implemented security controls
2. Review sprint completion metrics
3. Discuss blockers and challenges
4. Plan Sprint 2 tasks

**Demo Checklist:**
- [ ] Load PDF with CSP active (no violations)
- [ ] Trigger large-file warning with 100 MB PDF
- [ ] Show Dependabot PR for dependency update
- [ ] Display security scan results in GitHub Actions
- [ ] Demonstrate SRI hash verification

---

## Sprint Retrospective

**What went well?**
- [To be filled after sprint]

**What could be improved?**
- [To be filled after sprint]

**Action items for next sprint:**
- [To be filled after sprint]

---

**Sprint Status:** Ready to start
**Last Updated:** October 31, 2025
**Sprint Master:** [To be assigned]
