/**
 * PDF Editor Prototype - Main Application
 * Integrates viewer, annotations, export, and performance monitoring
 * @module app
 */

(function () {
  // DOM element references
  const fileInput = document.getElementById('fileInput');
  const thumbnails = document.getElementById('thumbnails');
  const viewer = document.getElementById('viewer');
  const exportBtn = document.getElementById('exportBtn');
  const addCommentBtn = document.getElementById('addCommentBtn');
  const generatePdfBtn = document.getElementById('generatePdfBtn');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const dropZone = document.getElementById('dropZone');

  // Check required libraries
  if (!window.pdfjsLib || !window.PDFLib) {
    showError('Required PDF libraries failed to load.', 'Please refresh the page.');
    return;
  }

  // Import accessibility utilities
  let a11y = null;
  import('./src/utils/accessibility.js').then((module) => {
    a11y = module;
    a11y.initAccessibility();
    // Initialize keyboard navigation
    if (thumbnails) {
      a11y.initKeyboardPageReordering(thumbnails, handleKeyboardPageMove);
    }
    if (dropZone && fileInput) {
      a11y.initDropZoneKeyboard(dropZone, fileInput);
    }
  }).catch((err) => {
    console.warn('Accessibility module failed to load:', err);
  });

  // Initialize modules
  let pdfViewer = null;
  let annotationManager = null;
  let pdfExporter = null;
  let commandHistory = null;
  const perfMonitor = window.performanceMonitor;

  /**
   * Initialize the PDF viewer
   */
  function initViewer() {
    try {
      pdfViewer = new PDFViewer({
        thumbnailContainer: thumbnails,
        viewerContainer: viewer,
        onPageClick: handlePageClick,
        onPageDuplicate: handlePageDuplicate,
        onPageDelete: handlePageDeleteRequest,
        onPageDuplicateRequest: handlePageDuplicateRequest,
      });

      annotationManager = new AnnotationManager();
    } catch (error) {
      console.error('Failed to initialize viewer:', error);
      showError('Initialization failed.', 'Please refresh the page.');
    }
  }

  /**
   * Handle keyboard-based page reordering (Ctrl+Arrow)
   * @param {number} index - Current page index
   * @param {string} direction - 'up' or 'down'
   */
  async function handleKeyboardPageMove(index, direction) {
    if (!pdfViewer || !commandHistory) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    try {
      const { ReorderPageCommand } = await import('./src/utils/command-history.js');
      const command = new ReorderPageCommand(pdfViewer, index, targetIndex);
      await commandHistory.executeCommand(command);
      updateUndoRedoButtons();
    } catch (error) {
      console.error('Failed to reorder page:', error);
      if (a11y) a11y.showError('Failed to reorder page.');
    }
  }

  /**
   * Handle page duplication - copy annotations to duplicated page
   * @param {number} originalPageNumber - Original page number
   * @param {number} duplicatedIndex - Index where duplicate was inserted
   */
  function handlePageDuplicate(originalPageNumber, duplicatedIndex) {
    // Copy annotations to the duplicated page
    if (annotationManager) {
      const duplicatedPageNumber = pdfViewer.pageOrder[duplicatedIndex];
      annotationManager.duplicateForPage(originalPageNumber, duplicatedPageNumber);
    }
    console.log(`Page ${originalPageNumber} duplicated at index ${duplicatedIndex}`);
    if (a11y) a11y.announce(`Page ${originalPageNumber} duplicated.`);
  }

  /**
   * Handle page delete request (wrap in command for undo/redo)
   * @param {number} pageNumber - Page to delete
   */
  async function handlePageDeleteRequest(pageNumber) {
    if (!commandHistory) {
      // No command history yet, delete directly
      pdfViewer.deletePage(pageNumber);
      return;
    }

    try {
      // Confirm deletion before creating command
      if (pdfViewer.pageOrder.length <= 1) {
        if (a11y) {
          a11y.showError('Cannot delete the last remaining page.');
        } else {
          alert('Cannot delete the last remaining page');
        }
        return;
      }

      const confirmed = confirm(`Delete page ${pageNumber}?`);
      if (!confirmed) return;

      const { DeletePageCommand } = await import('./src/utils/command-history.js');
      const command = new DeletePageCommand(pdfViewer, pageNumber, annotationManager);

      await commandHistory.executeCommand(command);
      updateUndoRedoButtons();
      if (a11y) a11y.announce(`Page ${pageNumber} deleted. Undo available.`);
    } catch (error) {
      console.error('Failed to delete page:', error);
      if (a11y) {
        a11y.showError('Failed to delete page.');
      } else {
        alert('Failed to delete page');
      }
    }
  }

  /**
   * Handle page duplicate request (wrap in command for undo/redo)
   * @param {number} pageNumber - Page to duplicate
   */
  async function handlePageDuplicateRequest(pageNumber) {
    if (!commandHistory) {
      // No command history yet, duplicate directly
      pdfViewer.duplicatePage(pageNumber);
      return;
    }

    try {
      const { DuplicatePageCommand } = await import('./src/utils/command-history.js');
      const command = new DuplicatePageCommand(pdfViewer, pageNumber);
      await commandHistory.executeCommand(command);
      updateUndoRedoButtons();
      if (a11y) a11y.announce(`Page ${pageNumber} duplicated.`);
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      if (a11y) {
        a11y.showError('Failed to duplicate page.');
      } else {
        alert('Failed to duplicate page');
      }
    }
  }

  /**
   * Handle annotation edit
   * @param {Object} annotation - Annotation to edit
   */
  function handleAnnotationEdit(annotation) {
    const newText = window.prompt('Edit comment text:', annotation.text);
    if (newText && newText.trim() !== '') {
      annotationManager.updateText(annotation, newText);
      // Re-render all pages to update annotation
      pdfViewer.renderAll((overlay, pageNumber, canvas) => {
        annotationManager.renderOnOverlay(
          overlay,
          pageNumber,
          canvas,
          handleAnnotationEdit,
          handleAnnotationDelete,
          handleAnnotationColorChange,
        );
      });
    }
  }

  /**
   * Handle annotation delete
   * @param {Object} _annotation - Annotation to delete
   * @param {number} index - Annotation index
   */
  function handleAnnotationDelete(_annotation, index) {
    const confirmed = confirm('Delete this annotation?');
    if (confirmed) {
      annotationManager.remove(index);
      // Re-render all pages to update annotation
      pdfViewer.renderAll((overlay, pageNumber, canvas) => {
        annotationManager.renderOnOverlay(
          overlay,
          pageNumber,
          canvas,
          handleAnnotationEdit,
          handleAnnotationDelete,
          handleAnnotationColorChange,
        );
      });
      if (a11y) a11y.announce('Annotation deleted. Undo available.');
    }
  }

  /**
   * Handle annotation color change
   * @param {Object} _annotation - Annotation with new color
   */
  function handleAnnotationColorChange(_annotation) {
    // Re-render all pages to update annotation color
    pdfViewer.renderAll((overlay, pageNumber, canvas) => {
      annotationManager.renderOnOverlay(
        overlay,
        pageNumber,
        canvas,
        handleAnnotationEdit,
        handleAnnotationDelete,
        handleAnnotationColorChange,
      );
    });
  }

  /**
   * Handle page click for adding annotations
   * @param {MouseEvent} event - Click event
   * @param {number} pageNumber - Page number
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {HTMLElement} overlay - Annotation overlay
   */
  function handlePageClick(event, pageNumber, canvas, overlay) {
    if (!annotationManager.isInAddMode()) return;

    try {
      const annotation = annotationManager.handlePageClick(event, pageNumber, canvas);
      if (annotation) {
        annotationManager.renderOnOverlay(
          overlay,
          pageNumber,
          canvas,
          handleAnnotationEdit,
          handleAnnotationDelete,
          handleAnnotationColorChange,
        );
        if (a11y) a11y.announce(`Annotation added to page ${pageNumber}.`);
      }
    } catch (error) {
      console.error('Failed to add annotation:', error);
      if (a11y) {
        a11y.showError('Failed to add comment.', 'Please try again.');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    }
  }

  /**
   * Show an error message to the user
   * @param {string} message - Error message
   * @param {string} suggestion - Optional suggestion
   */
  function showError(message, suggestion = '') {
    if (a11y) {
      a11y.showError(message, suggestion);
    } else {
      alert(`Error: ${message}${suggestion ? `\n${suggestion}` : ''}`);
    }
  }

  /**
   * Show an info banner
   * @param {string} message - Info message
   * @param {string} style - Banner style ('info', 'warning', 'success')
   */
  function showInfoBanner(message, style = 'info') {
    const statusEl = document.getElementById('vendor-status');
    if (!statusEl) return;

    const styles = {
      info: { bg: '#fffef0', border: '#ffe066', color: '#856404' },
      warning: { bg: '#fff3cd', border: '#ffc107', color: '#856404' },
      success: { bg: '#d4edda', border: '#28a745', color: '#155724' },
    };

    const s = styles[style] || styles.info;
    statusEl.textContent = message;
    statusEl.style.background = s.bg;
    statusEl.style.borderColor = s.border;
    statusEl.style.color = s.color;
  }

  /**
   * Check file size and show warnings
   * @param {File} file - File to check
   * @returns {boolean} True if file should be processed
   */
  function checkFileSize(file) {
    const fileSizeMB = file.size / (1024 * 1024);

    // Block files > 200 MB
    if (fileSizeMB > 200) {
      showError(
        'PDF Too Large',
        `This PDF (${fileSizeMB.toFixed(1)} MB) exceeds the maximum supported size (200 MB). Use a PDF splitting tool or desktop editor for large files.`,
      );
      return false;
    }

    // Warn for files 50-200 MB
    if (fileSizeMB >= 50) {
      const proceed = confirm(
        'Large PDF Detected\n\n'
        + `This PDF is ${fileSizeMB.toFixed(1)} MB. Rendering may take significant time and memory.\n\n`
        + 'Do you want to proceed?',
      );
      return proceed;
    }

    // Info banner for files 10-50 MB
    if (fileSizeMB >= 10) {
      showInfoBanner(
        `Large file detected (${fileSizeMB.toFixed(1)} MB). Rendering may take a moment...`,
        'info',
      );
    }

    return true;
  }

  /**
   * Load and render a PDF file
   * @param {File} file - PDF file to load
   * @returns {Promise<void>}
   */
  async function loadPDFFile(file) {
    try {
      // Check file size
      if (!checkFileSize(file)) {
        fileInput.value = '';
        return;
      }

      // Start performance tracking
      perfMonitor.reset();
      perfMonitor.start('fileLoadStart');

      // Read file
      const arrayBuffer = await file.arrayBuffer();
      perfMonitor.end('fileLoadEnd');

      // Load PDF
      perfMonitor.start('renderStart');
      const numPages = await pdfViewer.loadPDF(arrayBuffer);

      // Create exporter
      pdfExporter = new PDFExporter(pdfViewer.getOriginalBytes());

      // Render all pages
      await pdfViewer.renderAll((overlay, pageNumber, canvas) => {
        annotationManager.renderOnOverlay(
          overlay,
          pageNumber,
          canvas,
          handleAnnotationEdit,
          handleAnnotationDelete,
          handleAnnotationColorChange,
        );
      });

      perfMonitor.end('renderEnd');

      // Log performance metrics
      perfMonitor.logMetrics(file.size, numPages);

      // Update status banner
      const statusEl = document.getElementById('vendor-status');
      if (statusEl) {
        statusEl.innerHTML = perfMonitor.getStatusSummary(file.size, numPages);
        statusEl.style.background = '#d4edda';
        statusEl.style.borderColor = '#28a745';
        statusEl.style.color = '#155724';
      }

      // Announce to screen readers
      if (a11y) a11y.announcePageCount(numPages);

      // Start memory monitoring
      perfMonitor.startMemoryMonitoring(5000, (memoryUsage) => {
        const msg = `High memory usage detected (${memoryUsage.usedJSHeapSize} MB). `
          + 'Consider closing other tabs or reloading the page.';
        showInfoBanner(msg, 'warning');
      });

      // Initialize command history
      const { CommandHistory } = await import('./src/utils/command-history.js');
      commandHistory = new CommandHistory(50);
      updateUndoRedoButtons();

      // Enable export button
      exportBtn.disabled = false;
    } catch (error) {
      console.error('Failed to load PDF:', error);
      showError('Failed to load PDF', error.message);
      fileInput.value = '';
    }
  }

  /**
   * Generate a sample PDF for testing
   * @returns {Promise<void>}
   */
  async function generateSamplePDF() {
    generatePdfBtn.disabled = true;
    generatePdfBtn.textContent = 'Generating sample...';

    try {
      perfMonitor.reset();
      perfMonitor.start('fileLoadStart');

      // Generate sample PDF
      const pdfBytes = await window.generateSamplePDF(3);
      perfMonitor.end('fileLoadEnd');

      // Load into viewer
      perfMonitor.start('renderStart');
      const numPages = await pdfViewer.loadPDF(pdfBytes.buffer);

      // Create exporter
      pdfExporter = new PDFExporter(pdfViewer.getOriginalBytes());

      // Clear annotations
      annotationManager.clear();

      // Render
      await pdfViewer.renderAll((overlay, pageNumber, canvas) => {
        annotationManager.renderOnOverlay(
          overlay,
          pageNumber,
          canvas,
          handleAnnotationEdit,
          handleAnnotationDelete,
          handleAnnotationColorChange,
        );
      });

      perfMonitor.end('renderEnd');

      // Log metrics
      perfMonitor.logMetrics(pdfBytes.length, numPages);

      // Update status
      showInfoBanner('Sample PDF generated successfully', 'success');
      if (a11y) a11y.announcePageCount(numPages);

      // Enable export
      exportBtn.disabled = false;
    } catch (error) {
      console.error('Failed to generate sample PDF:', error);
      showError('Failed to generate sample PDF', error.message);
    } finally {
      generatePdfBtn.disabled = false;
      generatePdfBtn.textContent = '📄 Generate sample PDF';
    }
  }

  /**
   * Show export options dialog
   * @returns {Object|null} Export options or null if cancelled
   */
  function showExportDialog() {
    const filename = window.prompt(
      'Enter filename for exported PDF:',
      'edited-document.pdf',
    );
    if (!filename) return null;

    const title = window.prompt('PDF Title (optional):', '');
    const author = window.prompt('PDF Author (optional):', '');

    return {
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      title,
      author,
    };
  }

  /**
   * Export the current PDF with modifications
   * @returns {Promise<void>}
   */
  async function exportPDF() {
    if (!pdfExporter) {
      showError('No PDF loaded to export');
      return;
    }

    // Get export options from user
    const options = showExportDialog();
    if (!options) return; // User cancelled

    exportBtn.disabled = true;
    exportBtn.textContent = 'Exporting...';

    // Show progress indicator
    const statusEl = document.getElementById('vendor-status');
    if (statusEl) {
      statusEl.innerHTML = '⏳ Preparing PDF export...';
      statusEl.style.background = '#fff3cd';
      statusEl.style.borderColor = '#ffc107';
    }

    try {
      // Add metadata if provided
      if (options.title || options.author) {
        pdfExporter.setMetadata({
          title: options.title || 'Edited PDF',
          author: options.author || 'PDF Editor',
          creator: 'see_pdfeditor MVP',
          producer: 'pdf-lib',
        });
      }

      await pdfExporter.exportAndDownload(
        pdfViewer.getPageOrder(),
        annotationManager,
        options.filename,
      );

      showInfoBanner('✅ PDF exported successfully', 'success');
      if (a11y) a11y.announce('PDF exported successfully.');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Export failed', error.message);
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = '💾 Export PDF';
    }
  }

  /**
   * Toggle annotation add mode
   */
  function toggleAddCommentMode() {
    try {
      const isAddMode = annotationManager.toggleAddMode();
      addCommentBtn.textContent = isAddMode
        ? 'Click a page to add comment (click again to cancel)'
        : 'Add Comment Pin';

      if (!isAddMode) {
        addCommentBtn.blur();
      }
    } catch (error) {
      console.error('Failed to toggle comment mode:', error);
    }
  }

  /**
   * Handle undo command
   */
  async function handleUndo() {
    if (!commandHistory || !commandHistory.canUndo()) return;

    try {
      await commandHistory.undo();
      updateUndoRedoButtons();
      showInfoBanner(`Undone: ${commandHistory.history[commandHistory.currentIndex + 1]
        .getDescription()}`, 'success');
    } catch (error) {
      console.error('Undo failed:', error);
      showError('Failed to undo operation');
    }
  }

  /**
   * Handle redo command
   */
  async function handleRedo() {
    if (!commandHistory || !commandHistory.canRedo()) return;

    try {
      await commandHistory.redo();
      updateUndoRedoButtons();
      showInfoBanner(`Redone: ${commandHistory.history[commandHistory.currentIndex]
        .getDescription()}`, 'success');
    } catch (error) {
      console.error('Redo failed:', error);
      showError('Failed to redo operation');
    }
  }

  /**
   * Update undo/redo button states
   */
  function updateUndoRedoButtons() {
    if (!commandHistory) {
      undoBtn.disabled = true;
      redoBtn.disabled = true;
      return;
    }

    undoBtn.disabled = !commandHistory.canUndo();
    redoBtn.disabled = !commandHistory.canRedo();

    // Update tooltips with descriptions
    if (commandHistory.canUndo()) {
      undoBtn.title = `Undo: ${commandHistory.getUndoDescription()} (Ctrl+Z)`;
    } else {
      undoBtn.title = 'Undo (Ctrl+Z)';
    }

    if (commandHistory.canRedo()) {
      redoBtn.title = `Redo: ${commandHistory.getRedoDescription()} (Ctrl+Y)`;
    } else {
      redoBtn.title = 'Redo (Ctrl+Y)';
    }
  }

  /**
   * Show help modal
   */
  function showHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * Hide help modal
   */
  function hideHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Initialize drag-and-drop functionality
   */
  function initDropZone() {
    const dropZoneEl = document.getElementById('dropZone');
    if (!dropZoneEl) return;

    // Click to browse
    dropZoneEl.addEventListener('click', () => {
      fileInput.click();
    });

    // Keyboard accessibility - Enter or Space to open file picker
    dropZoneEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      dropZoneEl.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    // Visual feedback on drag over
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZoneEl.addEventListener(eventName, () => {
        dropZoneEl.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZoneEl.addEventListener(eventName, () => {
        dropZoneEl.classList.remove('drag-over');
      });
    });

    // Handle dropped files
    dropZoneEl.addEventListener('drop', async (e) => {
      const { files } = e.dataTransfer;

      if (files.length === 0) {
        showError('No files dropped');
        return;
      }

      const file = files[0];

      // Validate file type
      if (file.type !== 'application/pdf') {
        showError('Invalid file type.', 'Please select a PDF file.');
        return;
      }

      await loadPDFFile(file);
    });
  }

  // Event listeners
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    await loadPDFFile(file);
  });

  generatePdfBtn.addEventListener('click', generateSamplePDF);
  exportBtn.addEventListener('click', exportPDF);
  addCommentBtn.addEventListener('click', toggleAddCommentMode);
  undoBtn.addEventListener('click', handleUndo);
  redoBtn.addEventListener('click', handleRedo);

  // Help button and modal listeners
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', showHelpModal);
  }

  const closeHelpBtn = document.getElementById('closeHelpBtn');
  if (closeHelpBtn) {
    closeHelpBtn.addEventListener('click', hideHelpModal);
  }

  const helpModal = document.getElementById('helpModal');
  if (helpModal) {
    // Close on background click
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        hideHelpModal();
      }
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Z (or Cmd+Z on Mac) for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    }
    // Ctrl+Y (or Cmd+Shift+Z on Mac) for redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      handleRedo();
    }
    // ? for help
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      showHelpModal();
    }
    // Escape to close help
    if (e.key === 'Escape') {
      hideHelpModal();
    }
  });

  // Initialize on load
  try {
    initViewer();
    initDropZone();
    console.log('✅ PDF Editor initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Application failed to initialize. Please refresh the page.');
  }
}());
