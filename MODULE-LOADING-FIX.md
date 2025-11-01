# Module Loading Error Fix

## 🔴 Error
```
Uncaught TypeError: can't access property "addEventListener", fileInput is null
    <anonymous> http://localhost:5173/prototype/app-refactored.js:715
```

## 🔧 Root Cause

The `vendor-loader.js` was loading single-PDF app modules (`app-refactored.js`, `viewer.js`, `annotations.js`, etc.) for **all pages**, including the multi-PDF editor which doesn't have the required DOM elements like `#fileInput`.

### What Was Happening:
1. User loads `index.html` (multi-PDF editor)
2. `vendor-loader.js` loads
3. It blindly loads `app-refactored.js` (single-PDF app)
4. `app-refactored.js` tries to find `#fileInput` element
5. Element doesn't exist → `fileInput is null`
6. `fileInput.addEventListener(...)` → TypeError!

## ✅ Solution

Updated `vendor-loader.js` to detect which page is loading and only load the appropriate modules.

### Detection Logic:
```javascript
// Check which page we're on
const isMultiPDF = document.getElementById('multiDropZone') !== null;
const isSinglePDF = document.getElementById('fileInput') !== null;

if (isSinglePDF && !isMultiPDF) {
  // Load single-PDF modules only
  await loadScript('src/viewer.js');
  await loadScript('src/annotations.js');
  await loadScript('src/export.js');
  await loadScript('app-refactored.js');
} else if (isMultiPDF) {
  // Multi-PDF loads its own modules via HTML script tags
  console.info('Multi-PDF page - modules loaded via HTML');
}
```

### Page Detection:
- **Multi-PDF page** (`index.html`): Has `#multiDropZone` element
- **Single-PDF page** (`single-pdf.html`): Has `#fileInput` element

## 📋 Module Loading Strategy

### Multi-PDF Editor (`index.html`)
Modules loaded via HTML `<script>` tags:
```html
<script src="vendor-loader.js"></script>
<script src="src/ocr-handler.js"></script>
<script src="src/multi-pdf-manager.js"></script>
<script src="src/multi-pdf-ui.js"></script>
<script src="multi-pdf-app.js"></script>
```

### Single-PDF Editor (`single-pdf.html`)
Modules loaded via `vendor-loader.js`:
```html
<script src="vendor-loader.js"></script>
<!-- vendor-loader.js automatically loads: -->
<!-- - src/utils/performance-monitor.js -->
<!-- - src/viewer.js -->
<!-- - src/annotations.js -->
<!-- - src/export.js -->
<!-- - app-refactored.js -->
```

## 🎯 Benefits

1. **No Conflicts**: Each page only loads its required modules
2. **Faster Loading**: No unnecessary modules loaded
3. **Cleaner Errors**: Each app runs independently
4. **Maintainable**: Clear separation of concerns

## 📁 Files Modified

### `prototype/vendor-loader.js`
```javascript
// Before: Always loaded single-PDF modules
await loadScript('src/viewer.js');
await loadScript('app-refactored.js');

// After: Conditional loading based on page
if (isSinglePDF && !isMultiPDF) {
  // Load single-PDF modules
}
```

## 🧪 Testing

### Test Multi-PDF Page:
```bash
npm run dev
# Visit http://localhost:5173/prototype/
```
✅ Should load without errors
✅ Console: "Multi-PDF page detected - modules loaded via HTML"
✅ No "fileInput is null" error
✅ All multi-PDF features work

### Test Single-PDF Page:
```bash
npm run dev
# Visit http://localhost:5173/prototype/single-pdf.html
```
✅ Should load without errors
✅ Console: "Single-PDF modules loaded successfully"
✅ All single-PDF features work
✅ Annotations, undo/redo work

## 📊 Console Output

### Multi-PDF Page:
```
PDF assets loaded: {pdfjs: "...", pdfLib: "...", pdfWorker: "..."}
Tesseract.js loading in background...
✅ Multi-PDF page detected - modules loaded via HTML
✅ All application modules loaded successfully
Multi-PDF Editor initialized successfully
```

### Single-PDF Page:
```
PDF assets loaded: {pdfjs: "...", pdfLib: "...", pdfWorker: "..."}
Tesseract.js loading in background...
✅ Single-PDF modules loaded successfully
✅ All application modules loaded successfully
Performance monitor initialized
```

## 🔍 Troubleshooting

### Error Still Occurs?
1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Browser cache may have old vendor-loader.js
3. **Check console**: Look for which modules are loading
4. **Check Network tab**: Verify vendor-loader.js is latest version

### Wrong Modules Loading?
1. **Check URL**: Are you on the correct page?
2. **Inspect HTML**: Use DevTools to check element IDs
3. **Console log**: Add `console.log(isMultiPDF, isSinglePDF)` to debug

### Modules Not Loading?
1. **Check file paths**: Ensure all files exist
2. **Check console**: Look for 404 errors
3. **Verify structure**: Files should be in `prototype/src/`

## 🎨 Architecture

```
prototype/
├── index.html                  # Multi-PDF (default)
│   └── Loads: vendor-loader.js + multi-pdf modules
│
├── single-pdf.html             # Single-PDF mode
│   └── Loads: vendor-loader.js (auto-loads single-pdf modules)
│
├── vendor-loader.js            # Smart loader
│   ├── Always loads: PDF.js, pdf-lib, Tesseract.js
│   └── Conditionally loads: Single-PDF modules
│
├── multi-pdf-app.js            # Multi-PDF main app
├── app-refactored.js           # Single-PDF main app
│
└── src/
    ├── multi-pdf-manager.js    # Multi-PDF only
    ├── multi-pdf-ui.js         # Multi-PDF only
    ├── ocr-handler.js          # Shared (Multi-PDF only for now)
    ├── viewer.js               # Single-PDF only
    ├── annotations.js          # Single-PDF only
    └── export.js               # Single-PDF only
```

## ✅ Verification Checklist

- [x] Multi-PDF page loads without errors
- [x] Single-PDF page loads without errors
- [x] No "fileInput is null" error
- [x] No "multiDropZone is null" error
- [x] Multi-PDF features work (upload, merge, rotate, delete)
- [x] Single-PDF features work (annotations, undo/redo)
- [x] OCR works on multi-PDF page
- [x] Console shows correct module loading
- [x] No 404 errors in Network tab

## 📝 Summary

**Problem:** vendor-loader.js loaded wrong modules for each page
**Solution:** Added page detection to load appropriate modules
**Result:** Both pages work independently without conflicts
**Impact:** Cleaner code, faster loading, better maintainability

---

**Status:** ✅ Fixed
**Version:** v2.0.1
**Date:** 2025-10-31
