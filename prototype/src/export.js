/**
 * PDF Export Module
 * Handles PDF export with page reordering and annotations
 * @module export
 */

/**
 * PDF exporter for creating new PDFs with modifications
 */
class PDFExporter {
  /**
   * Create a new PDF exporter
   * @param {ArrayBuffer} originalPdfBytes - Original PDF data
   */
  constructor(originalPdfBytes) {
    this.originalPdfBytes = originalPdfBytes;
    this.metadata = null;
  }

  /**
   * Set PDF metadata
   * @param {Object} metadata - Metadata object with title, author, creator, producer
   */
  setMetadata(metadata) {
    this.metadata = metadata;
  }

  /**
   * Export a PDF with reordered pages and annotations
   * @param {Array<number>} pageOrder - Array of 1-based page numbers in desired order
   * @param {AnnotationManager} annotationManager - Annotation manager instance
   * @param {string} filename - Output filename (default: 'reordered-annotated.pdf')
   * @returns {Promise<Blob>} The exported PDF as a blob
   * @throws {Error} If export fails
   */
  async export(pageOrder, annotationManager, filename = 'reordered-annotated.pdf') {
    try {
      // Load original PDF
      const srcDoc = await PDFLib.PDFDocument.load(this.originalPdfBytes);
      const newDoc = await PDFLib.PDFDocument.create();

      // Copy pages in the specified order
      for (let i = 0; i < pageOrder.length; i++) {
        const pageIndex = pageOrder[i] - 1; // Convert to 0-based
        const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIndex]);
        newDoc.addPage(copiedPage);
      }

      // Set metadata if provided
      if (this.metadata) {
        if (this.metadata.title) newDoc.setTitle(this.metadata.title);
        if (this.metadata.author) newDoc.setAuthor(this.metadata.author);
        if (this.metadata.creator) newDoc.setCreator(this.metadata.creator);
        if (this.metadata.producer) newDoc.setProducer(this.metadata.producer);
        newDoc.setCreationDate(new Date());
        newDoc.setModificationDate(new Date());
      }

      // Flatten annotations onto the new document
      if (annotationManager && annotationManager.getAll().length > 0) {
        await annotationManager.flattenToPDF(newDoc, pageOrder);
      }

      // Save and create blob
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      return blob;
    } catch (error) {
      console.error('Failed to export PDF:', error);
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Download a PDF blob as a file
   * @param {Blob} blob - PDF blob to download
   * @param {string} filename - Filename for download
   */
  static downloadBlob(blob, filename) {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Export and download a PDF
   * @param {Array<number>} pageOrder - Page order
   * @param {AnnotationManager} annotationManager - Annotation manager
   * @param {string} filename - Output filename
   * @returns {Promise<void>}
   */
  async exportAndDownload(pageOrder, annotationManager, filename = 'reordered-annotated.pdf') {
    try {
      const blob = await this.export(pageOrder, annotationManager, filename);
      PDFExporter.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Failed to export and download PDF:', error);
      throw error;
    }
  }
}

/**
 * Generate a sample PDF using pdf-lib
 * @param {number} numPages - Number of pages to generate
 * @returns {Promise<Uint8Array>} PDF bytes
 */
async function generateSamplePDF(numPages = 3) {
  try {
    const doc = await PDFLib.PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      const page = doc.addPage([600, 800]);
      page.drawText(`Sample page ${i}`, {
        x: 50,
        y: 750,
        size: 24,
      });
    }

    const bytes = await doc.save();
    return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  } catch (error) {
    console.error('Failed to generate sample PDF:', error);
    throw new Error(`Sample PDF generation failed: ${error.message}`);
  }
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.PDFExporter = PDFExporter;
  window.generateSamplePDF = generateSamplePDF;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PDFExporter, generateSamplePDF };
}
