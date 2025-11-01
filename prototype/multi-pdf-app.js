/**
 * Multi-PDF Editor Application
 * Main application initialization
 */

/* eslint-disable no-undef */
(function initMultiPDFApp() {
  // Initialize UI enhancements
  const ui = new UIEnhancements();

  // Initialize Analytics from config
  const analytics = new Analytics(
    AppConfig.analytics.enableInDev || window.location.hostname !== 'localhost'
      ? AppConfig.analytics.measurementId
      : null
  );

  // Track page load
  analytics.trackPageView('/multi-pdf-editor', 'Multi-PDF Editor');

  // Track engagement time
  let engagementStart = Date.now();
  window.addEventListener('beforeunload', () => {
    const duration = Math.floor((Date.now() - engagementStart) / 1000);
    analytics.trackEngagement(duration);
  });

  // Wait for vendor assets to load
  function waitForVendorAssets() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        // Only wait for PDF libraries, Tesseract loads in background
        if (window.pdfjsLib && window.PDFLib) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  // Initialize the application
  async function initApp() {
    try {
      // Show loading
      ui.showLoading('Initializing PDF Editor...');

      // Wait for libraries to load
      await waitForVendorAssets();

      // Configure pdf.js worker
      if (window.pdfjsLib) {
        const workerSrc = (window.PDF_ASSETS && window.PDF_ASSETS.pdfWorker)
          || 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js';
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      }

      // Create manager and UI
      const manager = new MultiPDFManager();
      const pdfUI = new MultiPDFUI(manager, {
        documentList: document.getElementById('documentList'),
        pageGrid: document.getElementById('pageGrid'),
      });

      // Hide loading
      ui.hideLoading();

      // Track theme changes
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
          analytics.trackThemeChange(e.target.checked ? 'dark' : 'light');
        });
      }

      // Image status helper
      function showImageStatus(message, isError = false) {
        if (isError) {
          ui.showToast(message, 'error', 5000);
        } else {
          ui.showToast(message, 'success', 3000);
        }
      }

      function hideImageStatus() {
        // Toast auto-hides
      }

      // Add Image button
      const addImageBtn = document.getElementById('addImageBtn');
      const imageInput = document.getElementById('imageInput');

      if (addImageBtn && imageInput) {
        addImageBtn.addEventListener('click', () => {
          imageInput.click();
        });

        imageInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          try {
            showImageStatus('📷 Converting image to PDF page...');

            // Read image as data URL
            const reader = new FileReader();
            reader.onload = async (event) => {
              try {
                const imageDataUrl = event.target.result;

                // Create a new PDF document with the image
                const pdfDoc = await PDFLib.PDFDocument.create();

                // Determine image type and embed
                let image;
                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                  image = await pdfDoc.embedJpg(imageDataUrl);
                } else if (file.type === 'image/png') {
                  image = await pdfDoc.embedPng(imageDataUrl);
                } else {
                  throw new Error('Unsupported image format. Please use JPG or PNG.');
                }

                // Create page with image dimensions
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                  x: 0,
                  y: 0,
                  width: image.width,
                  height: image.height,
                });

                // Save PDF
                const pdfBytes = await pdfDoc.save();
                const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
                const pdfFile = new File([pdfBlob], file.name.replace(/\.[^.]+$/, '.pdf'), {
                  type: 'application/pdf',
                });

                // Add to manager as a new document
                await ui.addFiles([pdfFile]);

                showImageStatus(`✅ Image "${file.name}" added as PDF page!`);
                setTimeout(hideImageStatus, 3000);
              } catch (error) {
                console.error('Failed to convert image:', error);
                showImageStatus(`❌ Failed to add image: ${error.message}`, true);
                setTimeout(hideImageStatus, 5000);
              }
            };
            reader.readAsDataURL(file);
          } catch (error) {
            console.error('Failed to read image:', error);
            showImageStatus(`❌ Failed to read image: ${error.message}`, true);
            setTimeout(hideImageStatus, 5000);
          } finally {
            // Reset input
            imageInput.value = '';
          }
        });
      }

      // Export button
      const exportBtn = document.getElementById('exportMergedBtn');
      exportBtn.addEventListener('click', async () => {
        if (manager.getTotalPageCount() > 0) {
          const exportStart = Date.now();
          ui.showLoading('Exporting PDF...', true);
          ui.updateProgress(0);

          setTimeout(() => ui.updateProgress(30), 500);
          setTimeout(() => ui.updateProgress(60), 1000);

          try {
            await pdfUI.exportMergedPDF();
            ui.updateProgress(100);
            ui.hideLoading();

            const exportDuration = (Date.now() - exportStart) / 1000;

            // Track analytics
            analytics.trackPDFExport(manager.getTotalPageCount(), exportDuration);

            ui.showToast('PDF exported successfully!', 'success');
          } catch (error) {
            ui.hideLoading();

            // Track error
            analytics.trackError('pdf_export', error.message, false);

            ui.showToast(`Export failed: ${error.message}`, 'error');
          }
        } else {
          ui.showToast('No pages to export. Please add PDF files first.', 'warning');
        }
      });

      // Clear all button
      const clearAllBtn = document.getElementById('clearAllBtn');
      clearAllBtn.addEventListener('click', async () => {
        const confirmed = await ui.confirm(
          'Clear All Documents',
          'Remove all documents? This cannot be undone.'
        );
        if (confirmed) {
          pdfUI.clearAll();

          // Track analytics
          analytics.trackFeatureUsage('clear_all');

          ui.showToast('All documents cleared', 'info');
        }
      });

      // Help modal
      const helpBtn = document.getElementById('helpMultiBtn');
      const helpModal = document.getElementById('helpMultiModal');
      const closeHelpBtn = document.getElementById('closeHelpMultiBtn');

      if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', () => {
          helpModal.showModal();

          // Track analytics
          analytics.trackFeatureUsage('help_modal');
        });

        if (closeHelpBtn) {
          closeHelpBtn.addEventListener('click', () => {
            helpModal.close();
          });
        }

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && helpModal.open) {
            helpModal.close();
          }
          if (e.key === '?' && !helpModal.open) {
            e.preventDefault();
            helpModal.showModal();
          }
        });
      }

      // Monitor page count to enable/disable export button
      const originalRenderPageGrid = pdfUI.renderPageGrid.bind(pdfUI);
      pdfUI.renderPageGrid = async function renderPageGrid() {
        await originalRenderPageGrid();
        const pageCount = manager.getTotalPageCount();
        exportBtn.disabled = pageCount === 0;
      };

      console.log('Multi-PDF Editor initialized successfully');
      ui.showToast('PDF Editor ready!', 'success', 2000);

      // Show mobile drag hint on touch devices
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        setTimeout(() => {
          ui.showToast('💡 Tip: Long press pages to drag and reorder!', 'info', 4000);
        }, 3000);
      }

      // Track successful initialization
      analytics.trackEvent('app_initialized', {
        mode: 'multi-pdf',
        version: '3.0.0',
        device_type: ('ontouchstart' in window) ? 'touch' : 'mouse',
        category: 'Lifecycle',
      });

      // Update status
      const statusEl = document.getElementById('multiPdfStatus');
      if (statusEl) {
        statusEl.textContent = 'Ready - Drop PDF files above or click to browse';
        statusEl.classList.remove('alert-warning', 'alert-error');
        statusEl.classList.add('alert-success');
      }
    } catch (error) {
      console.error('Failed to initialize Multi-PDF Editor:', error);

      // Track error
      analytics.trackError('app_initialization', error.message, true);

      const statusEl = document.getElementById('multiPdfStatus');
      if (statusEl) {
        statusEl.textContent = `Initialization failed: ${error.message}`;
        statusEl.classList.remove('alert-success', 'alert-warning');
        statusEl.classList.add('alert-error');
      }
      alert(`Initialization failed: ${error.message}`);
    }
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}());
