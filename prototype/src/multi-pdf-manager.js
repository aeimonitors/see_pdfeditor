/**
 * Multi-PDF Manager Module
 * Handles multiple PDF documents with merge, delete, rearrange, and rotate features
 * @module multi-pdf-manager
 */

class MultiPDFManager {
  /**
   * Create a new multi-PDF manager instance
   */
  constructor() {
    this.documents = []; // Array of {id, name, pdfDoc, bytes, pages: [{pageNum, rotation, deleted}]}
    this.nextDocId = 1;
    this.globalPageOrder = []; // Array of {docId, pageIndex, rotation}
  }

  /**
   * Add a PDF document to the collection
   * @param {ArrayBuffer} pdfBytes - PDF file data
   * @param {string} filename - Original filename
   * @returns {Promise<Object>} Document metadata
   */
  async addDocument(pdfBytes, filename) {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      const pdfDoc = await loadingTask.promise;

      const docId = this.nextDocId++;
      const pages = [];

      for (let i = 0; i < pdfDoc.numPages; i++) {
        pages.push({
          pageNum: i + 1,
          rotation: 0,
          deleted: false,
        });

        // Add to global page order
        this.globalPageOrder.push({
          docId,
          pageIndex: i,
          rotation: 0,
        });
      }

      const doc = {
        id: docId,
        name: filename,
        pdfDoc,
        bytes: pdfBytes,
        pages,
      };

      this.documents.push(doc);

      return {
        id: docId,
        name: filename,
        pageCount: pdfDoc.numPages,
      };
    } catch (error) {
      console.error('Failed to add document:', error);
      throw new Error(`Failed to add PDF: ${error.message}`);
    }
  }

  /**
   * Remove a document from the collection
   * @param {number} docId - Document ID
   */
  removeDocument(docId) {
    const docIndex = this.documents.findIndex((d) => d.id === docId);
    if (docIndex === -1) return;

    // Remove all pages of this document from global order
    this.globalPageOrder = this.globalPageOrder.filter((p) => p.docId !== docId);

    this.documents.splice(docIndex, 1);
  }

  /**
   * Get all documents
   * @returns {Array} Document list
   */
  getDocuments() {
    return this.documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      pageCount: doc.pages.filter((p) => !p.deleted).length,
      totalPages: doc.pages.length,
    }));
  }

  /**
   * Rotate a page by 90 degrees
   * @param {number} docId - Document ID
   * @param {number} pageIndex - Page index (0-based)
   * @param {number} degrees - Rotation angle (90, 180, 270, or -90)
   */
  rotatePage(docId, pageIndex, degrees = 90) {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc || !doc.pages[pageIndex]) return;

    const currentRotation = doc.pages[pageIndex].rotation;
    const newRotation = (currentRotation + degrees) % 360;
    doc.pages[pageIndex].rotation = newRotation < 0 ? newRotation + 360 : newRotation;

    // Update global page order
    const globalPage = this.globalPageOrder.find(
      (p) => p.docId === docId && p.pageIndex === pageIndex,
    );
    if (globalPage) {
      globalPage.rotation = doc.pages[pageIndex].rotation;
    }
  }

  /**
   * Mark a page as deleted
   * @param {number} docId - Document ID
   * @param {number} pageIndex - Page index (0-based)
   */
  deletePage(docId, pageIndex) {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc || !doc.pages[pageIndex]) return;

    doc.pages[pageIndex].deleted = true;

    // Remove from global page order
    const globalIndex = this.globalPageOrder.findIndex(
      (p) => p.docId === docId && p.pageIndex === pageIndex,
    );
    if (globalIndex !== -1) {
      this.globalPageOrder.splice(globalIndex, 1);
    }
  }

  /**
   * Reorder pages in the global order
   * @param {number} fromIndex - Source index in global order
   * @param {number} toIndex - Target index in global order
   */
  reorderPages(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    const [movedPage] = this.globalPageOrder.splice(fromIndex, 1);
    this.globalPageOrder.splice(toIndex, 0, movedPage);
  }

  /**
   * Get the global page order with document info
   * @returns {Array} Array of page descriptors
   */
  getGlobalPageOrder() {
    return this.globalPageOrder.map((p) => {
      const doc = this.documents.find((d) => d.id === p.docId);
      return {
        docId: p.docId,
        docName: doc ? doc.name : 'Unknown',
        pageIndex: p.pageIndex,
        pageNum: p.pageIndex + 1,
        rotation: p.rotation,
        pdfDoc: doc ? doc.pdfDoc : null,
      };
    });
  }

  /**
   * Merge all documents into a single PDF
   * @returns {Promise<Uint8Array>} Merged PDF bytes
   */
  async mergeToPDF() {
    try {
      const mergedDoc = await PDFLib.PDFDocument.create();

      for (const pageDesc of this.globalPageOrder) {
        const doc = this.documents.find((d) => d.id === pageDesc.docId);
        if (!doc) continue;

        const srcDoc = await PDFLib.PDFDocument.load(doc.bytes);
        const [copiedPage] = await mergedDoc.copyPages(srcDoc, [pageDesc.pageIndex]);

        // Apply rotation
        if (pageDesc.rotation !== 0) {
          copiedPage.setRotation(PDFLib.degrees(pageDesc.rotation));
        }

        mergedDoc.addPage(copiedPage);
      }

      // Set metadata
      mergedDoc.setTitle('Merged PDF');
      mergedDoc.setCreator('see_pdfeditor');
      mergedDoc.setProducer('see_pdfeditor Multi-PDF Manager');
      mergedDoc.setCreationDate(new Date());

      const pdfBytes = await mergedDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('Failed to merge PDFs:', error);
      throw new Error(`PDF merge failed: ${error.message}`);
    }
  }

  /**
   * Get total page count across all documents
   * @returns {number} Total pages
   */
  getTotalPageCount() {
    return this.globalPageOrder.length;
  }

  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
    this.globalPageOrder = [];
    this.nextDocId = 1;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiPDFManager;
}
