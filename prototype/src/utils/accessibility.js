/**
 * Accessibility Utilities
 * Provides screen reader announcements and keyboard navigation support
 * @module accessibility
 */

/**
 * Announce a message to screen readers
 * @param {string} message - Message to announce
 */
export function announce(message) {
  const announcer = document.getElementById('status-announcements');
  if (!announcer) {
    console.warn('Status announcements element not found');
    return;
  }

  announcer.textContent = message;

  // Clear after 1 second to allow re-announcements of same message
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

/**
 * Show accessible error message with optional suggestion
 * @param {string} message - Error message
 * @param {string} suggestion - Optional helpful suggestion
 */
export function showError(message, suggestion = '') {
  const errorBanner = document.getElementById('error-message');
  const errorText = errorBanner.querySelector('.error-text');
  const dismissBtn = errorBanner.querySelector('.error-dismiss');

  if (!errorBanner || !errorText) {
    // Fallback to alert if error banner not found
    alert(message + (suggestion ? `\n${suggestion}` : ''));
    return;
  }

  // Build error message HTML
  const messageHTML = `<strong>${message}</strong>${
    suggestion ? `<br><small>${suggestion}</small>` : ''
  }`;

  errorText.innerHTML = messageHTML;
  errorBanner.style.display = 'flex';

  // Focus the error banner for screen readers
  errorBanner.setAttribute('tabindex', '-1');
  errorBanner.focus();

  // Set up dismiss button
  if (dismissBtn) {
    const dismissHandler = () => {
      errorBanner.style.display = 'none';
      dismissBtn.removeEventListener('click', dismissHandler);
    };
    dismissBtn.addEventListener('click', dismissHandler);
  }

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    errorBanner.style.display = 'none';
  }, 5000);

  // Also announce to screen readers
  announce(message);
}

/**
 * Initialize keyboard navigation for page reordering
 * @param {HTMLElement} thumbnailsContainer - Container with thumbnails
 * @param {Function} movePageCallback - Callback to move page (index, direction)
 */
export function initKeyboardPageReordering(thumbnailsContainer, movePageCallback) {
  if (!thumbnailsContainer) return;

  document.addEventListener('keydown', (e) => {
    // Only handle Ctrl+Arrow keys
    if (!e.ctrlKey || e.altKey || e.shiftKey) return;

    const focused = document.activeElement;
    if (!focused || !focused.classList.contains('thumb')) return;

    const thumbnails = Array.from(thumbnailsContainer.children);
    const index = thumbnails.indexOf(focused);

    if (index === -1) return;

    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      movePageCallback(index, 'up');

      // Focus the thumbnail in new position
      setTimeout(() => {
        const newThumbs = Array.from(thumbnailsContainer.children);
        if (newThumbs[index - 1]) {
          newThumbs[index - 1].focus();
        }
      }, 100);

      announce(`Page moved up. Now position ${index}.`);
    } else if (e.key === 'ArrowDown' && index < thumbnails.length - 1) {
      e.preventDefault();
      movePageCallback(index, 'down');

      // Focus the thumbnail in new position
      setTimeout(() => {
        const newThumbs = Array.from(thumbnailsContainer.children);
        if (newThumbs[index + 1]) {
          newThumbs[index + 1].focus();
        }
      }, 100);

      announce(`Page moved down. Now position ${index + 2}.`);
    }
  });
}

/**
 * Add keyboard activation to drop zone
 * @param {HTMLElement} dropZone - Drop zone element
 * @param {HTMLElement} fileInput - Hidden file input
 */
export function initDropZoneKeyboard(dropZone, fileInput) {
  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('keydown', (e) => {
    // Activate on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
}

/**
 * Enhance thumbnail with keyboard accessibility
 * @param {HTMLElement} thumbnail - Thumbnail element
 * @param {number} pageNumber - Page number
 * @param {number} totalPages - Total pages in document
 */
export function enhanceThumbnailAccessibility(thumbnail, pageNumber, totalPages) {
  if (!thumbnail) return;

  // Make focusable
  thumbnail.setAttribute('tabindex', '0');

  // Add comprehensive ARIA label
  const label = `Page ${pageNumber} of ${totalPages}. Press Control plus Arrow Up or Down to reorder. Press Delete to remove. Press D to duplicate.`;
  thumbnail.setAttribute('aria-label', label);

  // Add keyboard handlers for Delete and D keys
  thumbnail.addEventListener('keydown', (e) => {
    if (e.key === 'Delete') {
      e.preventDefault();
      const deleteBtn = thumbnail.querySelector('.delete-btn');
      if (deleteBtn) deleteBtn.click();
    } else if (e.key === 'd' || e.key === 'D') {
      if (!e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const duplicateBtn = thumbnail.querySelector('.duplicate-btn');
        if (duplicateBtn) duplicateBtn.click();
      }
    }
  });
}

/**
 * Trap focus within a modal dialog
 * @param {HTMLElement} modal - Modal element
 */
export function trapFocus(modal) {
  if (!modal) return;

  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  // Store the element that had focus before modal opened
  const previouslyFocused = document.activeElement;

  // Focus the first element
  if (firstFocusable) {
    firstFocusable.focus();
  }

  // Trap focus
  const trapHandler = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  modal.addEventListener('keydown', trapHandler);

  // Return cleanup function
  return () => {
    modal.removeEventListener('keydown', trapHandler);
    if (previouslyFocused) {
      previouslyFocused.focus();
    }
  };
}

/**
 * Update ARIA live region with page count
 * @param {number} pageCount - Current number of pages
 */
export function announcePageCount(pageCount) {
  announce(`PDF loaded. ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}.`);
}

/**
 * Announce undo/redo action
 * @param {string} action - 'undo' or 'redo'
 * @param {string} commandName - Name of command (e.g., 'Page deletion', 'Annotation added')
 */
export function announceUndoRedo(action, commandName) {
  const message = action === 'undo'
    ? `${commandName} undone.`
    : `${commandName} redone.`;
  announce(message);
}

/**
 * Initialize accessibility enhancements
 * Called once on app startup
 */
export function initAccessibility() {
  console.log('Accessibility enhancements initialized');

  // Announce when vendor assets are loaded
  const vendorStatus = document.getElementById('vendor-status');
  if (vendorStatus) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const text = vendorStatus.textContent.trim();
          if (text && !text.includes('Loading')) {
            announce(text);
          }
        }
      });
    });

    observer.observe(vendorStatus, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }
}
