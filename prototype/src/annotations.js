/**
 * Annotations Module
 * Handles comment pins and annotation management
 * @module annotations
 */

/**
 * Annotation manager for handling comment pins
 */
class AnnotationManager {
  /**
   * Create a new annotation manager
   */
  constructor() {
    this.annotations = [];
    this.isAddMode = false;
  }

  /**
   * Get all annotations
   * @returns {Array<Object>} Array of annotation objects
   */
  getAll() {
    return [...this.annotations];
  }

  /**
   * Get annotations for a specific page
   * @param {number} pageNumber - 1-based page number
   * @returns {Array<Object>} Annotations for the page
   */
  getForPage(pageNumber) {
    return this.annotations.filter((a) => a.pageNumber === pageNumber);
  }

  /**
   * Add a new annotation
   * @param {number} pageNumber - 1-based page number
   * @param {number} xPct - X position as percentage (0-1)
   * @param {number} yPct - Y position as percentage (0-1)
   * @param {string} text - Annotation text
   * @param {string} color - Annotation color (hex)
   * @returns {Object} The created annotation
   */
  add(pageNumber, xPct, yPct, text, color = '#ff5a5f') {
    const annotation = {
      pageNumber, xPct, yPct, text, color,
    };
    this.annotations.push(annotation);
    return annotation;
  }

