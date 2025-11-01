# OCR Network Error - Troubleshooting Guide

## 🔴 Issue: NetworkError when initializing OCR

**Error Message:**
```
Uncaught Error: TypeError: NetworkError when attempting to fetch resource.
    t createWorker.js:244
    onmessage onMessage.js:3
```

## 🔧 Root Cause

Tesseract.js needs to download language training data files (~4-5MB) from a CDN. The network error occurs when:
1. CDN is blocked by firewall/proxy
2. Internet connection is unstable
3. CSP (Content Security Policy) blocks the request
4. CORS (Cross-Origin) issues

## ✅ Fixes Applied

### 1. **Explicit CDN Paths**
```javascript
// Before: Default paths (may fail)
this.worker = await Tesseract.createWorker('eng');

// After: Explicit jsdelivr CDN paths
this.worker = await Tesseract.createWorker({
  langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/lang-data',
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core.wasm.js',
  workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/worker.min.js',
  cacheMethod: 'none'
});
```

### 2. **Updated CSP**
Added `https://cdn.jsdelivr.net` to `connect-src`:
```html
<meta http-equiv="Content-Security-Policy"
  content="... connect-src 'self' https://unpkg.com https://cdn.jsdelivr.net; ..." />
```

### 3. **Better Error Messages**
```javascript
if (error.message && error.message.includes('NetworkError')) {
  errorMsg = 'Network error: Could not download OCR language data. Please check your internet connection.';
}
```

### 4. **User Feedback**
Shows clear status during initialization:
- "Loading Tesseract.js library from CDN..."
- "Initializing OCR engine (this may take 10-20 seconds on first use)..."
- "Loading language data..." with progress percentage

## 🌐 What Gets Downloaded

When OCR initializes, Tesseract.js downloads:

1. **tesseract-core.wasm.js** (~2MB)
   - WebAssembly binary for OCR engine
   - Downloaded once per session

2. **eng.traineddata.gz** (~4MB)
   - English language training data
   - Compressed, expands to ~20MB in memory

3. **worker.min.js** (~200KB)
   - Web Worker script
   - Runs OCR in background thread

**Total:** ~6-7MB on first use
**Time:** 10-20 seconds depending on connection

## 🧪 Verification Steps

### 1. Check Internet Connection
```bash
# Ping jsdelivr CDN
ping cdn.jsdelivr.net

# Test URL directly
curl -I https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/lang-data/eng.traineddata.gz
```

### 2. Check Browser Console
Open DevTools (F12) → Console → Look for:
- ✅ "Loading Tesseract.js library from CDN..."
- ✅ "OCR: Loading language data... X%"
- ✅ "✅ OCR Worker ready"

### 3. Check Network Tab
Open DevTools (F12) → Network → Filter: `traineddata`
- Should see: `eng.traineddata.gz` (Status: 200 OK)
- Size: ~4MB
- Time: 5-15 seconds

### 4. Test OCR
```
1. Upload a PDF
2. Click "🔍 OCR Pages"
3. Wait for initialization (first time only)
4. Should process successfully
```

## 🚨 Common Issues & Solutions

### Issue 1: Firewall Blocking CDN
**Symptoms:** Network error immediately
**Solution:** Whitelist `cdn.jsdelivr.net` in firewall

### Issue 2: Corporate Proxy
**Symptoms:** Timeout or CORS error
**Solution:**
- Contact IT to allow jsdelivr CDN
- Or download files locally (see below)

### Issue 3: Slow Connection
**Symptoms:** Takes very long, may timeout
**Solution:**
- Wait longer (up to 30 seconds)
- Use wired connection instead of WiFi
- Close other apps using bandwidth

### Issue 4: Browser Cache Issues
**Symptoms:** Worked before, doesn't work now
**Solution:**
```
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try incognito/private mode
```

### Issue 5: CSP Blocking
**Symptoms:** CSP violation errors in console
**Solution:** Already fixed in updated index.html

## 📦 Local Installation (Alternative)

If CDN access is blocked, download files locally:

### Step 1: Download Required Files
```bash
cd prototype/vendor

# Download Tesseract.js
curl -o tesseract.min.js https://unpkg.com/tesseract.js@5.0.4/dist/tesseract.min.js

# Download Tesseract Core
curl -o tesseract-core.wasm.js https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core.wasm.js

# Download Worker
curl -o worker.min.js https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/worker.min.js

# Create lang-data directory
mkdir lang-data
cd lang-data

# Download English training data
curl -o eng.traineddata.gz https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/lang-data/eng.traineddata.gz
```

### Step 2: Update ocr-handler.js
```javascript
this.worker = await Tesseract.createWorker({
  langPath: '/vendor/lang-data',  // Local path
  corePath: '/vendor/tesseract-core.wasm.js',
  workerPath: '/vendor/worker.min.js',
  logger: (m) => { /* ... */ }
});
```

### Step 3: Update CSP
Remove CDN from CSP if using local files only.

## 🔍 Debugging Tips

### Enable Verbose Logging
```javascript
// In ocr-handler.js, logger function shows all events
logger: (m) => {
  console.log('[OCR]', m.status, m.progress, m);
}
```

### Check Worker Status
```javascript
// In browser console
console.log('Tesseract:', window.Tesseract);
console.log('Worker:', ocrHandler?.worker);
console.log('Initialized:', ocrHandler?.isInitialized);
```

### Monitor Network Requests
```
DevTools → Network → Filter: "traineddata" or "tesseract"
Check:
- Request URL
- Status code (should be 200)
- Response size (eng.traineddata.gz ~4MB)
- Timing (5-20 seconds normal)
```

## 📊 Performance Expectations

| Action | Time | Size | Notes |
|--------|------|------|-------|
| Load Tesseract.js | 1-2s | ~2MB | First time or cache miss |
| Initialize OCR | 10-20s | ~6MB | Downloads language data |
| Process 1 page | 2-5s | 0 | After initialization |
| Process 10 pages | 20-50s | 0 | Linear with page count |

## ✅ Success Criteria

After fixes, you should see:

### Console Output:
```
✅ Tesseract.js loaded from CDN
Loading Tesseract.js library from CDN...
Initializing OCR worker with CDN resources...
OCR: Loading Tesseract core... 100%
OCR: Loading language data... 100%
OCR: Initializing... 100%
✅ OCR Worker ready
```

### UI Behavior:
- Status bar shows progress
- Button disabled during init
- No error alerts
- Text file downloads after OCR

### Network Tab:
- All requests return 200 OK
- No CORS errors
- No timeout errors

## 🆘 If Still Not Working

1. **Check browser console** for specific error
2. **Check network tab** for failed requests
3. **Try different browser** (Chrome, Firefox, Edge)
4. **Disable browser extensions** that might block requests
5. **Check antivirus/firewall** logs
6. **Try incognito mode** to rule out extensions
7. **Check internet connection** to jsdelivr.net
8. **Contact IT** if on corporate network

## 📝 Related Files Modified

- `prototype/src/ocr-handler.js` - CDN paths, error handling
- `prototype/index.html` - Updated CSP
- `prototype/multi-pdf-app.js` - Better status messages
- This troubleshooting guide

## 🎯 Prevention

To avoid this error in future:
1. ✅ Keep CSP updated with required CDN domains
2. ✅ Use explicit CDN paths (not default)
3. ✅ Show progress indicators to users
4. ✅ Add fallback to local files for offline use
5. ✅ Test on different networks (home, mobile, corporate)

---

**Status:** ✅ Fixed in latest version
**Last Updated:** 2025-10-31
**Affected Versions:** v2.0.0 initial release
**Fixed in:** v2.0.1 (current)
