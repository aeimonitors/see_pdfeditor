// Minimal prototype: load a local PDF, render pages, show draggable thumbnails,
// allow reorder and export a new PDF with pages in the chosen order.

(function () {
  const fileInput = document.getElementById('fileInput');
  const thumbnails = document.getElementById('thumbnails');
  const viewer = document.getElementById('viewer');
  const exportBtn = document.getElementById('exportBtn');
  const addCommentBtn = document.getElementById('addCommentBtn');
  const generatePdfBtn = document.getElementById('generatePdfBtn');

  // Placeholder used during thumbnail dragging to show insertion point
  const thumbPlaceholder = document.createElement('div');
  thumbPlaceholder.className = 'thumb-placeholder';

  // ARIA live region for reorder announcements (screen readers)
  let reorderAnnounce = document.getElementById('reorder-announce');
  if (!reorderAnnounce) {
    reorderAnnounce = document.createElement('div');
    reorderAnnounce.id = 'reorder-announce';
    reorderAnnounce.setAttribute('aria-live', 'polite');
    reorderAnnounce.setAttribute('role', 'status');
    reorderAnnounce.className = 'sr-only';
    document.body.appendChild(reorderAnnounce);
  }
  let lastAnnouncedPos = null;

  // pdf.js setup (worker)
  if (window.pdfjsLib) {
    // Configure workerSrc from loader if available, otherwise fall back to known CDN
    const workerSrc = (window.PDF_ASSETS && window.PDF_ASSETS.pdfWorker) || 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  } else {
    alert('pdf.js failed to load');
    return;
  }

  let pdfDoc = null; // pdf.js document
  let originalPdfBytes = null; // ArrayBuffer of the loaded PDF
  let pageOrder = []; // array of 1-based page numbers in current order
  let annotations = []; // { pageNumber, xPct, yPct, text }
  let addCommentMode = false;

  // Performance tracking
  const perfMetrics = {
    fileLoadStart: 0,
    fileLoadEnd: 0,
    renderStart: 0,
    renderEnd: 0,
    thumbnailsComplete: 0,
    pagesComplete: 0,
  };

  fileInput.addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;

    // Large file detection and warning
    const fileSizeMB = file.size / (1024 * 1024);

    // Block files > 200 MB
    if (fileSizeMB > 200) {
      alert(`PDF Too Large\n\nThis PDF (${fileSizeMB.toFixed(1)} MB) exceeds the maximum supported size (200 MB).\n\nRecommendations:\n• Use a PDF splitting tool to reduce file size\n• Process the PDF in smaller chunks\n• Consider using a desktop PDF editor for large files`);
      fileInput.value = ''; // Clear the input
      return;
    }

    // Warn for files 50-200 MB
    if (fileSizeMB >= 50) {
      const proceed = confirm(`Large PDF Detected\n\nThis PDF is ${fileSizeMB.toFixed(1)} MB. Rendering may take significant time and memory.\n\nDo you want to proceed?`);
      if (!proceed) {
        fileInput.value = ''; // Clear the input
        return;
      }
    }

    // Info banner for files 10-50 MB
    if (fileSizeMB >= 10) {
      showInfoBanner(`Large file detected (${fileSizeMB.toFixed(1)} MB). Rendering may take a moment...`);
    }

    perfMetrics.fileLoadStart = performance.now();
    originalPdfBytes = await file.arrayBuffer();

    // load with pdf.js
    const loadingTask = pdfjsLib.getDocument({ data: originalPdfBytes });
    pdfDoc = await loadingTask.promise;
    perfMetrics.fileLoadEnd = performance.now();

    pageOrder = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1);

    perfMetrics.renderStart = performance.now();
    await renderAll();
    perfMetrics.renderEnd = performance.now();

    logPerformanceMetrics(file.size);
    exportBtn.disabled = false;
  });

  // Generate a small sample PDF (3 pages) using PDFLib and load it into the prototype
  generatePdfBtn.addEventListener('click', async () => {
    generatePdfBtn.disabled = true;
    generatePdfBtn.textContent = 'Generating sample...';
    try {
      perfMetrics.fileLoadStart = performance.now();
      const doc = await PDFLib.PDFDocument.create();
      for (let i = 1; i <= 3; i++) {
        const page = doc.addPage([600, 800]);
        page.drawText(`Sample page ${i}`, { x: 50, y: 750, size: 24 });
      }
      const bytes = await doc.save();
      perfMetrics.fileLoadEnd = performance.now();

      // Ensure we pass a typed array to pdf.js (Uint8Array)
      originalPdfBytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      const loadingTask = pdfjsLib.getDocument({ data: originalPdfBytes });
      pdfDoc = await loadingTask.promise;
      pageOrder = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1);
      annotations = [];

      perfMetrics.renderStart = performance.now();
      await renderAll();
      perfMetrics.renderEnd = performance.now();

      logPerformanceMetrics(bytes.length);
      exportBtn.disabled = false;
    } catch (err) {
      console.error(err);
      alert(`Failed to generate sample PDF: ${err && err.message}`);
    } finally {
      generatePdfBtn.disabled = false;
      generatePdfBtn.textContent = 'Generate sample PDF';
    }
  });

  function showInfoBanner(message) {
    const statusEl = document.getElementById('vendor-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.background = '#fffef0';
      statusEl.style.borderColor = '#ffe066';
      statusEl.style.color = '#856404';
    }
  }

  function clearContainers() {
    thumbnails.innerHTML = '';
    viewer.innerHTML = '';
  }

  async function renderAll() {
    clearContainers();
    // Render thumbnails and viewer pages in the order of pageOrder
    for (let i = 0; i < pageOrder.length; i++) {
      const pageNumber = pageOrder[i];
      await renderThumbnail(pageNumber, i);
    }
    perfMetrics.thumbnailsComplete = performance.now();

    // After thumbnails are rendered, render viewer pages as larger canvases
    for (let i = 0; i < pageOrder.length; i++) {
      const pageNumber = pageOrder[i];
      await renderPage(pageNumber, i);
    }
    perfMetrics.pagesComplete = performance.now();
  }

  // Insertion indicator helpers: compute insertion point and manage placeholder
  function getDragAfterElement(container, x, y) {
    const style = window.getComputedStyle(container);
    const isHorizontal = style.flexDirection && style.flexDirection.startsWith('row');
    const draggableElements = [...container.querySelectorAll('.thumb')].filter((el) => !el.classList.contains('dragging') && !el.classList.contains('thumb-placeholder'));

    let closest = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    for (const child of draggableElements) {
      const rect = child.getBoundingClientRect();
      const offset = isHorizontal ? (x - (rect.left + rect.width / 2)) : (y - (rect.top + rect.height / 2));
      if (offset < 0 && offset > closestOffset) {
        closestOffset = offset;
        closest = child;
      }
    }

    return closest;
  }

  // Thumbnails container-level handlers to show placeholder and accept drops
  if (thumbnails) {
    thumbnails.addEventListener('dragover', (e) => {
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      const afterElement = getDragAfterElement(thumbnails, x, y);
      if (!afterElement) {
        if (thumbnails.lastElementChild !== thumbPlaceholder) thumbnails.appendChild(thumbPlaceholder);
      } else {
        if (afterElement !== thumbPlaceholder) thumbnails.insertBefore(thumbPlaceholder, afterElement);
      }

      // Announce insertion position for screen readers (avoid spamming)
      const toIdx = Array.from(thumbnails.children).indexOf(thumbPlaceholder);
      if (toIdx !== -1 && toIdx !== lastAnnouncedPos) {
        reorderAnnounce.textContent = `Insertion point: position ${toIdx + 1}`;
        lastAnnouncedPos = toIdx;
      }
    });

    thumbnails.addEventListener('dragleave', (e) => {
      const rect = thumbnails.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        if (thumbPlaceholder.parentElement) thumbPlaceholder.remove();
        // Clear announcement
        reorderAnnounce.textContent = '';
        lastAnnouncedPos = null;
      }
    });

    thumbnails.addEventListener('drop', async (e) => {
      e.preventDefault();
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      let toIdx = -1;
      if (thumbPlaceholder.parentElement) {
        toIdx = Array.from(thumbnails.children).indexOf(thumbPlaceholder);
      } else {
        toIdx = thumbnails.children.length - 1;
      }
      if (thumbPlaceholder.parentElement) thumbPlaceholder.remove();
      if (isNaN(fromIdx) || toIdx === -1) return;
      const clampedFrom = Math.max(0, Math.min(fromIdx, pageOrder.length - 1));
      const clampedTo = Math.max(0, Math.min(toIdx, pageOrder.length));
      if (clampedFrom === clampedTo) return;
      // Remember which page is moving so we can restore scroll/focus
      const movedPageNumber = pageOrder[clampedFrom];
      moveInArray(pageOrder, clampedFrom, clampedTo);
      await renderAll();
      // After re-render, scroll the moved page into view in both panes and focus the thumbnail
      const newThumb = thumbnails.querySelector(`.thumb[data-page="${movedPageNumber}"]`);
      if (newThumb) {
        try {
          newThumb.scrollIntoView({ block: 'center', behavior: 'instant' });
        } catch (_) {
          newThumb.scrollIntoView({ block: 'center' });
        }
        if (typeof newThumb.focus === 'function') {
          try {
            newThumb.focus({ preventScroll: true });
          } catch (_) {
            newThumb.focus();
          }
        }
      }
      const viewerPage = viewer.querySelector(`[data-page="${movedPageNumber}"]`);
      if (viewerPage) {
        try {
          viewerPage.scrollIntoView({ block: 'center', behavior: 'instant' });
        } catch (_) {
          viewerPage.scrollIntoView({ block: 'center' });
        }
      }
      const draggingEl = thumbnails.querySelector('.dragging');
      if (draggingEl) draggingEl.classList.remove('dragging');

      // Announce completion briefly
      reorderAnnounce.textContent = `Moved to position ${clampedTo + 1}`;
      lastAnnouncedPos = clampedTo;
      setTimeout(() => {
        // Clear after short delay so screen readers can read it
        reorderAnnounce.textContent = '';
        lastAnnouncedPos = null;
      }, 1500);
    });
  }

  function logPerformanceMetrics(fileSize) {
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    const loadTime = (perfMetrics.fileLoadEnd - perfMetrics.fileLoadStart).toFixed(0);
    const thumbnailTime = (perfMetrics.thumbnailsComplete - perfMetrics.renderStart).toFixed(0);
    const pageRenderTime = (perfMetrics.pagesComplete - perfMetrics.thumbnailsComplete).toFixed(0);
    const totalRenderTime = (perfMetrics.renderEnd - perfMetrics.renderStart).toFixed(0);

    const memUsage = performance.memory ? (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) : 'N/A';

    console.group('📊 Performance Metrics');
    console.log(`File size: ${fileSizeMB} MB`);
    console.log(`Pages: ${pdfDoc.numPages}`);
    console.log(`Load time: ${loadTime} ms`);
    console.log(`Thumbnail render: ${thumbnailTime} ms`);
    console.log(`Page render: ${pageRenderTime} ms`);
    console.log(`Total render: ${totalRenderTime} ms`);
    console.log(`JS Heap used: ${memUsage} MB`);
    console.groupEnd();

    // Update status banner with performance summary
    const statusEl = document.getElementById('vendor-status');
    if (statusEl) {
      statusEl.innerHTML = `<strong>Performance:</strong> ${pdfDoc.numPages} pages (${fileSizeMB} MB) | Load: ${loadTime}ms | Render: ${totalRenderTime}ms | Memory: ${memUsage} MB`;
      statusEl.style.background = '#fffef0';
      statusEl.style.borderColor = '#ffe066';
    }
  }

  async function renderThumbnail(pageNumber, idx) {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 0.25 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;

  const container = document.createElement('div');
    container.className = 'thumb';
    container.draggable = true;
  container.tabIndex = 0; // focusable for accessibility and refocus after reorder
    container.dataset.index = idx;
    container.dataset.page = pageNumber;
    container.appendChild(canvas);
    container.title = `Page ${pageNumber}`;

    // Drag handlers
    container.addEventListener('dragstart', (e) => {
      container.classList.add('dragging');
      e.dataTransfer.setData('text/plain', idx.toString());
      e.dataTransfer.effectAllowed = 'move';
    });
    container.addEventListener('dragend', () => {
      container.classList.remove('dragging');
      if (thumbPlaceholder.parentElement) thumbPlaceholder.remove();
    });

    // Keep per-item dragover to allow pointer capture; main insertion logic handled at thumbnails container
    container.addEventListener('dragover', (e) => e.preventDefault());

    thumbnails.appendChild(container);
  }

  async function renderPage(pageNumber, idx) {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.2 });
    const canvas = document.createElement('canvas');
    canvas.className = 'page-canvas';
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.dataset.page = pageNumber;
    wrapper.appendChild(canvas);

    // overlay for annotations (absolute positioned over canvas)
    const overlay = document.createElement('div');
    overlay.className = 'annotation-overlay';
    overlay.style.width = `${canvas.width}px`;
    overlay.style.height = `${canvas.height}px`;
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    wrapper.appendChild(overlay);

    // click to place comment when in addCommentMode
    wrapper.addEventListener('click', (e) => {
      if (!addCommentMode) return;
      // compute coordinates relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = x / rect.width;
      const yPct = y / rect.height;
      const text = window.prompt('Comment text:');
      if (!text) return;
      const ann = {
        pageNumber, xPct, yPct, text,
      };
      annotations.push(ann);
      renderAnnotationsForOverlay(overlay, pageNumber, canvas);
    });

    // render existing annotations for this page
    renderAnnotationsForOverlay(overlay, pageNumber, canvas);

    viewer.appendChild(wrapper);
  }

  function renderAnnotationsForOverlay(overlay, pageNumber, canvas) {
    overlay.innerHTML = '';
    const pageAnns = annotations.filter((a) => a.pageNumber === pageNumber);
    for (const a of pageAnns) {
      const pin = document.createElement('div');
      pin.className = 'annotation-pin';
      pin.style.left = `${a.xPct * canvas.width}px`;
      pin.style.top = `${a.yPct * canvas.height}px`;
      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = a.text;
      pin.appendChild(label);
      overlay.appendChild(pin);
    }
  }

  function moveInArray(arr, from, to) {
    const val = arr.splice(from, 1)[0];
    arr.splice(to, 0, val);
  }

  exportBtn.addEventListener('click', async () => {
    if (!originalPdfBytes) return;
    exportBtn.disabled = true;
    exportBtn.textContent = 'Exporting...';
    try {
      const src = await PDFLib.PDFDocument.load(originalPdfBytes);
      const newDoc = await PDFLib.PDFDocument.create();

      // copy pages in the order of pageOrder (1-based page numbers -> zero-based indices)
      for (let i = 0; i < pageOrder.length; i++) {
        const pageIndex = pageOrder[i] - 1;
        const [copied] = await newDoc.copyPages(src, [pageIndex]);
        newDoc.addPage(copied);
      }

      // Flatten annotations onto pages (draw simple pin + text)
      for (const ann of annotations) {
        // find where this original page now lives in newDoc
        const newIdx = pageOrder.indexOf(ann.pageNumber);
        if (newIdx === -1) continue;
        const page = newDoc.getPage(newIdx);
        const { width, height } = page.getSize ? { width: page.getWidth(), height: page.getHeight() } : { width: 600, height: 800 };
        const x = ann.xPct * width;
        const y = height - (ann.yPct * height); // convert from top-left canvas coords to PDF bottom-left
        // draw a small circle
        page.drawEllipse({
          x, y, xScale: 6, yScale: 6, color: PDFLib.rgb(1, 0.35, 0.37), borderColor: PDFLib.rgb(1, 1, 1), borderWidth: 1,
        });
        // draw the text label to the right
        page.drawText(ann.text, {
          x: x + 10, y: y - 6, size: 10, color: PDFLib.rgb(0, 0, 0),
        });
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Generate filename with timestamp
      const now = new Date();
      const yyyy = now.getFullYear();
      const MM = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const HH = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const filename = `editedpdf_${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}.pdf`;

      // Check if File System Access API is available
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'PDF Files',
              accept: { 'application/pdf': ['.pdf'] },
            }],
          });

          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();

          alert('PDF exported successfully!');
        } catch (saveError) {
          // User cancelled save dialog
          if (saveError.name === 'AbortError') {
            return;
          }
          throw saveError;
        }
      } else {
        // Fallback to traditional download method
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        alert('PDF exported successfully!');
      }
    } catch (err) {
      console.error(err);
      alert(`Export failed: ${err && err.message}`);
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = 'Export reordered PDF';
    }
  });

  // Toggle add comment mode
  addCommentBtn.addEventListener('click', () => {
    addCommentMode = !addCommentMode;
    addCommentBtn.textContent = addCommentMode ? 'Click a page to add comment (click again to cancel)' : 'Add Comment Pin';
    if (!addCommentMode) addCommentBtn.blur();
  });
}());
