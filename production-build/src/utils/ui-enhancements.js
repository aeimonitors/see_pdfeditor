/**
 * UI Enhancements Utility Module
 * Toast notifications, loading states, and theme management
 */

class UIEnhancements {
  constructor() {
    this.toastContainer = document.getElementById('toast-container');
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.loadingText = document.getElementById('loading-text');
    this.loadingProgress = document.getElementById('loading-progress');
    this.themeToggle = document.getElementById('theme-toggle');

    this.initTheme();
  }

  /**
   * Initialize theme from localStorage
   */
  initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);

    if (this.themeToggle) {
      this.themeToggle.checked = savedTheme === 'dark';
      this.themeToggle.addEventListener('change', (e) => {
        this.setTheme(e.target.checked ? 'dark' : 'light');
      });
    }
  }

  /**
   * Set theme
   * @param {string} theme - 'light' or 'dark'
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (default: 3000)
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg toast-notification`;

    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };

    toast.innerHTML = `
      <div>
        ${icons[type] || icons.info}
        <span>${message}</span>
      </div>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Show loading overlay
   * @param {string} message - Loading message
   * @param {boolean} showProgress - Show progress bar
   */
  showLoading(message = 'Loading...', showProgress = false) {
    if (this.loadingOverlay) {
      this.loadingText.textContent = message;
      this.loadingProgress.classList.toggle('hidden', !showProgress);
      this.loadingOverlay.classList.remove('hidden');
      this.loadingOverlay.classList.add('flex');
    }
  }

  /**
   * Update loading progress
   * @param {number} value - Progress value (0-100)
   */
  updateProgress(value) {
    if (this.loadingProgress) {
      this.loadingProgress.value = value;
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('hidden');
      this.loadingOverlay.classList.remove('flex');
    }
  }

  /**
   * Create skeleton loading element
   * @param {number} count - Number of skeleton items
   * @returns {HTMLElement}
   */
  createSkeleton(count = 3) {
    const container = document.createElement('div');
    container.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'card bg-base-100 shadow-xl';
      skeleton.innerHTML = `
        <div class="card-body p-4">
          <div class="skeleton-loading h-32 rounded-lg mb-2"></div>
          <div class="skeleton-loading h-4 rounded w-3/4 mb-2"></div>
          <div class="skeleton-loading h-4 rounded w-1/2"></div>
        </div>
      `;
      container.appendChild(skeleton);
    }

    return container;
  }

  /**
   * Confirm dialog with DaisyUI modal
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @returns {Promise<boolean>}
   */
  async confirm(title, message) {
    return new Promise((resolve) => {
      const modal = document.createElement('dialog');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-box">
          <h3 class="font-bold text-lg">${title}</h3>
          <p class="py-4">${message}</p>
          <div class="modal-action">
            <button class="btn btn-ghost" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="confirm">Confirm</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      `;

      document.body.appendChild(modal);
      modal.showModal();

      modal.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm') {
          resolve(true);
          modal.close();
          modal.remove();
        } else if (action === 'cancel') {
          resolve(false);
          modal.close();
          modal.remove();
        }
      });

      modal.addEventListener('close', () => {
        resolve(false);
        modal.remove();
      });
    });
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.UIEnhancements = UIEnhancements;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIEnhancements;
}
