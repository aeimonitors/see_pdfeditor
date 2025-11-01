/**
 * Multi-PDF UI Module
 * UI components for multi-PDF management with preview
 * @module multi-pdf-ui
 */

class MultiPDFUI {
  /**
   * Create a new multi-PDF UI
   * @param {MultiPDFManager} manager - Multi-PDF manager instance
   * @param {Object} containers - Container elements
   */
  constructor(manager, containers) {
    this.manager = manager;
    this.containers = containers;
    this.selectedPages = new Set();
    this.draggedPageIndex = null;

    this.init();
  }

  /**
   * Initialize UI
   */
  init() {
    this.renderDocumentList();
    this.renderPageGrid();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // File upload for multiple PDFs
    const multiFileInput = document.getElementById('multiFileInput');
    if (multiFileInput) {
      multiFileInput.addEventListener('change', (e) => this.handleFilesAdded(e));
    }

    // Drag and drop for multiple files
    const dropZone = document.getElementById('multiDropZone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(
          (f) => f.type === 'application/pdf',
        );
        this.addFiles(files);
      });

      dropZone.addEventListener('click', () => {
        multiFileInput?.click();
      });
    }
  }

  /**
   * Handle files added via input
   * @param {Event} event - Change event
   */
  async handleFilesAdded(event) {
    const files = Array.from(event.target.files);
    await this.addFiles(files);
    event.target.value = ''; // Reset input
  }

  /**
   * Add multiple PDF files
   * @param {Array<File>} files - PDF files to add
   */
  async addFiles(files) {
    const statusEl = document.getElementById('multiPdfStatus');

    for (const file of files) {
      try {
        if (statusEl) {
          statusEl.textContent = `Loading ${file.name}...`;
        }

        const arrayBuffer = await file.arrayBuffer();
        await this.manager.addDocument(arrayBuffer, file.name);
      } catch (error) {
        console.error(`Failed to load ${file.name}:`, error);
        alert(`Failed to load ${file.name}: ${error.message}`);
      }
    }

    if (statusEl) {
      const docCount = this.manager.getDocuments().length;
      const pageCount = this.manager.getTotalPageCount();
      statusEl.textContent = `Loaded ${docCount} document(s), ${pageCount} total pages`;
    }

    this.renderDocumentList();
    this.renderPageGrid();
  }

  /**
   * Render document list
   */
  renderDocumentList() {
    const container = this.containers.documentList;
    if (!container) return;

    container.innerHTML = '';
    const docs = this.manager.getDocuments();

    if (docs.length === 0) {
      container.innerHTML = '<p class="empty-state">No documents loaded</p>';
      return;
    }

    docs.forEach((doc) => {
      const docEl = document.createElement('div');
      docEl.className = 'document-item';
      docEl.innerHTML = `
        <div class="document-info">
          <div class="document-name" title="${doc.name}">${doc.name}</div>
          <div class="document-pages">${doc.pageCount} pages</div>
        </div>
        <button class="document-remove-btn" data-doc-id="${doc.id}"
                aria-label="Remove ${doc.name}">×</button>
      `;

      const removeBtn = docEl.querySelector('.document-remove-btn');
      removeBtn.addEventListener('click', () => {
        if (confirm(`Remove "${doc.name}" from the collection?`)) {
          this.manager.removeDocument(doc.id);
          this.renderDocumentList();
          this.renderPageGrid();
        }
      });

      container.appendChild(docEl);
    });
  }

  /**
   * Render page grid with previews
   */
  async renderPageGrid() {
    const container = this.containers.pageGrid;
    if (!container) return;

    container.innerHTML = '<div class="loading-pages">Loading previews...</div>';

    const pages = this.manager.getGlobalPageOrder();

    if (pages.length === 0) {
      container.innerHTML = '<p class="empty-state">No pages to display. Add PDF files above.</p>';
      return;
    }

    container.innerHTML = '';

    for (let i = 0; i < pages.length; i++) {
      const pageDesc = pages[i];
      const pageEl = await this.createPagePreview(pageDesc, i);
      container.appendChild(pageEl);
    }
  }

  /**
   * Create a page preview element
   * @param {Object} pageDesc - Page descriptor
   * @param {number} globalIndex - Global page index
   * @returns {Promise<HTMLElement>} Page element
   */
  async createPagePreview(pageDesc, globalIndex) {
    const pageEl = document.createElement('div');
    pageEl.className = 'page-preview';
    pageEl.dataset.globalIndex = globalIndex;
    pageEl.draggable = true;

    // Render thumbnail
    try {
      const page = await pageDesc.pdfDoc.getPage(pageDesc.pageNum);
      const scale = 0.3;
      let viewport = page.getViewport({ scale });

      // Apply rotation to viewport
      if (pageDesc.rotation !== 0) {
        viewport = page.getViewport({ scale, rotation: pageDesc.rotation });
      }

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.className = 'page-preview-canvas';

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      pageEl.innerHTML = `
        <div class="page-preview-header">
          <span class="page-number">${globalIndex + 1}</span>
          <span class="page-doc-name">${pageDesc.docName}</span>
        </div>
        <div class="page-preview-canvas-wrapper"></div>
        <div class="page-preview-actions">
          <button class="page-action-btn rotate-btn" title="Rotate 90° clockwise">↻</button>
          <button class="page-action-btn delete-btn" title="Delete page">×</button>
        </div>
      `;

      pageEl.querySelector('.page-preview-canvas-wrapper').appendChild(canvas);

      // Action buttons
      const rotateBtn = pageEl.querySelector('.rotate-btn');
      rotateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.manager.rotatePage(pageDesc.docId, pageDesc.pageIndex, 90);
        this.renderPageGrid();
      });

      const deleteBtn = pageEl.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.manager.deletePage(pageDesc.docId, pageDesc.pageIndex);
        this.renderPageGrid();
        this.updateStatus();
      });

      // Drag and drop (mouse)
      pageEl.addEventListener('dragstart', (e) => {
        this.draggedPageIndex = globalIndex;
        pageEl.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      pageEl.addEventListener('dragend', () => {
        pageEl.classList.remove('dragging');
        this.draggedPageIndex = null;
      });

      pageEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (this.draggedPageIndex === null) return;

        const targetIndex = parseInt(pageEl.dataset.globalIndex, 10);
        if (targetIndex !== this.draggedPageIndex) {
          pageEl.classList.add('drag-over');
        }
      });

      pageEl.addEventListener('dragleave', () => {
        pageEl.classList.remove('drag-over');
      });

      pageEl.addEventListener('drop', (e) => {
        e.preventDefault();
        pageEl.classList.remove('drag-over');

        if (this.draggedPageIndex === null) return;

        const targetIndex = parseInt(pageEl.dataset.globalIndex, 10);
        if (targetIndex !== this.draggedPageIndex) {
          this.manager.reorderPages(this.draggedPageIndex, targetIndex);
          this.renderPageGrid();
        }
      });

      // Touch drag and drop for mobile
      let touchStartX = 0;
      let touchStartY = 0;
      let touchMoved = false;
      let dragClone = null;

      pageEl.addEventListener('touchstart', (e) => {
        // Don't interfere with button touches
        if (e.target.closest('.page-action-btn')) return;

        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchMoved = false;

        // Set dragged index
        this.draggedPageIndex = globalIndex;

        // Add long press detection
        this.longPressTimer = setTimeout(() => {
          if (!touchMoved) {
            // Start drag after long press
            pageEl.classList.add('dragging');

            // Create visual clone for dragging
            dragClone = pageEl.cloneNode(true);
            dragClone.classList.add('drag-clone');
            dragClone.style.position = 'fixed';
            dragClone.style.pointerEvents = 'none';
            dragClone.style.zIndex = '1000';
            dragClone.style.opacity = '0.8';
            dragClone.style.transform = 'scale(1.05)';
            dragClone.style.width = pageEl.offsetWidth + 'px';
            dragClone.style.height = pageEl.offsetHeight + 'px';
            dragClone.style.left = (touch.clientX - pageEl.offsetWidth / 2) + 'px';
            dragClone.style.top = (touch.clientY - pageEl.offsetHeight / 2) + 'px';
            document.body.appendChild(dragClone);

            // Haptic feedback if available
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
          }
        }, 500); // 500ms long press
      }, { passive: true });

      pageEl.addEventListener('touchmove', (e) => {
        if (this.draggedPageIndex !== globalIndex) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);

        // Detect if moved significantly
        if (deltaX > 10 || deltaY > 10) {
          touchMoved = true;
          clearTimeout(this.longPressTimer);
        }

        // Update drag clone position
        if (dragClone) {
          e.preventDefault(); // Prevent scrolling while dragging
          dragClone.style.left = (touch.clientX - pageEl.offsetWidth / 2) + 'px';
          dragClone.style.top = (touch.clientY - pageEl.offsetHeight / 2) + 'px';

          // Find element under touch
          const elementsBelow = document.elementsFromPoint(touch.clientX, touch.clientY);
          const pageBelow = elementsBelow.find(el => el.classList.contains('page-preview') && el !== pageEl);

          // Remove drag-over from all pages
          document.querySelectorAll('.page-preview').forEach(p => p.classList.remove('drag-over'));

          // Add drag-over to target
          if (pageBelow && pageBelow !== pageEl) {
            pageBelow.classList.add('drag-over');
          }
        }
      }, { passive: false });

      pageEl.addEventListener('touchend', (e) => {
        clearTimeout(this.longPressTimer);

        if (dragClone) {
          const touch = e.changedTouches[0];

          // Find drop target
          const elementsBelow = document.elementsFromPoint(touch.clientX, touch.clientY);
          const targetPage = elementsBelow.find(el => el.classList.contains('page-preview') && el !== pageEl);

          if (targetPage) {
            const targetIndex = parseInt(targetPage.dataset.globalIndex, 10);
            if (targetIndex !== this.draggedPageIndex) {
              this.manager.reorderPages(this.draggedPageIndex, targetIndex);
              this.renderPageGrid();

              // Haptic feedback on drop
              if (navigator.vibrate) {
                navigator.vibrate(30);
              }
            }
          }

          // Cleanup
          dragClone.remove();
          dragClone = null;
        }

        // Reset state
        pageEl.classList.remove('dragging');
        document.querySelectorAll('.page-preview').forEach(p => p.classList.remove('drag-over'));
        this.draggedPageIndex = null;
      });

      pageEl.addEventListener('touchcancel', () => {
        clearTimeout(this.longPressTimer);

        if (dragClone) {
          dragClone.remove();
          dragClone = null;
        }

        pageEl.classList.remove('dragging');
        document.querySelectorAll('.page-preview').forEach(p => p.classList.remove('drag-over'));
        this.draggedPageIndex = null;
      });

      // Click to select
      pageEl.addEventListener('click', () => {
        pageEl.classList.toggle('selected');
        if (pageEl.classList.contains('selected')) {
          this.selectedPages.add(globalIndex);
        } else {
          this.selectedPages.delete(globalIndex);
        }
      });
    } catch (error) {
      console.error('Failed to render page preview:', error);
      pageEl.innerHTML = `
        <div class="page-preview-error">
          <span>⚠️</span>
          <span>Failed to load preview</span>
        </div>
      `;
    }

    return pageEl;
  }

  /**
   * Update status message
   */
  updateStatus() {
    const statusEl = document.getElementById('multiPdfStatus');
    if (statusEl) {
      const docCount = this.manager.getDocuments().length;
      const pageCount = this.manager.getTotalPageCount();
      statusEl.textContent = `${docCount} document(s), ${pageCount} total pages`;
    }
  }

  /**
   * Generate formatted filename with timestamp
   * @returns {string} Formatted filename
   */
  generateFilename() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `editedpdf_${yyyy}-${MM}-${dd}_${HH}-${mm}-${ss}.pdf`;
  }

  /**
   * Export merged PDF with save dialog
   */
  async exportMergedPDF() {
    try {
      const exportBtn = document.getElementById('exportMergedBtn');
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.textContent = 'Merging...';
      }

      const pdfBytes = await this.manager.mergeToPDF();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const filename = this.generateFilename();

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

          if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.textContent = '💾 Export Merged PDF';
          }
        } catch (error) {
          // User cancelled save dialog
          if (error.name === 'AbortError') {
            if (exportBtn) {
              exportBtn.disabled = false;
              exportBtn.textContent = '💾 Export Merged PDF';
            }
            return;
          }
          throw error;
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

        if (exportBtn) {
          exportBtn.disabled = false;
          exportBtn.textContent = '💾 Export Merged PDF';
        }
      }
    } catch (error) {
      console.error('Failed to export merged PDF:', error);

      const exportBtn = document.getElementById('exportMergedBtn');
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = '💾 Export Merged PDF';
      }

      throw error; // Re-throw to be caught by caller
    }
  }

  /**
   * Clear all documents
   */
  clearAll() {
    this.manager.clear();
    this.selectedPages.clear();
    this.renderDocumentList();
    this.renderPageGrid();
    this.updateStatus();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiPDFUI;
}
