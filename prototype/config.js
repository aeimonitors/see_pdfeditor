/**
 * Application Configuration
 * Centralized configuration for analytics, features, and settings
 */

const AppConfig = {
  // Application info
  app: {
    name: 'See PDF Editor',
    version: '3.0.0',
    description: 'Privacy-first browser-based PDF editor',
  },

  // Analytics configuration
  analytics: {
    // Google Analytics 4 Measurement ID
    // Replace with your actual ID for production
    // Set to null to disable analytics
    measurementId: null, // Example: 'G-XXXXXXXXXX'

    // Enable analytics in development
    enableInDev: false,

    // Event tracking settings
    trackPageViews: true,
    trackErrors: true,
    trackEngagement: true,
    anonymizeIp: true,
  },

  // Feature flags
  features: {
    darkMode: true,
    toastNotifications: true,
    analytics: false, // Set to true when analytics is configured
    ocr: true,
    multiPDF: true,
    annotations: true,
    undoRedo: true,
  },

  // UI settings
  ui: {
    defaultTheme: 'light',
    toastDuration: 3000,
    loadingMinDuration: 500,
    maxToasts: 5,
  },

  // File processing limits
  limits: {
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    maxPages: 1000,
    maxDocuments: 10,
    warningFileSize: 10 * 1024 * 1024, // 10 MB
  },

  // Export settings
  export: {
    filenamePrefix: 'editedpdf',
    defaultFormat: 'pdf',
    includeTimestamp: true,
    timestampFormat: 'YYYY-MM-DD_HH-mm-ss',
  },

  // External services
  services: {
    pdfWorker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js',
    tesseractWorker: 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/worker.min.js',
  },
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.AppConfig = AppConfig;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}
