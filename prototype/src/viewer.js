/**
 * PDF Viewer Module
 * Handles PDF loading, rendering, and page management
 * @module viewer
 */

/**
 * PDF Viewer class for managing document rendering
 */
class PDFViewer {
  /**
   * Create a new PDF viewer instance
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.thumbnailContainer - Container for thumbnail grid
   * @param {HTMLElement} options.viewerContainer - Container for full-size pages
   * @param {Function} options.onPageClick - Callback when page is clicked
   * @param {Function} options.onPageDuplicate - Callback when page is duplicated
   * @param {Function} options.onPageDelete - Callback when page delete is requested
   * @param {Function} options.onPageDuplicateRequest - Callback when duplicate is requested
   */
  constructor({
    thumbnailContainer,
    viewerContainer,
    onPageClick = null,
    onPageDuplicate = null,
    onPageDelete = null,
    onPageDuplicateRequest = null,
  }) {
    this.thumbnailContainer = thumbnailContainer;
    this.viewerContainer = viewerContainer;
    this.onPageClick = onPageClick;
    this.onPageDuplicate = onPageDuplicate;
    this.onPageDelete = onPageDelete;
    this.onPageDuplicateRequest = onPageDuplicateRequest;

    this.pdfDoc = null;
    this.originalPdfBytes = null;
    this.pageOrder = [];

    // Initialize pdf.js worker
    this._initPdfJs();
  }

  /**
   * Initialize pdf.js library and worker
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  _initPdfJs() {
    if (window.pdfjsLib) {
      const workerSrc = (window.PDF_ASSETS && window.PDF_ASSETS.pdfWorker)
        || 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js';
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    } else {
      throw new Error('pdf.js failed to load');
    }
  } /**
   * Load a PDF from an ArrayBuffer
   * @param {ArrayBuffer} arrayBuffer - PDF file data
   * @returns {Promise<number>} Number of pages loaded
   * @throws {Error} If PDF loading fails
   */

  async loadPDF(arrayBuffer) {
    try {
      this.originalPdfBytes = arrayBuffer;
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      this.pdfDoc = await loadingTask.promise;
      this.pageOrder = Array.from({ length: this.pdfDoc.numPages }, (_, i) => i + 1);
      return this.pdfDoc.numPages;
    } catch (error) {
      console.error('Failed to load PDF:', error);
      throw new Error(`PDF loading failed: ${error.message}`);
    }
  }

  /**
   * Get the original PDF bytes
   * @returns {ArrayBuffer|null} Original PDF data
   */
  getOriginalBytes() {
    return this.originalPdfBytes;
  }

  /**
   * Get the current page order
   * @returns {Array<number>} Array of 1-based page numbers
   */
  getPageOrder() {
    return [...this.pageOrder];
  }

  /**
   * Get the number of pages
   * @returns {number} Page count
   */
  getPageCount() {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  }

  /**
   * Clear all rendered content
   */
  clear() {
    this.thumbnailContainer.innerHTML = '';
    this.viewerContainer.innerHTML = '';
  }

  /**
   * Render all pages (thumbnails and full-size)
   * @param {Object} annotationOverlayCallback - Callback to render annotations on each page
   * @returns {Promise<void>}
   */
  async renderAll(annotationOverlayCallback = null) {
    this.clear();

    // Render thumbnails
    for (let i = 0; i < this.pageOrder.length; i++) {
      const pageNumber = this.pageOrder[i];
      await this._renderThumbnail(pageNumber, i);
    }

    // Render full-size pages
    for (let i = 0; i < this.pageOrder.length; i++) {
      const pageNumber = this.pageOrder[i];
      await this._renderPage(pageNumber, i, annotationOverlayCallback);
    }
  }

  /**
   * Render a single thumbnail
   * @private
   * @param {number} pageNumber - 1-based page number
   * @param {number} idx - Index in current page order
   * @returns {Promise<void>}
   */
  async _renderThumbnail(pageNumber, idx) {
    try {
      const page = await this.pdfDoc.getPage(pageNumber);
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

      // Add action buttons
      this._addThumbnailActions(container, pageNumber);

      // Setup drag and drop
      this._setupDragDrop(container, idx);

      this.thumbnailContainer.appendChild(container);
    } catch (error) {
      console.error(`Failed to render thumbnail for page ${pageNumber}:`, error);
      throw error;
    }
  }

  /**
   * Render a full-size page
   * @private
   * @param {number} pageNumber - 1-based page number
   * @param {number} idx - Index in current page order
   * @param {Function} annotationOverlayCallback - Callback to render annotations
   * @returns {Promise<HTMLElement>} The page wrapper element
   */
  async _renderPage(pageNumber, idx, annotationOverlayCallback = null) {
    try {
      const page = await this.pdfDoc.getPage(pageNumber);
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

      // Create annotation overlay
      const overlay = document.createElement('div');
      overlay.className = 'annotation-overlay';
      overlay.style.width = `${canvas.width}px`;
      overlay.style.height = `${canvas.height}px`;
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      wrapper.appendChild(overlay);

      // Setup click handler for annotations
      if (this.onPageClick) {
        wrapper.addEventListener('click', (e) => {
          this.onPageClick(e, pageNumber, canvas, overlay);
        });
      }

      // Render annotations if callback provided
      if (annotationOverlayCallback) {
        annotationOverlayCallback(overlay, pageNumber, canvas);
      }

      this.viewerContainer.appendChild(wrapper);
      return wrapper;
    } catch (error) {
      console.error(`Failed to render page ${pageNumber}:`, error);
      throw error;
    }
  }

