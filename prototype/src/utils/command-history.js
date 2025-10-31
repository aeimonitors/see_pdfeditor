/**
 * Command Pattern Implementation for Undo/Redo
 *
 * Provides a flexible history management system using the Command pattern.
 * Each operation (delete, duplicate, reorder, annotate) implements the Command interface.
 *
 * @module CommandHistory
 */

/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this *//**
 * Command interface - all commands must implement these methods
 * @interface Command
 */
class Command {
  /**
   * Execute the command
   * @abstract
   * @returns {Promise<void>}
   */
  async execute() {
    throw new Error('Command.execute() must be implemented');
  }

  /**
   * Undo the command
   * @abstract
   * @returns {Promise<void>}
   */
  async undo() {
    throw new Error('Command.undo() must be implemented');
  }

  /**
   * Get command description for UI
   * @abstract
   * @returns {string}
   */
  getDescription() {
    throw new Error('Command.getDescription() must be implemented');
  }
}

/**
 * Command to delete a page
 */
class DeletePageCommand extends Command {
  /**
   * @param {Object} viewer - PDFViewer instance
   * @param {number} pageNumber - Page to delete
   * @param {Object} annotationManager - AnnotationManager instance (optional)
   */
  constructor(viewer, pageNumber, annotationManager = null) {
    super();
    this.viewer = viewer;
    this.pageNumber = pageNumber;
    this.annotationManager = annotationManager;
    this.deletedPageIndex = null;
    this.deletedAnnotations = null;
  }

  async execute() {
    // Store state for undo
    this.deletedPageIndex = this.viewer.pageOrder.indexOf(this.pageNumber);

    // Store annotations for this page
    if (this.annotationManager) {
      this.deletedAnnotations = this.annotationManager.annotations
        .filter((ann) => ann.pageNumber === this.pageNumber)
        .map((ann) => ({ ...ann })); // Deep copy
    }

    // Delete the page
    this.viewer.deletePage(this.pageNumber, true); // Skip confirmation
  }

  async undo() {
    // Restore page at original position
    this.viewer.pageOrder.splice(this.deletedPageIndex, 0, this.pageNumber);

    // Restore annotations
    if (this.deletedAnnotations && this.annotationManager) {
      this.deletedAnnotations.forEach((ann) => {
        this.annotationManager.annotations.push({ ...ann });
      });
    }

    // Re-render
    await this.viewer.renderAllThumbnails();
    this.viewer.renderPage(this.viewer.currentPage);
  }

  getDescription() {
    return `Delete page ${this.pageNumber}`;
  }
}

/**
 * Command to duplicate a page
 */
class DuplicatePageCommand extends Command {
  /**
   * @param {Object} viewer - PDFViewer instance
   * @param {number} pageNumber - Page to duplicate
   */
  constructor(viewer, pageNumber) {
    super();
    this.viewer = viewer;
    this.pageNumber = pageNumber;
    this.insertedIndex = null;
  }

  async execute() {
    const idx = this.viewer.pageOrder.indexOf(this.pageNumber);
    this.insertedIndex = idx + 1;

    // Duplicate the page
    await this.viewer.duplicatePage(this.pageNumber);
  }

  async undo() {
    // Remove the duplicated page
    this.viewer.pageOrder.splice(this.insertedIndex, 1);

    // Remove duplicated annotations
    if (this.viewer.annotationManager) {
      const duplicatedPageNumber = this.viewer.pageOrder[this.insertedIndex - 1];
      this.viewer.annotationManager.annotations = this.viewer.annotationManager.annotations.filter(
        (ann, annIdx) => {
          // Keep annotations that aren't on the duplicate or came after it
          if (ann.pageNumber !== duplicatedPageNumber) return true;
          // This is tricky - we need to identify which annotations were duplicated
          // For now, remove all annotations on pages after the insertion point
          return annIdx < this.insertedIndex;
        },
      );
    }

    // Re-render
    await this.viewer.renderAllThumbnails();
    this.viewer.renderPage(this.viewer.currentPage);
  }

