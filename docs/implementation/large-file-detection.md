# Large File Detection & User Warnings — P0 Task

This document outlines the implementation of large-file detection and user-facing warnings to prevent memory exhaustion and poor UX.

## Objectives
- Detect PDFs >= 50 MB before rendering begins
- Warn users about potential performance issues
- Provide graceful degradation options (thumbnail-only mode, chunked rendering)
- Prevent browser crashes from memory exhaustion

## Current State (Prototype)
- No file size detection
- All PDFs rendered immediately regardless of size
- Potential for browser hang or crash with very large files

## Target Behavior

### File Size Thresholds
- **< 10 MB:** No warning, render normally
- **10-50 MB:** Show info message: "Large file detected. Rendering may take a moment."
- **50-200 MB:** Show warning with option to proceed or cancel
- **> 200 MB:** Block rendering, suggest alternative workflow (e.g., split PDF first)

### Warning UI Design

**Warning Dialog (50-200 MB):**
```
⚠️ Large PDF Detected

This PDF is [SIZE] MB with [PAGE_COUNT] pages.
Rendering may take significant time and memory.

Options:
[ ] Render thumbnails only (faster)
[ ] Render all pages (may be slow)
[Cancel] [Proceed]
```

**Error Message (> 200 MB):**
```
🚫 PDF Too Large

This PDF ([SIZE] MB) exceeds the maximum supported size (200 MB).

Recommendations:
- Use a PDF splitting tool to reduce file size
- Process the PDF in smaller chunks
- Consider using a desktop PDF editor for large files

[OK]
```

## Implementation Steps

### Step 1: Add File Size Detection

**File:** `prototype/app.js`

Add to `fileInput` event handler:
```javascript
fileInput.addEventListener('change', async (ev) => {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;

  // Check file size before processing
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB > 200) {
    showError('PDF Too Large',
      `This PDF (${fileSizeMB.toFixed(1)} MB) exceeds the maximum supported size (200 MB).\\n\\nRecommendations:\\n- Split the PDF into smaller files\\n- Use a desktop PDF editor for large files`);
    return;
  }

  if (fileSizeMB >= 50) {
    const proceed = await showLargeFileWarning(fileSizeMB);
    if (!proceed) return;
  } else if (fileSizeMB >= 10) {
    showInfoBanner(`Large file detected (${fileSizeMB.toFixed(1)} MB). Rendering may take a moment...`);
  }

  // ... existing load logic
});
```

### Step 2: Implement Warning Dialog

**File:** `prototype/app.js`

```javascript
function showLargeFileWarning(sizeMB) {
  return new Promise((resolve) => {
    const message = `This PDF is ${sizeMB.toFixed(1)} MB. Rendering may take significant time and memory.\\n\\nDo you want to proceed?`;
    const proceed = window.confirm(message);
    resolve(proceed);
  });
}

function showInfoBanner(message) {
  const statusEl = document.getElementById('vendor-status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.style.background = '#fffef0';
    statusEl.style.borderColor = '#ffe066';
  }
}

function showError(title, message) {
  alert(`${title}\\n\\n${message}`);
}
```

### Step 3: Add Thumbnail-Only Rendering Mode

**File:** `prototype/app.js`

```javascript
let renderMode = 'full'; // 'full' or 'thumbnails-only'

async function renderAll() {
  clearContainers();

  // Always render thumbnails
  for (let i = 0; i < pageOrder.length; i++) {
    const pageNumber = pageOrder[i];
    await renderThumbnail(pageNumber, i);
  }
  perfMetrics.thumbnailsComplete = performance.now();

  // Render full pages only if not in thumbnails-only mode
  if (renderMode === 'full') {
    for (let i = 0; i < pageOrder.length; i++) {
      const pageNumber = pageOrder[i];
      await renderPage(pageNumber, i);
    }
    perfMetrics.pagesComplete = performance.now();
  } else {
    // Show message in viewer
    viewer.innerHTML = '<div style="padding:20px;text-align:center;color:#666;">Thumbnail-only mode active. Click a thumbnail to view that page.</div>';
  }
}
```

### Step 4: Update UI for Thumbnail-Only Mode

**File:** `prototype/index.html`

Add toggle button:
```html
<button id="toggleRenderMode">Switch to Thumbnail-Only Mode</button>
```

**File:** `prototype/app.js`

```javascript
const toggleRenderModeBtn = document.getElementById('toggleRenderMode');

toggleRenderModeBtn.addEventListener('click', () => {
  renderMode = (renderMode === 'full') ? 'thumbnails-only' : 'full';
  toggleRenderModeBtn.textContent = (renderMode === 'full')
    ? 'Switch to Thumbnail-Only Mode'
    : 'Switch to Full Render Mode';
  renderAll();
});
```

### Step 5: Add Progressive Rendering (Future Enhancement)

**Concept:** Render pages lazily as they scroll into view

```javascript
// Use Intersection Observer to render pages on-demand
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.rendered) {
      const pageNumber = parseInt(entry.target.dataset.page);
      renderPageLazy(pageNumber, entry.target);
    }
  });
}, { rootMargin: '100px' });

// Observe placeholder divs instead of rendering all pages upfront
```

## Large File Detection Checklist

- [ ] File size detection added to file input handler
- [ ] Warning dialog implemented for 50-200 MB files
- [ ] Error blocking implemented for > 200 MB files
- [ ] Info banner for 10-50 MB files
- [ ] Thumbnail-only rendering mode implemented
- [ ] UI toggle for render mode added
- [ ] User-facing documentation updated
- [ ] Performance tested with 100 MB+ files
- [ ] Memory monitoring added to detect near-OOM conditions

## Testing Scenarios

1. **Small file (< 10 MB):** No warnings, renders normally
2. **Medium file (25 MB):** Info banner, renders normally
3. **Large file (100 MB):** Warning dialog, user can proceed or cancel
4. **Huge file (250 MB):** Error message, rendering blocked

Generate test file:
```powershell
python prototype/generate_test_pdf.py --pages 5000 --output test-huge.pdf
```

## References
- [MDN: File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

## Owner
**Engineering** — Target Completion: Phase 1, Week 2

## Status
**Planned** — Implementation design complete; awaiting sprint assignment.
