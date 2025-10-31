# Secure Build Pipeline & Subresource Integrity — P0 Task

This document defines the secure build pipeline configuration and Subresource Integrity (SRI) implementation to protect against supply chain attacks.

## Objectives
- Ensure all dependencies are verified and locked with hashes
- Implement SRI for all CDN-loaded assets
- Automate security checks in CI/CD pipeline
- Provide integrity verification for vendor scripts

## Current State (Prototype)
- Vendor scripts loaded from jsDelivr CDN without SRI
- No hash verification for loaded assets
- Local vendor files have no integrity checks
- Vulnerable to CDN compromise or MITM attacks

## Target Security Posture

### Subresource Integrity (SRI)

**SRI ensures:**
- Browser verifies file hash before execution
- Prevents execution of tampered scripts
- Fails safely if CDN is compromised
- Works with both CDN and local fallback assets

**SRI Hash Format:**
```
sha384-[base64-encoded-hash]
```

### Dependency Locking

**All dependencies must:**
- Be pinned to specific versions (not `^` or `~` ranges)
- Have checksums verified during install
- Be scanned for known CVEs (via Dependabot)
- Be reviewed before major version upgrades

## Implementation Steps

### Step 1: Generate SRI Hashes for Vendor Assets

**Tool:** Use `openssl` or online SRI generator

```powershell
# Generate SHA-384 hash for pdf.js
curl -o pdfjs.js https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js
openssl dgst -sha384 -binary pdfjs.js | openssl base64 -A

# Generate hash for pdf-lib
curl -o pdflib.js https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js
openssl dgst -sha384 -binary pdflib.js | openssl base64 -A
```

**Automated SRI generation script:**

**File:** `prototype/generate-sri.js`

```javascript
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');

const assets = [
  {
    name: 'pdf.js',
    url: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js'
  },
  {
    name: 'pdf-lib',
    url: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'
  },
  {
    name: 'pdf.worker.js',
    url: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js'
  }
];

function generateSRI(buffer) {
  const hash = crypto.createHash('sha384').update(buffer).digest('base64');
  return `sha384-${hash}`;
}

async function fetchAndHash(asset) {
  return new Promise((resolve, reject) => {
    https.get(asset.url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const sri = generateSRI(buffer);
        console.log(`${asset.name}: ${sri}`);
        resolve({ name: asset.name, url: asset.url, integrity: sri });
      });
    }).on('error', reject);
  });
}

(async () => {
  console.log('Generating SRI hashes...\n');
  const results = await Promise.all(assets.map(fetchAndHash));

  console.log('\n--- vendor-sri.json ---');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync('vendor-sri.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to vendor-sri.json');
})();
```

### Step 2: Update vendor-loader.js with SRI

**File:** `prototype/vendor-loader.js`

```javascript
// SRI hashes for vendor assets (generated via generate-sri.js)
const vendorAssets = {
  'pdfjs': {
    local: 'vendor/pdf.min.js',
    cdn: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js',
    integrity: 'sha384-[REPLACE_WITH_ACTUAL_HASH]',
    test: () => typeof pdfjsLib !== 'undefined'
  },
  'pdflib': {
    local: 'vendor/pdf-lib.min.js',
    cdn: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
    integrity: 'sha384-[REPLACE_WITH_ACTUAL_HASH]',
    test: () => typeof PDFLib !== 'undefined'
  },
  'worker': {
    local: 'vendor/pdf.worker.min.js',
    cdn: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js',
    integrity: 'sha384-[REPLACE_WITH_ACTUAL_HASH]',
    test: () => true // Worker loaded by pdf.js
  }
};

function loadScript(src, integrity) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = 'anonymous'; // Required for SRI
    }
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function loadAsset(name, config) {
  try {
    // Try local first (with integrity check for production)
    await loadScript(config.local, config.integrity);
    if (config.test()) {
      statusTracker[name] = 'local';
      return;
    }
  } catch (err) {
    console.warn(`Local ${name} failed, trying CDN...`);
  }

  // Fallback to CDN (always with SRI)
  await loadScript(config.cdn, config.integrity);
  if (config.test()) {
    statusTracker[name] = 'CDN';
  } else {
    throw new Error(`${name} failed to load from both local and CDN`);
  }
}
```