  getDescription() {
    return `Duplicate page ${this.pageNumber}`;
  }
}

/**
 * Command to reorder pages (drag-and-drop)
 */
class ReorderPagesCommand extends Command {
  /**
   * @param {Object} viewer - PDFViewer instance
   * @param {number} fromIndex - Original index
   * @param {number} toIndex - Target index
   */
  constructor(viewer, fromIndex, toIndex) {
    super();
    this.viewer = viewer;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  async execute() {
    // Move page in order
    const [page] = this.viewer.pageOrder.splice(this.fromIndex, 1);
    this.viewer.pageOrder.splice(this.toIndex, 0, page);

    // Re-render
    await this.viewer.renderAllThumbnails();
  }

  async undo() {
    // Move page back
    const [page] = this.viewer.pageOrder.splice(this.toIndex, 1);
    this.viewer.pageOrder.splice(this.fromIndex, 0, page);

    // Re-render
    await this.viewer.renderAllThumbnails();
  }

  getDescription() {
    return `Move page from position ${this.fromIndex + 1} to ${this.toIndex + 1}`;
  }
}

/**
 * Command to add an annotation
 */
class AddAnnotationCommand extends Command {
  /**
   * @param {Object} annotationManager - AnnotationManager instance
   * @param {Object} annotation - Annotation data
   */
  constructor(annotationManager, annotation) {
    super();
    this.annotationManager = annotationManager;
    this.annotation = annotation;
  }

  async execute() {
    // Add annotation
    this.annotationManager.annotations.push({ ...this.annotation });
  }

  async undo() {
    // Remove annotation
    const idx = this.annotationManager.annotations.findIndex(
      (ann) => ann === this.annotation
        || (ann.pageNumber === this.annotation.pageNumber
          && ann.xPct === this.annotation.xPct
          && ann.yPct === this.annotation.yPct
          && ann.text === this.annotation.text),
    );
    if (idx !== -1) {
      this.annotationManager.annotations.splice(idx, 1);
      this.annotationManager.render();
    }
  }

  getDescription() {
    const text = this.annotation.text.substring(0, 20);
    return `Add annotation "${text}${this.annotation.text.length > 20 ? '...' : ''}"`;
  }
}

/**
 * Manages command history for undo/redo functionality
 */
class CommandHistory {
  /**
   * @param {number} maxSize - Maximum number of commands to store
   */
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Execute and add a command to history
   * @param {Command} command - Command to execute
   * @returns {Promise<void>}
   */
  async executeCommand(command) {
    // Execute the command
    await command.execute();

    // Clear any commands after current index (redo history)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add to history
    this.history.push(command);
    this.currentIndex++;

    // Enforce max size
    if (this.history.length > this.maxSize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo the last command
   * @returns {Promise<boolean>} - True if undo successful
   */
  async undo() {
    if (!this.canUndo()) {
      return false;
    }

    const command = this.history[this.currentIndex];
    await command.undo();
    this.currentIndex--;
    return true;
  }

  /**
   * Redo the next command
   * @returns {Promise<boolean>} - True if redo successful
   */
  async redo() {
    if (!this.canRedo()) {
      return false;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    await command.execute();
    return true;
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get description of next undo command
   * @returns {string}
   */
  getUndoDescription() {
    if (!this.canUndo()) return '';
    return this.history[this.currentIndex].getDescription();
  }

  /**
   * Get description of next redo command
   * @returns {string}
   */
  getRedoDescription() {
    if (!this.canRedo()) return '';
    return this.history[this.currentIndex + 1].getDescription();
  }

  /**
   * Clear all history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get current history state for debugging
   * @returns {Object}
   */
  getState() {
    return {
      size: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoDescription: this.getUndoDescription(),
      redoDescription: this.getRedoDescription(),
    };
  }
}

// Export classes
export {
  Command,
  DeletePageCommand,
  DuplicatePageCommand,
  ReorderPagesCommand,
  AddAnnotationCommand,
  CommandHistory,
};
