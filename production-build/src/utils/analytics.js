/**
 * Analytics Utility Module
 * Google Analytics 4 and custom event tracking
 */

class Analytics {
  constructor(measurementId = null) {
    this.measurementId = measurementId;
    this.enabled = false;
    this.queue = [];

    if (measurementId) {
      this.init();
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  init() {
    if (typeof window === 'undefined') return;

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: true,
      anonymize_ip: true,
    });

    this.enabled = true;

    // Process queued events
    this.queue.forEach((event) => this.trackEvent(event.name, event.params));
    this.queue = [];

    console.log('Analytics initialized');
  }

  /**
   * Track custom event
   * @param {string} eventName - Event name
   * @param {Object} params - Event parameters
   */
  trackEvent(eventName, params = {}) {
    if (!this.enabled) {
      this.queue.push({ name: eventName, params });
      return;
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      console.log('Analytics event:', eventName, params);
    }
  }

  /**
   * Track page view
   * @param {string} pagePath - Page path
   * @param {string} pageTitle - Page title
   */
  trackPageView(pagePath, pageTitle) {
    this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  /**
   * Track PDF upload
   * @param {number} fileSize - File size in bytes
   * @param {number} pageCount - Number of pages
   */
  trackPDFUpload(fileSize, pageCount) {
    this.trackEvent('pdf_upload', {
      file_size_mb: (fileSize / (1024 * 1024)).toFixed(2),
      page_count: pageCount,
      category: 'PDF Operations',
    });
  }

  /**
   * Track PDF export
   * @param {number} pageCount - Number of pages exported
   * @param {number} duration - Export duration in seconds
   */
  trackPDFExport(pageCount, duration) {
    this.trackEvent('pdf_export', {
      page_count: pageCount,
      duration_seconds: duration,
      category: 'PDF Operations',
    });
  }

  /**
   * Track OCR usage
   * @param {number} pageCount - Number of pages processed
   * @param {boolean} success - Whether OCR succeeded
   */
  trackOCRUsage(pageCount, success) {
    this.trackEvent('ocr_usage', {
      page_count: pageCount,
      success,
      category: 'OCR',
    });
  }

  /**
   * Track image addition
   * @param {string} imageType - Image type (jpg, png, etc.)
   * @param {number} fileSize - File size in bytes
   */
  trackImageAdd(imageType, fileSize) {
    this.trackEvent('image_add', {
      image_type: imageType,
      file_size_kb: (fileSize / 1024).toFixed(2),
      category: 'Image Operations',
    });
  }

  /**
   * Track page operation
   * @param {string} operation - Operation type (rotate, delete, reorder, duplicate)
   */
  trackPageOperation(operation) {
    this.trackEvent('page_operation', {
      operation,
      category: 'Page Operations',
    });
  }

  /**
   * Track theme change
   * @param {string} theme - Theme name (light, dark)
   */
  trackThemeChange(theme) {
    this.trackEvent('theme_change', {
      theme,
      category: 'UI',
    });
  }

  /**
   * Track error
   * @param {string} errorType - Error type
   * @param {string} errorMessage - Error message
   * @param {boolean} fatal - Whether error is fatal
   */
  trackError(errorType, errorMessage, fatal = false) {
    this.trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      fatal,
      category: 'Errors',
    });
  }

  /**
   * Track user engagement time
   * @param {number} duration - Engagement duration in seconds
   */
  trackEngagement(duration) {
    this.trackEvent('user_engagement', {
      engagement_time_msec: duration * 1000,
      category: 'Engagement',
    });
  }

  /**
   * Track feature usage
   * @param {string} feature - Feature name
   */
  trackFeatureUsage(feature) {
    this.trackEvent('feature_usage', {
      feature_name: feature,
      category: 'Features',
    });
  }

  /**
   * Set user property
   * @param {string} property - Property name
   * @param {*} value - Property value
   */
  setUserProperty(property, value) {
    if (!this.enabled) return;

    if (typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', {
        [property]: value,
      });
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Analytics = Analytics;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}
