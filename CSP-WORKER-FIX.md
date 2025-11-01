# CSP Web Worker Fix for Tesseract.js

## 🔴 Error
```
Content-Security-Policy: The page's settings blocked the loading of a resource (connect-src)
at data:application/octet-stream;base64,... because it violates the following directive:
"connect-src 'self' https://unpkg.com https://cdn.jsdelivr.net"

Uncaught (in promise) DOMException: Function object could not be cloned.
```

## 🔧 Root Cause

Tesseract.js creates Web Workers dynamically using:
1. **Data URIs** (`data:application/octet-stream;base64,...`)
2. **Blob URLs** (`blob:http://localhost/...`)

The CSP was blocking these because `connect-src` and `worker-src` didn't allow `data:` and `blob:` sources.

## ✅ Solution

Updated Content Security Policy to allow data URIs and blob URLs:

### Before:
```html
<meta http-equiv="Content-Security-Policy"
  content="... connect-src 'self' https://unpkg.com https://cdn.jsdelivr.net;
  ... worker-src 'self' blob:;
  ... frame-ancestors 'none';" />
```

### After:
```html
<meta http-equiv="Content-Security-Policy"
  content="... connect-src 'self' https://unpkg.com https://cdn.jsdelivr.net data: blob:;
  ... worker-src 'self' blob: data:;" />
```

### Changes Made:
1. **connect-src**: Added `data:` and `blob:`
2. **worker-src**: Added `data:`
3. **Removed**: `frame-ancestors` (not supported in meta tags)

## 📋 Complete CSP

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net https://unpkg.com 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self' https://unpkg.com https://cdn.jsdelivr.net data: blob:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  worker-src 'self' blob: data:;" />
```

## 🎯 What Each Directive Does

### script-src
- `'self'` - Allow scripts from same origin
- `https://cdn.jsdelivr.net` - Allow pdf.js, Tesseract from jsdelivr
- `https://unpkg.com` - Allow Tesseract.js from unpkg
- `'unsafe-inline'` - Allow inline scripts (vendor-loader)
- `'unsafe-eval'` - Required for WebAssembly (Tesseract core)

### connect-src
- `'self'` - Allow fetch/XHR to same origin
- `https://unpkg.com` - Download Tesseract.js
- `https://cdn.jsdelivr.net` - Download language data
- `data:` - **NEW** Allow data URIs for workers
- `blob:` - **NEW** Allow blob URLs for workers

### worker-src
- `'self'` - Allow workers from same origin
- `blob:` - Allow blob URL workers
- `data:` - **NEW** Allow data URI workers

## 🔍 Why Tesseract Needs This

Tesseract.js creates Web Workers like this:

```javascript
// Tesseract creates a worker using data URI
const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob); // Creates blob:http://...
const worker = new Worker(workerUrl);

// Worker communicates via data URIs
worker.postMessage({
  action: 'init',
  data: 'data:application/octet-stream;base64,...'
});
```

Without `data:` and `blob:` in CSP:
- ❌ Worker creation fails
- ❌ "Function object could not be cloned"
- ❌ OCR doesn't work

With `data:` and `blob:`:
- ✅ Worker created successfully
- ✅ OCR initializes
- ✅ Text extraction works

## 🔒 Security Considerations

### Is This Safe?

**Yes, but with caveats:**

**Safe because:**
- Only our code creates workers
- Workers run in isolated context
- No user-generated data: URIs
- Tesseract is from trusted CDN

**Risk mitigation:**
- Workers can't access DOM
- Workers can't access parent scope
- Strict CSP for other directives
- All downloads from HTTPS

**Alternative (more secure):**
If concerned about `data:` URIs, host worker files locally:
```javascript
// Instead of data URI worker
const worker = new Worker('/vendor/tesseract-worker.js');
```

But this requires downloading and hosting all Tesseract files.

## ✅ Verification

After the fix, check:

### Console Output:
```
✅ Multi-PDF page detected - modules loaded via HTML
✅ All application modules loaded successfully
✅ Tesseract.js loaded from CDN
Initializing OCR worker with CDN resources...
OCR: Loading Tesseract core... 100%
OCR: Loading language data... 100%
✅ OCR Worker ready
```

### No Errors:
- ❌ NO "blocked loading of resource (connect-src)"
- ❌ NO "Function object could not be cloned"
- ❌ NO CSP violations

### OCR Works:
1. Upload a PDF
2. Click "🔍 OCR Pages"
3. See initialization progress
4. Text extracts successfully
5. Text file downloads

## 🐛 CSP Warnings to Ignore

### frame-ancestors Warning
```
Content-Security-Policy: Ignoring source 'frame-ancestors'
(Not supported when delivered via meta element)
```

**This is harmless.** `frame-ancestors` only works in HTTP headers, not meta tags. We removed it from the CSP to eliminate the warning.

If you need `frame-ancestors`, set it via HTTP header:
```
Content-Security-Policy: frame-ancestors 'none'
```

### Local Files Not Found (404s)
```
GET http://localhost:5173/prototype/vendor/pdf.min.js
[HTTP/1 404 File not found]
Local pdf.min.js not found, falling back to CDN with SRI
```

**This is expected behavior.** The vendor-loader tries local files first, then falls back to CDN. Everything works fine.

## 📁 Files Modified

- `prototype/index.html` - Updated CSP meta tag

## 🧪 Testing

```bash
npm run dev
# Visit http://localhost:5173/prototype/
```

1. Open browser console (F12)
2. Check for CSP errors - should be none
3. Upload a PDF file
4. Click "🔍 OCR Pages"
5. Watch console for: "✅ OCR Worker ready"
6. OCR should complete successfully

## 📚 References

- [CSP worker-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/worker-src)
- [CSP connect-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/connect-src)
- [Tesseract.js Worker Creation](https://github.com/naptha/tesseract.js/blob/master/docs/worker.md)

## 📝 Summary

**Problem:** CSP blocked Tesseract's Web Worker creation
**Cause:** `data:` and `blob:` not allowed in connect-src and worker-src
**Solution:** Added `data:` and `blob:` to both directives
**Result:** OCR workers create successfully, OCR works perfectly

---

**Status:** ✅ Fixed
**Version:** v2.0.1
**Date:** 2025-10-31
