/**
 * Performance Monitoring Utility
 * Tracks memory usage, timing metrics, and provides warnings for resource constraints
 * @module performance-monitor
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fileLoadStart: 0,
      fileLoadEnd: 0,
      renderStart: 0,
      renderEnd: 0,
      thumbnailsComplete: 0,
      pagesComplete: 0,
    };

    this.memoryWarningThreshold = 800; // MB
    this.memoryCheckInterval = null;
    this.memoryWarningShown = false;

    // Check if performance.memory is available (Chrome only)
    this.memoryAvailable = !!(performance && performance.memory);
  }

  /**
   * Start tracking a performance milestone
   * @param {string} milestone - Name of the milestone (e.g., 'fileLoadStart')
   */
  start(milestone) {
    this.metrics[milestone] = performance.now();
  }

  /**
   * End tracking a performance milestone
   * @param {string} milestone - Name of the milestone (e.g., 'fileLoadEnd')
   */
  end(milestone) {
    this.metrics[milestone] = performance.now();
  }

  /**
   * Get the duration between two milestones
   * @param {string} startMilestone - Start milestone name
   * @param {string} endMilestone - End milestone name
   * @returns {number} Duration in milliseconds
   */
  getDuration(startMilestone, endMilestone) {
    return this.metrics[endMilestone] - this.metrics[startMilestone];
  }

  /**
   * Get current memory usage
   * @returns {Object} Memory usage in MB or null if not available
   */
  getMemoryUsage() {
    if (!this.memoryAvailable) {
      return null;
    }

    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
      totalJSHeapSize: (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2),
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2),
    };
  }

  /**
   * Check if memory usage is approaching the warning threshold
   * @returns {boolean} True if memory is above threshold
   */
  isMemoryHigh() {
    if (!this.memoryAvailable) return false;

    const usedMB = performance.memory.usedJSHeapSize / (1024 * 1024);
    return usedMB > this.memoryWarningThreshold;
  }

  /**
   * Start continuous memory monitoring
   * @param {number} intervalMs - Check interval in milliseconds (default: 5000)
   * @param {Function} onWarning - Callback when memory is high
   */
  startMemoryMonitoring(intervalMs = 5000, onWarning = null) {
    if (!this.memoryAvailable) {
      console.warn('Performance.memory API not available in this browser');
      return;
    }

    // Clear any existing interval
    this.stopMemoryMonitoring();

    this.memoryCheckInterval = setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      const usedMB = parseFloat(memoryUsage.usedJSHeapSize);

      // Log memory at key thresholds
      if (usedMB > 500 && usedMB % 100 < 20) {
        console.log(`🔍 Memory usage: ${usedMB.toFixed(0)} MB`);
      }

      // Warning if approaching threshold
      if (this.isMemoryHigh() && !this.memoryWarningShown) {
        console.warn(`⚠️ High memory usage: ${usedMB.toFixed(0)} MB (threshold: ${this.memoryWarningThreshold} MB)`);
        this.memoryWarningShown = true;

        if (onWarning) {
          onWarning(memoryUsage);
        }
      }
    }, intervalMs);
  }

  /**
   * Stop continuous memory monitoring
   */
  stopMemoryMonitoring() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
    this.memoryWarningShown = false;
  }

  /**
   * Log comprehensive performance metrics to console
   * @param {number} fileSize - Size of the PDF file in bytes
   * @param {number} numPages - Number of pages in the PDF
   */
  logMetrics(fileSize, numPages) {
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    const loadTime = this.getDuration('fileLoadStart', 'fileLoadEnd').toFixed(0);
    const thumbnailTime = this.getDuration('renderStart', 'thumbnailsComplete').toFixed(0);
    const pageRenderTime = this.getDuration('thumbnailsComplete', 'pagesComplete').toFixed(0);
    const totalRenderTime = this.getDuration('renderStart', 'renderEnd').toFixed(0);

    const memoryUsage = this.getMemoryUsage();
    const memUsage = memoryUsage ? `${memoryUsage.usedJSHeapSize} MB` : 'N/A';

    console.group('📊 Performance Metrics');
    console.log(`File size: ${fileSizeMB} MB`);
    console.log(`Pages: ${numPages}`);
    console.log(`Load time: ${loadTime} ms`);
    console.log(`Thumbnail render: ${thumbnailTime} ms`);
    console.log(`Page render: ${pageRenderTime} ms`);
    console.log(`Total render: ${totalRenderTime} ms`);
    console.log(`JS Heap used: ${memUsage}`);

    if (memoryUsage) {
      console.log(`JS Heap total: ${memoryUsage.totalJSHeapSize} MB`);
      console.log(`JS Heap limit: ${memoryUsage.jsHeapSizeLimit} MB`);
    }

    console.groupEnd();

    return {
      fileSizeMB,
      numPages,
      loadTime,
      thumbnailTime,
      pageRenderTime,
      totalRenderTime,
      memoryUsage: memUsage,
    };
  }

  /**
   * Generate a summary string for status display
   * @param {number} fileSize - Size of the PDF file in bytes
   * @param {number} numPages - Number of pages in the PDF
   * @returns {string} HTML string for status display
   */
  getStatusSummary(fileSize, numPages) {
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    const loadTime = this.getDuration('fileLoadStart', 'fileLoadEnd').toFixed(0);
    const totalRenderTime = this.getDuration('renderStart', 'renderEnd').toFixed(0);

    const memoryUsage = this.getMemoryUsage();
    const memUsage = memoryUsage ? memoryUsage.usedJSHeapSize : 'N/A';

    return `<strong>Performance:</strong> ${numPages} pages (${fileSizeMB} MB) | Load: ${loadTime}ms | Render: ${totalRenderTime}ms | Memory: ${memUsage} MB`;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      fileLoadStart: 0,
      fileLoadEnd: 0,
      renderStart: 0,
      renderEnd: 0,
      thumbnailsComplete: 0,
      pagesComplete: 0,
    };
    this.memoryWarningShown = false;
  }

  /**
   * Detect potential memory leaks by tracking consecutive loads
   * @param {number} threshold - Number of consecutive high memory loads to trigger warning
   * @returns {boolean} True if potential leak detected
   */
  detectMemoryLeak(threshold = 10) {
    if (!this.memoryAvailable) return false;

    // This would need to be called after each PDF load and track history
    // For now, just check if memory is consistently high
    return this.isMemoryHigh();
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();

// Make it available globally for the prototype
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  window.performanceMonitor = performanceMonitor;
}

// Also support module exports for future bundling
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceMonitor, performanceMonitor };
}