  /**
   * Setup drag and drop handlers for thumbnail reordering
   * @private
   * @param {HTMLElement} container - Thumbnail container element
   * @param {number} idx - Current index
   */
  _setupDragDrop(container, idx) {
    container.addEventListener('dragstart', (e) => {
      container.classList.add('dragging');
      e.dataTransfer.setData('text/plain', idx.toString());
    });

    container.addEventListener('dragend', () => {
      container.classList.remove('dragging');
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const toIdx = parseInt(container.dataset.index, 10);

      if (isNaN(fromIdx) || isNaN(toIdx)) return;

      this._moveInArray(this.pageOrder, fromIdx, toIdx);
      this.renderAll();
    });
  }

  /**
   * Add action buttons (delete, duplicate) to thumbnail
   * @private
   * @param {HTMLElement} container - Thumbnail container
   * @param {number} pageNumber - Page number
   */
  _addThumbnailActions(container, pageNumber) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'thumb-actions';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'thumb-btn delete-btn';
    deleteBtn.innerHTML = '<span aria-hidden="true">×</span>';
    deleteBtn.setAttribute('aria-label', `Delete page ${pageNumber}`);
    deleteBtn.title = 'Delete page';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Use callback if provided (for command pattern), otherwise call directly
      if (this.onPageDelete) {
        this.onPageDelete(pageNumber);
      } else {
        this.deletePage(pageNumber);
      }
    });

    // Duplicate button
    const duplicateBtn = document.createElement('button');
    duplicateBtn.className = 'thumb-btn duplicate-btn';
    duplicateBtn.innerHTML = '<span aria-hidden="true">+</span>';
    duplicateBtn.setAttribute('aria-label', `Duplicate page ${pageNumber}`);
    duplicateBtn.title = 'Duplicate page';
    duplicateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Use callback if provided (for command pattern), otherwise call directly
      if (this.onPageDuplicateRequest) {
        this.onPageDuplicateRequest(pageNumber);
      } else {
        this.duplicatePage(pageNumber);
      }
    });

    actionsDiv.appendChild(duplicateBtn);
    actionsDiv.appendChild(deleteBtn);
    container.appendChild(actionsDiv);

    // Enhance container for keyboard accessibility
    const totalPages = this.pageOrder.length;
    const index = this.pageOrder.indexOf(pageNumber);
    container.setAttribute('tabindex', '0');
    container.setAttribute(
      'aria-label',
      `Page ${pageNumber}, position ${index + 1} of ${totalPages}. Press Control plus Arrow Up or Down to reorder, Delete to remove, or D to duplicate.`,
    );

    // Add keyboard handlers
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        deleteBtn.click();
      } else if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        duplicateBtn.click();
      }
    });
  }

  /**
   * Delete a page from the PDF
   * @param {number} pageNumber - Page number to delete
   * @param {boolean} skipConfirmation - Skip confirmation dialog
   * @returns {boolean} True if deleted successfully
   */
  deletePage(pageNumber, skipConfirmation = false) {
    // Prevent deletion of last remaining page
    if (this.pageOrder.length <= 1) {
      alert('Cannot delete the last remaining page');
      return false;
    }

    // Confirm deletion (unless skipped for undo/redo)
    if (!skipConfirmation) {
      const confirmed = confirm(`Delete page ${pageNumber}?`);
      if (!confirmed) return false;
    }

    // Remove from page order
    const index = this.pageOrder.indexOf(pageNumber);
    if (index !== -1) {
      this.pageOrder.splice(index, 1);
      this.renderAll();
      return true;
    }

    return false;
  }

  /**
   * Duplicate a page in the PDF
   * @param {number} pageNumber - Page number to duplicate
   * @returns {boolean} True if duplicated successfully
   */
  duplicatePage(pageNumber) {
    // Find index and insert duplicate after original
    const index = this.pageOrder.indexOf(pageNumber);
    if (index !== -1) {
      this.pageOrder.splice(index + 1, 0, pageNumber);

      // Notify callback if provided
      if (this.onPageDuplicate) {
        this.onPageDuplicate(pageNumber, index + 1);
      }

      this.renderAll();
      return true;
    }

    return false;
  }

  /**
   * Move an element in an array
   * @private
   * @param {Array} arr - Array to modify
   * @param {number} from - Source index
   * @param {number} to - Target index
   */
  // eslint-disable-next-line class-methods-use-this
  _moveInArray(arr, from, to) {
    const val = arr.splice(from, 1)[0];
    arr.splice(to, 0, val);
  }
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.PDFViewer = PDFViewer;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PDFViewer };
}
