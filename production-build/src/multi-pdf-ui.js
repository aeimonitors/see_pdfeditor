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
    this.currentZoomPage = null;
    this.mouseDragInProgress = false; // Track if a mouse drag was completed

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

    // Zoom preview modal controls
    const closeZoomBtn = document.getElementById('closeZoomPreviewBtn');
    if (closeZoomBtn) {
      closeZoomBtn.addEventListener('click', () => {
        document.getElementById('zoomPreviewModal').close();
      });
    }

    // Close zoom modal when clicking anywhere outside the modal box
    const zoomModal = document.getElementById('zoomPreviewModal');
    const zoomModalBox = document.getElementById('zoomPreviewModalBox');
    if (zoomModal && zoomModalBox) {
      zoomModal.addEventListener('click', (e) => {
        // Close if clicking outside the modal box
        if (e.target === zoomModal) {
          zoomModal.close();
        }
      });

      // Prevent clicks inside modal box from closing
      zoomModalBox.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Close zoom modal when clicking on canvas container (gray area)
    const zoomCanvas = document.getElementById('zoomPreviewCanvas');
    if (zoomCanvas) {
      zoomCanvas.addEventListener('click', (e) => {
        // Only close if clicking the container itself, not the canvas or wrapper
        if (e.target === zoomCanvas) {
          document.getElementById('zoomPreviewModal').close();
        }
      });
    }

    // Close zoom modal when clicking backdrop
    const zoomModalBackdrop = document.getElementById('zoomModalBackdrop');
    if (zoomModalBackdrop) {
      zoomModalBackdrop.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('zoomPreviewModal').close();
      });
    }

    const zoomRotateBtn = document.getElementById('zoomRotateBtn');
    if (zoomRotateBtn) {
      zoomRotateBtn.addEventListener('click', () => this.handleZoomRotate());
    }

    const zoomDeleteBtn = document.getElementById('zoomDeleteBtn');
    if (zoomDeleteBtn) {
      zoomDeleteBtn.addEventListener('click', () => this.handleZoomDelete());
    }

    const zoomPrevBtn = document.getElementById('zoomPrevBtn');
    if (zoomPrevBtn) {
      zoomPrevBtn.addEventListener('click', () => this.handleZoomPrevious());
    }

    const zoomNextBtn = document.getElementById('zoomNextBtn');
    if (zoomNextBtn) {
      zoomNextBtn.addEventListener('click', () => this.handleZoomNext());
    }

    // Keyboard navigation in zoom modal
    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('zoomPreviewModal');
      if (modal && modal.open) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.handleZoomPrevious();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.handleZoomNext();
        }
      }
    });
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
   * @param {Object} options - Rendering options
   * @param {boolean} options.preserveScroll - Whether to preserve scroll position
   * @param {number} options.focusIndex - Index of page to keep visible after update
   */
  async renderPageGrid(options = {}) {
    const container = this.containers.pageGrid;
    if (!container) return;

    // Clean up ALL drag states before re-rendering to prevent stuck states
    document.querySelectorAll('.page-preview').forEach(p => {
      p.classList.remove('dragging');
      p.classList.remove('drag-over');
    });

    // Clean up any drag clones that might still exist
    document.querySelectorAll('.drag-clone').forEach(clone => {
      clone.remove();
    });

    // Reset drag index
    this.draggedPageIndex = null;

    // Save scroll position if requested
    const scrollElement = window;
    let savedScrollTop = 0;
    let savedScrollLeft = 0;

    if (options.preserveScroll) {
      savedScrollTop = window.scrollY || window.pageYOffset;
      savedScrollLeft = window.scrollX || window.pageXOffset;
    }

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

    // Restore scroll position if requested
    if (options.preserveScroll || options.focusIndex !== undefined) {
      if (options.focusIndex !== undefined) {
        // Find and scroll to the element AFTER it's been rendered
        // Use 'nearest' for faster, less dramatic scroll
        requestAnimationFrame(() => {
          const elementToFocus = container.querySelector(`[data-global-index="${options.focusIndex}"]`);
          if (elementToFocus) {
            elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }
        });
      } else if (options.preserveScroll) {
        // Use requestAnimationFrame to ensure DOM has updated for preserveScroll
        requestAnimationFrame(() => {
          if (scrollElement === window) {
            window.scrollTo(savedScrollLeft, savedScrollTop);
          } else {
            scrollElement.scrollTop = savedScrollTop;
            scrollElement.scrollLeft = savedScrollLeft;
          }
        });
      }
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
          <button class="page-action-btn zoom-btn" title="Zoom preview">🔍</button>
          <button class="page-action-btn rotate-btn" title="Rotate 90° clockwise">↻</button>
          <button class="page-action-btn delete-btn" title="Delete page">×</button>
        </div>
      `;

      pageEl.querySelector('.page-preview-canvas-wrapper').appendChild(canvas);

      // Action buttons
      const zoomBtn = pageEl.querySelector('.zoom-btn');
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showZoomPreview(pageDesc, globalIndex);
      });

      const rotateBtn = pageEl.querySelector('.rotate-btn');
      rotateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.manager.rotatePage(pageDesc.docId, pageDesc.pageIndex, 90);
        this.renderPageGrid({ preserveScroll: true });
      });

      const deleteBtn = pageEl.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.manager.deletePage(pageDesc.docId, pageDesc.pageIndex);
        // Focus on the next page (or previous if last page deleted)
        const nextIndex = globalIndex < this.manager.getTotalPageCount() ? globalIndex : globalIndex - 1;
        this.renderPageGrid({ focusIndex: nextIndex >= 0 ? nextIndex : undefined });
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
        document.querySelectorAll('.page-preview').forEach(p => p.classList.remove('drag-over'));
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

        if (this.draggedPageIndex === null) return;

        const targetIndex = parseInt(pageEl.dataset.globalIndex, 10);

        if (targetIndex !== this.draggedPageIndex) {
          // Store the from index before state changes
          const fromIndex = this.draggedPageIndex;

          // Clean up all drag states immediately
          document.querySelectorAll('.page-preview').forEach(p => {
            p.classList.remove('drag-over');
            p.classList.remove('dragging');
          });

          // Calculate where the moved page will appear after reorder
          // When dropping at index X, reorderPages puts it at adjustedTo
          const finalIndex = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;

          // Set flag to prevent touch handler from also running
          this.mouseDragInProgress = true;

          // Clear dragged page index before re-render
          this.draggedPageIndex = null;

          // Clear selected pages since indices will change
          this.selectedPages.clear();

          // Reorder in the manager
          this.manager.reorderPages(fromIndex, targetIndex);

          // Keep the moved page visible at its final position
          this.renderPageGrid({ focusIndex: finalIndex });

          // Reset the flag after a short delay to allow any queued touch events to be skipped
          setTimeout(() => {
            this.mouseDragInProgress = false;
          }, 100);
        } else {
          // Clean up drag states if dropped on itself
          document.querySelectorAll('.page-preview').forEach(p => {
            p.classList.remove('drag-over');
            p.classList.remove('dragging');
          });
          this.draggedPageIndex = null;
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

          // Check if a mouse drag already handled this
          if (this.mouseDragInProgress) {
            // Cleanup without re-rendering
            if (dragClone) {
              dragClone.remove();
              dragClone = null;
            }
            return;
          }

          // Find drop target
          const elementsBelow = document.elementsFromPoint(touch.clientX, touch.clientY);
          const targetPage = elementsBelow.find(el => el.classList.contains('page-preview') && el !== pageEl);

          if (targetPage && this.draggedPageIndex !== null) {
            const targetIndex = parseInt(targetPage.dataset.globalIndex, 10);
            if (targetIndex !== this.draggedPageIndex) {
              // Store from index before state changes
              const fromIndex = this.draggedPageIndex;

              // Calculate where the moved page will appear after reorder
              const finalIndex = targetIndex > fromIndex ? targetIndex - 1 : targetIndex;

              // Clean up drag states
              document.querySelectorAll('.page-preview').forEach(p => {
                p.classList.remove('drag-over');
                p.classList.remove('dragging');
              });

              // Reset dragged page index
              this.draggedPageIndex = null;

              // Clear selected pages since indices will change
              this.selectedPages.clear();

              // Reorder in the manager
              this.manager.reorderPages(fromIndex, targetIndex);

              // Haptic feedback on drop
              if (navigator.vibrate) {
                navigator.vibrate(30);
              }

              // Keep the moved page visible at its final position
              this.renderPageGrid({ focusIndex: finalIndex });
            } else {
              // Dropped on itself
              this.draggedPageIndex = null;
            }
          }

          // Cleanup drag clone
          dragClone.remove();
          dragClone = null;
        }

        // Reset all drag states
        pageEl.classList.remove('dragging');
        document.querySelectorAll('.page-preview').forEach(p => {
          p.classList.remove('drag-over');
          p.classList.remove('dragging');
        });
        if (this.draggedPageIndex !== null) {
          this.draggedPageIndex = null;
        }
      });

      pageEl.addEventListener('touchcancel', () => {
        clearTimeout(this.longPressTimer);

        if (dragClone) {
          dragClone.remove();
          dragClone = null;
        }

        pageEl.classList.remove('dragging');
        document.querySelectorAll('.page-preview').forEach(p => {
          p.classList.remove('drag-over');
          p.classList.remove('dragging');
        });

        // Also reset the flag if a touch drag was cancelled
        this.mouseDragInProgress = false;
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
   * Show zoom preview modal
   * @param {Object} pageDesc - Page description
   * @param {number} globalIndex - Global page index
   */
  async showZoomPreview(pageDesc, globalIndex) {
    this.currentZoomPage = { pageDesc, globalIndex };

    const modal = document.getElementById('zoomPreviewModal');
    const canvasContainer = document.getElementById('zoomPreviewCanvas');
    const infoEl = document.getElementById('zoomPreviewInfo');

    // Clear previous content
    canvasContainer.innerHTML = '<span class="loading loading-spinner loading-lg"></span>';

    // Show modal
    modal.showModal();

    // Wait for modal to render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Get page directly from pageDesc which already has pdfDoc
      if (!pageDesc.pdfDoc) {
        throw new Error('PDF document not available');
      }

      const page = await pageDesc.pdfDoc.getPage(pageDesc.pageNum);

      // Calculate viewport - use higher scale for zoom
      const rotation = pageDesc.rotation || 0;

      // Get container dimensions (use full available space)
      const containerWidth = canvasContainer.clientWidth;
      const containerHeight = canvasContainer.clientHeight;
      const maxWidth = containerWidth * 0.98;
      const maxHeight = containerHeight * 0.92;

      // Start with base viewport to get dimensions
      let baseViewport = page.getViewport({ scale: 1.0, rotation });

      // Calculate scale to fit container while maximizing size
      const scaleX = maxWidth / baseViewport.width;
      const scaleY = maxHeight / baseViewport.height;
      const scale = Math.min(scaleX, scaleY);

      // Apply scale with higher maximum for better quality (minimum 1.0, maximum 4.0)
      const finalScale = Math.max(1.0, Math.min(scale, 4.0));
      const viewport = page.getViewport({ scale: finalScale, rotation });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.className = 'shadow-2xl rounded-lg max-w-full max-h-full';
      canvas.style.display = 'block';

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Update UI with wrapper
      canvasContainer.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center justify-center w-full h-full p-4';
      wrapper.appendChild(canvas);
      canvasContainer.appendChild(wrapper);

      infoEl.textContent = `Page ${globalIndex + 1} of ${this.manager.getTotalPageCount()} from ${pageDesc.docName}`;

      // Update navigation button states
      this.updateZoomNavigationButtons();
    } catch (error) {
      console.error('Failed to render zoom preview:', error);
      canvasContainer.innerHTML = `<div class="alert alert-error shadow-lg"><span>Failed to load preview: ${error.message}</span></div>`;
    }
  }

  /**
   * Update zoom navigation button states
   */
  updateZoomNavigationButtons() {
    if (!this.currentZoomPage) return;

    const { globalIndex } = this.currentZoomPage;
    const totalPages = this.manager.getTotalPageCount();

    const prevBtn = document.getElementById('zoomPrevBtn');
    const nextBtn = document.getElementById('zoomNextBtn');

    if (prevBtn) {
      prevBtn.disabled = globalIndex <= 0;
    }
    if (nextBtn) {
      nextBtn.disabled = globalIndex >= totalPages - 1;
    }
  }

  /**
   * Handle previous page in zoom preview
   */
  async handleZoomPrevious() {
    if (!this.currentZoomPage) return;

    const { globalIndex } = this.currentZoomPage;
    if (globalIndex <= 0) return;

    const pages = this.manager.getGlobalPageOrder();
    const prevIndex = globalIndex - 1;
    const prevPageDesc = pages[prevIndex];

    if (prevPageDesc) {
      await this.showZoomPreview(prevPageDesc, prevIndex);
    }
  }

  /**
   * Handle next page in zoom preview
   */
  async handleZoomNext() {
    if (!this.currentZoomPage) return;

    const { globalIndex } = this.currentZoomPage;
    const totalPages = this.manager.getTotalPageCount();
    if (globalIndex >= totalPages - 1) return;

    const pages = this.manager.getGlobalPageOrder();
    const nextIndex = globalIndex + 1;
    const nextPageDesc = pages[nextIndex];

    if (nextPageDesc) {
      await this.showZoomPreview(nextPageDesc, nextIndex);
    }
  }

  /**
   * Handle rotate from zoom preview
   */
  async handleZoomRotate() {
    if (!this.currentZoomPage) return;

    const { pageDesc, globalIndex } = this.currentZoomPage;
    this.manager.rotatePage(pageDesc.docId, pageDesc.pageIndex, 90);

    // Wait for grid to re-render with scroll preservation
    await this.renderPageGrid({ preserveScroll: true });

    // Get the updated page descriptor after rotation
    const updatedPages = this.manager.getGlobalPageOrder();
    const updatedPageDesc = updatedPages[globalIndex];

    if (updatedPageDesc && updatedPageDesc.pdfDoc) {
      // Update current zoom page reference
      this.currentZoomPage.pageDesc = updatedPageDesc;
      // Refresh zoom preview with rotated page
      await this.showZoomPreview(updatedPageDesc, globalIndex);
    } else {
      console.error('Updated page descriptor not found or invalid');
    }
  }

  /**
   * Handle delete from zoom preview
   */
  async handleZoomDelete() {
    if (!this.currentZoomPage) return;

    const { pageDesc, globalIndex } = this.currentZoomPage;
    const totalPages = this.manager.getTotalPageCount();

    // Delete the page
    this.manager.deletePage(pageDesc.docId, pageDesc.pageIndex);

    // Update grid with focus on next page
    const nextIndex = globalIndex < this.manager.getTotalPageCount() ? globalIndex : globalIndex - 1;
    await this.renderPageGrid({ focusIndex: nextIndex >= 0 ? nextIndex : undefined });
    this.updateStatus();

    // If there are more pages, show the next/previous page in zoom
    const remainingPages = this.manager.getTotalPageCount();
    if (remainingPages > 0) {
      const pages = this.manager.getGlobalPageOrder();
      // Show the page at the same index (which is now the next page) or the last page if we deleted the last one
      const indexToShow = globalIndex < remainingPages ? globalIndex : remainingPages - 1;
      const pageToShow = pages[indexToShow];
      if (pageToShow) {
        await this.showZoomPreview(pageToShow, indexToShow);
      }
    } else {
      // Close modal if no pages left
      document.getElementById('zoomPreviewModal').close();
      this.currentZoomPage = null;
    }
  }

  /**
   * Update status message
   */
  updateStatus() {
    const statusEl = document.getElementById('multiPdfStatus');
    const exportBtn = document.getElementById('exportMergedBtn');
    const exportBtnHeader = document.getElementById('exportMergedBtnHeader');

    if (statusEl) {
      const docCount = this.manager.getDocuments().length;
      const pageCount = this.manager.getTotalPageCount();
      statusEl.textContent = `${docCount} document(s), ${pageCount} total pages`;
    }

    // Enable/disable export buttons based on page count
    const hasPages = this.manager.getTotalPageCount() > 0;
    if (exportBtn) {
      exportBtn.disabled = !hasPages;
    }
    if (exportBtnHeader) {
      exportBtnHeader.disabled = !hasPages;
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
      const exportBtnHeader = document.getElementById('exportMergedBtnHeader');

      // Disable and update both buttons
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<span class="loading loading-spinner loading-xs"></span> <span>Merging...</span>';
      }
      if (exportBtnHeader) {
        exportBtnHeader.disabled = true;
        exportBtnHeader.innerHTML = '<span class="loading loading-spinner loading-xs"></span> <span class="hidden md:inline">Merging...</span>';
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

          // Reset buttons
          if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<span aria-hidden="true">💾</span> Export Merged PDF';
          }
          if (exportBtnHeader) {
            exportBtnHeader.disabled = false;
            exportBtnHeader.innerHTML = '<span aria-hidden="true">💾</span> <span class="hidden md:inline">Export PDF</span>';
          }
        } catch (error) {
          // User cancelled save dialog
          if (error.name === 'AbortError') {
            if (exportBtn) {
              exportBtn.disabled = false;
              exportBtn.innerHTML = '<span aria-hidden="true">💾</span> Export Merged PDF';
            }
            if (exportBtnHeader) {
              exportBtnHeader.disabled = false;
              exportBtnHeader.innerHTML = '<span aria-hidden="true">💾</span> <span class="hidden md:inline">Export PDF</span>';
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

        // Reset buttons
        if (exportBtn) {
          exportBtn.disabled = false;
          exportBtn.innerHTML = '<span aria-hidden="true">💾</span> Export Merged PDF';
        }
        if (exportBtnHeader) {
          exportBtnHeader.disabled = false;
          exportBtnHeader.innerHTML = '<span aria-hidden="true">💾</span> <span class="hidden md:inline">Export PDF</span>';
        }
      }
    } catch (error) {
      console.error('Failed to export merged PDF:', error);

      // Reset buttons on error
      const exportBtn = document.getElementById('exportMergedBtn');
      const exportBtnHeader = document.getElementById('exportMergedBtnHeader');

      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.innerHTML = '<span aria-hidden="true">💾</span> Export Merged PDF';
      }
      if (exportBtnHeader) {
        exportBtnHeader.disabled = false;
        exportBtnHeader.innerHTML = '<span aria-hidden="true">💾</span> <span class="hidden md:inline">Export PDF</span>';
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