### Step 3: Configure CSP to Require SRI

**File:** `prototype/index.html`

Update CSP policy to enforce SRI for scripts:

```html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net 'require-sri-for script';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    connect-src 'self';
  ">
```

**Note:** `'require-sri-for script'` is deprecated in CSP Level 3, but `script-src` can still enforce SRI by rejecting scripts without integrity attributes in strict mode.

### Step 4: Implement Package Lock Verification

**File:** `.github/workflows/security-scan.yml`

Add package lock verification:

```yaml
- name: Verify npm package-lock integrity
  run: |
    npm ci --audit
    npm audit --audit-level=moderate
```

**For Python (future):**

```yaml
- name: Verify pip dependencies
  run: |
    pip install --require-hashes -r requirements.txt
```

**File:** `requirements.txt` (with hashes)

```
reportlab==3.6.12 \
    --hash=sha256:abc123...
mkdocs==1.4.2 \
    --hash=sha256:def456...
```

### Step 5: Automate SRI Updates in CI

**File:** `.github/workflows/update-sri.yml`

```yaml
name: Update SRI Hashes

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Mondays
  workflow_dispatch:

jobs:
  update-sri:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Generate SRI hashes
        run: |
          cd prototype
          node generate-sri.js

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update SRI hashes for vendor assets'
          title: 'Update Subresource Integrity Hashes'
          body: 'Automated weekly SRI hash update for vendor scripts.'
          branch: chore/update-sri
```

## Secure Build Pipeline Checklist

- [ ] SRI hashes generated for all CDN assets
- [ ] `vendor-loader.js` updated with SRI verification
- [ ] CSP policy enforces SRI for external scripts
- [ ] `package-lock.json` / `requirements.txt` includes hashes
- [ ] CI pipeline verifies package integrity
- [ ] Automated SRI update workflow configured
- [ ] Fallback handling for SRI verification failures
- [ ] Documentation updated with SRI maintenance process

## SRI Failure Handling

**Scenario 1: CDN Compromised**
- Browser blocks script execution
- Vendor-loader catches error
- Fallback to local vendor files
- Alert user: "Using local vendor files due to CDN verification failure"

**Scenario 2: Local File Tampered**
- SRI check fails (if enabled for local in production)
- Vendor-loader tries CDN
- If both fail, block app initialization
- Display security warning to user

**Implementation:**

```javascript
try {
  await loadScript(config.local, config.integrity);
} catch (err) {
  if (err.message.includes('integrity')) {
    console.error('SRI verification failed for local asset');
    alert('Security Warning: Local asset integrity check failed. Using CDN.');
  }
  await loadScript(config.cdn, config.integrity);
}
```

## Testing SRI Implementation

1. **Valid SRI:** Load page, verify scripts execute
2. **Tampered CDN:** Modify CDN URL hash, verify browser blocks script
3. **Tampered Local:** Modify local file, verify SRI failure (if enabled)
4. **Fallback Test:** Block CDN, verify local fallback works with SRI

**Browser DevTools Check:**
```
Console should show:
✅ pdf.js loaded with integrity verification
✅ pdf-lib loaded with integrity verification

Network tab should show:
Status 200, Integrity: sha384-...
```

## References
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [SRI Hash Generator](https://www.srihash.org/)
- [CSP: require-sri-for](https://www.w3.org/TR/CSP3/#directive-require-sri-for)
- [npm: package-lock.json integrity](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json#integrity)

## Owner
**DevOps + Engineering** — Target Completion: Phase 1, Week 2

## Status
**Planned** — SRI hash generation and vendor-loader updates required.
