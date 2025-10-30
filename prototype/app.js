// Minimal prototype: load a local PDF, render pages, show draggable thumbnails,
// allow reorder and export a new PDF with pages in the chosen order.

(function () {
  const fileInput = document.getElementById('fileInput');
  const thumbnails = document.getElementById('thumbnails');
  const viewer = document.getElementById('viewer');
  const exportBtn = document.getElementById('exportBtn');

  // pdf.js setup (worker)
  if (window['pdfjsLib']) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist/build/pdf.worker.min.js';
  } else {
    alert('pdf.js failed to load');
    return;
  }

  let pdfDoc = null; // pdf.js document
  let originalPdfBytes = null; // ArrayBuffer of the loaded PDF
  let pageOrder = []; // array of 1-based page numbers in current order

  fileInput.addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;

    originalPdfBytes = await file.arrayBuffer();

    // load with pdf.js
    const loadingTask = pdfjsLib.getDocument({ data: originalPdfBytes });
    pdfDoc = await loadingTask.promise;

    pageOrder = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1);

    renderAll();
    exportBtn.disabled = false;
  });

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
    // After thumbnails are rendered, render viewer pages as larger canvases
    for (let i = 0; i < pageOrder.length; i++) {
      const pageNumber = pageOrder[i];
      await renderPage(pageNumber, i);
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
    container.dataset.index = idx;
    container.dataset.page = pageNumber;
    container.appendChild(canvas);
    container.title = `Page ${pageNumber}`;

    // Drag handlers
    container.addEventListener('dragstart', (e) => {
      container.classList.add('dragging');
      e.dataTransfer.setData('text/plain', idx.toString());
    });
    container.addEventListener('dragend', () => container.classList.remove('dragging'));

    // Allow dropping between thumbnails
    container.addEventListener('dragover', (e) => e.preventDefault());
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const toIdx = parseInt(container.dataset.index, 10);
      if (isNaN(fromIdx) || isNaN(toIdx)) return;
      moveInArray(pageOrder, fromIdx, toIdx);
      renderAll();
    });

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
    wrapper.appendChild(canvas);
    viewer.appendChild(wrapper);
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

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reordered.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Export failed: ' + (err && err.message));
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = 'Export reordered PDF';
    }
  });

})();
