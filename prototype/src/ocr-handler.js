/**
 * OCR Handler Module
 * Handles OCR processing for PDF pages using Tesseract.js
 */

/* eslint-disable no-undef */
class OCRHandler {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.isInitializing = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    if (this.isInitializing) {
      // Wait for existing initialization
      while (this.isInitializing) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => { setTimeout(resolve, 100); });
      }
      return;
    }

    this.isInitializing = true;

    try {
      if (typeof Tesseract === 'undefined') {
        throw new Error('Tesseract.js library is not loaded');
      }

      console.log('Initializing OCR worker with CDN resources...');

      // Simplified worker creation without custom paths
      this.worker = await Tesseract.createWorker('eng', 1, {
        cacheMethod: 'none',
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            console.log(`OCR: Loading Tesseract core... ${Math.round(m.progress * 100)}%`);
          } else if (m.status === 'initializing tesseract') {
            console.log(`OCR: Initializing... ${Math.round(m.progress * 100)}%`);
          } else if (m.status === 'loading language traineddata') {
            console.log(`OCR: Loading language data... ${Math.round(m.progress * 100)}%`);
          } else if (m.status === 'initializing api') {
            console.log(`OCR: Initializing API... ${Math.round(m.progress * 100)}%`);
          } else if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      this.isInitialized = true;
      console.log('✅ OCR Worker ready');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);

      // Provide helpful error message
      let errorMsg = 'OCR initialization failed';
      if (error.message && error.message.includes('NetworkError')) {
        errorMsg = 'Network error: Could not download OCR language data. Please check your internet connection.';
      } else if (error.message && error.message.includes('fetch')) {
        errorMsg = 'Failed to download OCR resources. Please check your internet connection and firewall settings.';
      } else if (error.message) {
        errorMsg = error.message;
      }

      throw new Error(errorMsg);
    } finally {
      this.isInitializing = false;
    }
  }

  async processCanvas(canvas) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!canvas || !canvas.getContext) {
        throw new Error('Invalid canvas element');
      }

      const result = await this.worker.recognize(canvas);
      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        words: result.data.words,
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
        console.log('OCR Worker terminated');
      } catch (error) {
        console.warn('Error terminating OCR worker:', error);
      }
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.OCRHandler = OCRHandler;
}