  /**
   * Remove an annotation
   * @param {number} index - Index of annotation to remove
   * @returns {boolean} True if removed
   */
  remove(index) {
    if (index >= 0 && index < this.annotations.length) {
      this.annotations.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all annotations
   */
  clear() {
    this.annotations = [];
  }

  /**
   * Duplicate annotations for a page
   * @param {number} sourcePageNumber - Source page number
   * @param {number} targetPageNumber - Target page number (for copied annotations)
   * @returns {Array<Object>} Duplicated annotations
   */
  duplicateForPage(sourcePageNumber, targetPageNumber) {
    const pageAnnotations = this.getForPage(sourcePageNumber);
    const duplicated = [];

    for (const annotation of pageAnnotations) {
      const newAnnotation = {
        ...annotation,
        pageNumber: targetPageNumber,
      };
      this.annotations.push(newAnnotation);
      duplicated.push(newAnnotation);
    }

    return duplicated;
  }

  /**
   * Toggle add mode
   * @returns {boolean} New add mode state
   */
  toggleAddMode() {
    this.isAddMode = !this.isAddMode;
    return this.isAddMode;
  }

  /**
   * Get current add mode state
   * @returns {boolean} True if in add mode
   */
  isInAddMode() {
    return this.isAddMode;
  }

  /**
   * Handle click on a page to add annotation
   * @param {MouseEvent} event - Click event
   * @param {number} pageNumber - Page number clicked
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {Object|null} Created annotation or null
   */
  handlePageClick(event, pageNumber, canvas) {
    if (!this.isAddMode) return null;

    // Compute coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPct = x / rect.width;
    const yPct = y / rect.height;

    const text = window.prompt('Comment text:');
    if (!text) return null;

    return this.add(pageNumber, xPct, yPct, text);
  }

  /**
   * Render annotations on an overlay element
   * @param {HTMLElement} overlay - Overlay container
   * @param {number} pageNumber - Page number to render annotations for
   * @param {HTMLCanvasElement} canvas - Canvas for position calculation
   * @param {Function} onEdit - Callback when annotation is edited
   * @param {Function} onDelete - Callback when annotation is deleted
   * @param {Function} onColorChange - Callback when annotation color changed
   */
  renderOnOverlay(overlay, pageNumber, canvas, onEdit, onDelete, onColorChange) {
    overlay.innerHTML = '';
    const pageAnnotations = this.getForPage(pageNumber);

    pageAnnotations.forEach((annotation) => {
      const pin = document.createElement('div');
      pin.className = 'annotation-pin';
      pin.style.left = `${annotation.xPct * canvas.width}px`;
      pin.style.top = `${annotation.yPct * canvas.height}px`;
      pin.style.background = annotation.color || '#ff5a5f';
      pin.dataset.annotationIndex = this.annotations.indexOf(annotation);

      // Make pin draggable
      pin.draggable = true;
      this._setupAnnotationDrag(pin, annotation, canvas);

      // Text label
      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = annotation.text;

      // Action buttons container
      const actions = document.createElement('div');
      actions.className = 'annotation-actions';

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'annotation-btn edit-btn';
      editBtn.innerHTML = '✎';
      editBtn.title = 'Edit annotation';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(annotation, this.annotations.indexOf(annotation));
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'annotation-btn delete-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.title = 'Delete annotation';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(annotation, this.annotations.indexOf(annotation));
      });

      // Color picker button
      const colorBtn = document.createElement('button');
      colorBtn.className = 'annotation-btn color-btn';
      colorBtn.innerHTML = '●';
      colorBtn.title = 'Change color';
      colorBtn.style.color = annotation.color || '#ff5a5f';
      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._showColorPicker(annotation, colorBtn, onColorChange);
      });

      actions.appendChild(colorBtn);
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      pin.appendChild(label);
      pin.appendChild(actions);
      overlay.appendChild(pin);
    });
  }

  /**
   * Setup drag-and-drop for annotation pins
   * @private
   * @param {HTMLElement} pin - Pin element
   * @param {Object} annotation - Annotation data
   * @param {HTMLCanvasElement} canvas - Canvas for position calculation
   */
  _setupAnnotationDrag(pin, annotation, canvas) {
    let isDragging = false;

    pin.addEventListener('dragstart', (e) => {
      isDragging = true;
      e.dataTransfer.effectAllowed = 'move';
      pin.style.opacity = '0.5';
    });

    pin.addEventListener('dragend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      pin.style.opacity = '1';

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update annotation position
      annotation.xPct = Math.max(0, Math.min(1, x / rect.width));
      annotation.yPct = Math.max(0, Math.min(1, y / rect.height));

      // Update pin position
      pin.style.left = `${annotation.xPct * canvas.width}px`;
      pin.style.top = `${annotation.yPct * canvas.height}px`;
    });
  }

  /**
   * Show color picker for annotation
   * @private
   * @param {Object} annotation - Annotation to change color
   * @param {HTMLElement} button - Button that triggered picker
   * @param {Function} callback - Callback when color changed
   */
  _showColorPicker(annotation, button, callback) {
    // Remove existing picker
    const existing = document.querySelector('.color-picker-popup');
    if (existing) existing.remove();

    // Create color picker popup
    const picker = document.createElement('div');
    picker.className = 'color-picker-popup';

    const colors = [
      { name: 'Red', value: '#ff5a5f' },
      { name: 'Orange', value: '#ff9500' },
      { name: 'Yellow', value: '#ffcc00' },
      { name: 'Green', value: '#34c759' },
      { name: 'Blue', value: '#007aff' },
      { name: 'Purple', value: '#af52de' },
    ];

    colors.forEach((colorInfo) => {
      const swatch = document.createElement('button');
      swatch.className = 'color-swatch';
      swatch.style.background = colorInfo.value;
      swatch.title = colorInfo.name;
      if (annotation.color === colorInfo.value) {
        swatch.classList.add('selected');
      }

      swatch.addEventListener('click', () => {
        annotation.color = colorInfo.value;
        button.style.color = colorInfo.value;
        picker.remove();
        if (callback) callback(annotation);
      });

      picker.appendChild(swatch);
    });

    // Position picker near button
    const rect = button.getBoundingClientRect();
    picker.style.position = 'fixed';
    picker.style.left = `${rect.right + 10}px`;
    picker.style.top = `${rect.top}px`;

    document.body.appendChild(picker);

    // Close picker when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closePickerHandler() {
        picker.remove();
        document.removeEventListener('click', closePickerHandler);
      });
    }, 100);
  }

  /**
   * Update annotation text
   * @param {Object} annotation - Annotation to update
   * @param {string} newText - New text content
   * @returns {boolean} True if updated
   */
  updateText(annotation, newText) {
    if (!newText || newText.trim() === '') return false;
    annotation.text = newText;
    return true;
  }

  /**
   * Update annotation color
   * @param {Object} annotation - Annotation to update
   * @param {string} newColor - New color (hex)
   * @returns {boolean} True if updated
   */
  updateColor(annotation, newColor) {
    if (!newColor) return false;
    annotation.color = newColor;
    return true;
  }

  /**
   * Flatten annotations onto a PDF document
   * @param {PDFDocument} pdfDoc - pdf-lib document to add annotations to
   * @param {Array<number>} pageOrder - Current page order
   * @returns {Promise<void>}
   */
  async flattenToPDF(pdfDoc, pageOrder) {
    try {
      for (const annotation of this.annotations) {
        // Find where this original page now lives in the new document
        const newIdx = pageOrder.indexOf(annotation.pageNumber);
        if (newIdx === -1) continue;

        const page = pdfDoc.getPage(newIdx);
        const { width, height } = page.getSize();

        // Convert from canvas coordinates (top-left) to PDF coordinates (bottom-left)
        const x = annotation.xPct * width;
        const y = height - (annotation.yPct * height);

        // Convert hex color to RGB
        const hexColor = annotation.color || '#ff5a5f';
        const r = parseInt(hexColor.substr(1, 2), 16) / 255;
        const g = parseInt(hexColor.substr(3, 2), 16) / 255;
        const b = parseInt(hexColor.substr(5, 2), 16) / 255;

        // Draw a small circle (pin)
        page.drawEllipse({
          x,
          y,
          xScale: 6,
          yScale: 6,
          color: PDFLib.rgb(r, g, b),
          borderColor: PDFLib.rgb(1, 1, 1),
          borderWidth: 1,
        });

        // Draw the text label to the right
        page.drawText(annotation.text, {
          x: x + 10,
          y: y - 6,
          size: 10,
          color: PDFLib.rgb(0, 0, 0),
        });
      }
    } catch (error) {
      console.error('Failed to flatten annotations to PDF:', error);
      throw error;
    }
  }
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.AnnotationManager = AnnotationManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnnotationManager };
}
