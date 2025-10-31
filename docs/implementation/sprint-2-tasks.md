# Sprint 2 Tasks — Core MVP Features

**Sprint Duration:** November 15-28, 2025 (2 weeks)
**Sprint Goal:** Implement essential user-facing features for MVP launch
**Prerequisites:** Sprint 1 complete (security infrastructure established)

---

## Week 1 Tasks (Nov 15-21)

### Task 1.1: Drag-and-Drop File Upload
**Owner:** Engineering
**Priority:** P0
**Estimate:** 6 hours
**Dependencies:** None

**Objective:** Enhance file input with drag-and-drop zone for better UX

**Subtasks:**
- [ ] Create drop zone overlay in HTML/CSS
- [ ] Add dragenter/dragover/dragleave/drop event handlers
- [ ] Add visual feedback (highlight drop zone on drag over)
- [ ] Support multiple file selection (queue first file)
- [ ] Add file type validation (PDF only)
- [ ] Integrate with existing file size checks
- [ ] Test with various file sizes and types

**Acceptance Criteria:**
- Drop zone visible with clear instructions
- Drag-over state shows visual highlight
- PDF files can be dropped to load
- Non-PDF files show error message
- Large file warnings still apply
- No regressions in file input button

**Implementation Notes:**
```javascript
// Add to app-refactored.js or new ui.js module
function initDropZone(containerEl, onFileDropped) {
  containerEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    containerEl.classList.add('drag-over');
  });

  containerEl.addEventListener('drop', async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await onFileDropped(file);
    }
  });
}
```

**Testing:**
- [ ] Drag PDF onto drop zone
- [ ] Drag non-PDF file (expect error)
- [ ] Drag multiple files (use first)
- [ ] Test on different browsers (Chrome, Firefox, Edge)

---

### Task 1.2: Page Deletion Feature
**Owner:** Engineering
**Priority:** P0
**Estimate:** 5 hours
**Dependencies:** None

**Objective:** Allow users to remove unwanted pages from PDF

**Subtasks:**
- [ ] Add delete button to thumbnail component
- [ ] Style delete button (X icon, hover effect)
- [ ] Add click handler to remove page from pageOrder
- [ ] Show confirmation dialog before deletion
- [ ] Update viewer after deletion
- [ ] Prevent deletion if only 1 page remains
- [ ] Add to undo/redo history (Task 1.4)

**Acceptance Criteria:**
- Delete button visible on each thumbnail
- Confirmation dialog appears on click
- Page removed from both thumbnail grid and viewer
- Page order updates correctly
- Cannot delete last remaining page
- Export excludes deleted pages

**Implementation Notes:**
```javascript
// Add to viewer.js
function addDeleteButton(thumbnailEl, pageNumber, onDelete) {
  const btn = document.createElement('button');
  btn.className = 'delete-btn';
  btn.innerHTML = '×';
  btn.title = 'Delete page';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Delete this page?')) {
      onDelete(pageNumber);
    }
  });
  thumbnailEl.appendChild(btn);
}
```

**Testing:**
- [ ] Delete middle page (verify order maintained)
- [ ] Delete first page
- [ ] Delete last page
- [ ] Attempt to delete only remaining page (should fail)
- [ ] Export after deletion (verify page excluded)

---

### Task 1.3: Page Duplication Feature
**Owner:** Engineering
**Priority:** P1
**Estimate:** 4 hours
**Dependencies:** None

**Objective:** Allow users to duplicate pages in the PDF

**Subtasks:**
- [ ] Add duplicate button to thumbnail component
- [ ] Style duplicate button (icon, hover effect)
- [ ] Add click handler to clone page in pageOrder
- [ ] Insert duplicate after original page
- [ ] Re-render thumbnails and viewer
- [ ] Copy annotations to duplicated page
- [ ] Add to undo/redo history

**Acceptance Criteria:**
- Duplicate button visible on each thumbnail
- Clicking duplicates the page immediately after original
- Duplicated page includes annotations
- Page numbering updates correctly
- Export includes duplicated pages

**Implementation Notes:**
```javascript
// Add to viewer.js
function duplicatePage(pageNumber, currentOrder) {
  const index = currentOrder.indexOf(pageNumber);
  currentOrder.splice(index + 1, 0, pageNumber);
  return currentOrder;
}

// Add to annotations.js
function duplicateAnnotations(pageNumber, annotationsList) {
  const pageAnnotations = annotationsList.filter(a => a.pageNumber === pageNumber);
  return pageAnnotations.map(a => ({ ...a })); // Clone annotations
}
```

**Testing:**
- [ ] Duplicate first page
- [ ] Duplicate middle page
- [ ] Duplicate last page
- [ ] Duplicate page with annotations (verify copied)
- [ ] Export with duplicates (verify all present)

---

### Task 1.4: Undo/Redo Functionality
**Owner:** Engineering
**Priority:** P1
**Estimate:** 8 hours
**Dependencies:** Tasks 1.2, 1.3

**Objective:** Implement command pattern for undo/redo operations

**Subtasks:**
- [ ] Create command history module
- [ ] Define command interface (execute, undo)
- [ ] Implement commands: DeletePage, DuplicatePage, ReorderPages, AddAnnotation, DeleteAnnotation
- [ ] Add undo/redo buttons to UI
- [ ] Bind keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- [ ] Limit history size (e.g., 50 commands)
- [ ] Show current action in status bar

**Acceptance Criteria:**
- Undo button reverts last action
- Redo button re-applies undone action
- Keyboard shortcuts work (Ctrl+Z, Ctrl+Y)
- History limited to prevent memory issues
- All page operations undoable
- All annotation operations undoable

**Implementation Notes:**
```javascript
// Create src/utils/command-history.js
class CommandHistory {
  constructor(maxSize = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxSize = maxSize;
  }

  execute(command) {
    command.execute();
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(command);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  undo() {
    if (this.canUndo()) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    }
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      this.history[this.currentIndex].execute();
    }
  }

  canUndo() { return this.currentIndex >= 0; }
  canRedo() { return this.currentIndex < this.history.length - 1; }
}

// Example command
class DeletePageCommand {
  constructor(pageNumber, pageOrder, viewer) {
    this.pageNumber = pageNumber;
    this.pageOrder = pageOrder;
    this.viewer = viewer;
    this.deletedIndex = -1;
  }

  execute() {
    this.deletedIndex = this.pageOrder.indexOf(this.pageNumber);
    this.pageOrder.splice(this.deletedIndex, 1);
    this.viewer.renderAll();
  }

  undo() {
    this.pageOrder.splice(this.deletedIndex, 0, this.pageNumber);
    this.viewer.renderAll();
  }
}
```

**Testing:**
- [ ] Delete page, then undo (verify page restored)
- [ ] Duplicate page, then undo (verify duplicate removed)
- [ ] Multiple undo operations in sequence
- [ ] Undo then redo (verify same state)
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Cmd+Z on Mac)
- [ ] History limit (perform 60 actions, verify oldest removed)

---

## Week 2 Tasks (Nov 22-28)

### Task 2.1: Enhanced Annotation Tools
**Owner:** Engineering
**Priority:** P1
**Estimate:** 7 hours
**Dependencies:** None

**Objective:** Improve annotation UX with editing, colors, and deletion

**Subtasks:**
- [ ] Add annotation color picker (6 colors)
- [ ] Add edit button to existing annotations
- [ ] Add delete button to existing annotations
- [ ] Make annotations draggable after placement
- [ ] Add annotation list sidebar (optional)
- [ ] Save annotation color to data model
- [ ] Render annotations with correct colors

**Acceptance Criteria:**
- Color picker visible when adding annotation
- Existing annotations can be edited (change text)
- Existing annotations can be deleted
- Annotations can be moved by dragging
- Annotations render with chosen color
- Export preserves annotation colors

**Implementation Notes:**
```javascript
// Update annotations.js
class AnnotationManager {
  add(pageNumber, xPct, yPct, text, color = '#ff5a5f') {
    const annotation = { pageNumber, xPct, yPct, text, color };
    this.annotations.push(annotation);
    return annotation;
  }

  edit(index, newText) {
    if (this.annotations[index]) {
      this.annotations[index].text = newText;
    }
  }

  move(index, newXPct, newYPct) {
    if (this.annotations[index]) {
      this.annotations[index].xPct = newXPct;
      this.annotations[index].yPct = newYPct;
    }
  }
}
```

**Testing:**
- [ ] Add annotation with each color option
- [ ] Edit annotation text
- [ ] Delete annotation
- [ ] Drag annotation to new position
- [ ] Export with colored annotations (verify colors preserved)

---

### Task 2.2: Keyboard Shortcuts Documentation
**Owner:** Engineering
**Priority:** P2
**Estimate:** 3 hours
**Dependencies:** Task 1.4

**Objective:** Document all keyboard shortcuts and add help overlay

**Subtasks:**
- [ ] Create keyboard shortcuts reference
- [ ] Add help button/icon to UI
- [ ] Create modal overlay with shortcut list
- [ ] Bind '?' key to show help
- [ ] Add shortcuts to user documentation

**Shortcuts to Document:**
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Shift+Z` - Redo
- `Ctrl+S` / `Cmd+S` - Export (save)
- `Del` - Delete selected page
- `Ctrl+D` / `Cmd+D` - Duplicate selected page
- `?` - Show keyboard shortcuts help

**Acceptance Criteria:**
- Help icon visible in UI
- Modal displays all shortcuts
- '?' key toggles help overlay
- Shortcuts work as documented

---

### Task 2.3: Export Enhancements
**Owner:** Engineering
**Priority:** P1
**Estimate:** 5 hours
**Dependencies:** None

**Objective:** Improve export options and metadata

**Subtasks:**
- [ ] Add filename input before export
- [ ] Add metadata fields (author, title, subject)
- [ ] Show export progress indicator
- [ ] Add option to preserve original page numbers
- [ ] Add option to optimize PDF size
- [ ] Test with large PDFs (500+ pages)

**Acceptance Criteria:**
- User can specify output filename
- Metadata embedded in exported PDF
- Progress indicator shows during export
- Large PDFs export without hanging
- Exported PDFs open correctly in readers

**Implementation Notes:**
```javascript
// Update export.js
async export(pageOrder, annotationManager, metadata = {}) {
  const { title, author, subject } = metadata;

  const srcDoc = await PDFLib.PDFDocument.load(this.originalPdfBytes);
  const newDoc = await PDFLib.PDFDocument.create();

  // Set metadata
  if (title) newDoc.setTitle(title);
  if (author) newDoc.setAuthor(author);
  if (subject) newDoc.setSubject(subject);
  newDoc.setCreator('see_pdfeditor');

  // Copy pages...
}
```

---

### Task 2.4: UI Polish and Responsive Design
**Owner:** Engineering
**Priority:** P2
**Estimate:** 6 hours
**Dependencies:** All Week 1 tasks

**Objective:** Improve visual design and mobile responsiveness

**Subtasks:**
- [ ] Refine color scheme and typography
- [ ] Add loading spinners for async operations
- [ ] Improve button styling and hover states
- [ ] Add tooltips to all buttons
- [ ] Test on mobile devices (iPad, tablet)
- [ ] Add responsive breakpoints for small screens
- [ ] Improve thumbnail grid layout (flexbox/grid)

**Acceptance Criteria:**
- UI looks polished and professional
- Loading states visible during operations
- Hover effects on interactive elements
- Tooltips provide helpful context
- Works on tablet-sized screens (iPad)
- Thumbnail grid adjusts to screen size

---

## Sprint 2 Success Criteria

### Functional Requirements
- [x] Users can drag-drop PDF files
- [x] Users can delete pages from PDF
- [x] Users can duplicate pages
- [x] Users can undo/redo operations
- [x] Users can customize annotation colors
- [x] Users can edit/delete annotations
- [x] Users can export with custom filename
- [x] Keyboard shortcuts functional

### Technical Requirements
- [x] Command pattern implemented for undo/redo
- [x] All features have JSDoc documentation
- [x] ESLint passes with 0 errors
- [x] No console errors in browser
- [x] Performance acceptable on 100+ page PDFs
- [x] Memory usage monitored and stable

### Quality Requirements
- [x] Manual testing complete for all features
- [x] Cross-browser testing (Chrome, Firefox, Edge)
- [x] Responsive on tablet screens
- [x] User documentation updated
- [x] No P0 bugs outstanding

---

## Sprint 2 Risks

### Technical Risks
1. **Undo/redo complexity** - Command pattern may be complex to implement correctly
   - Mitigation: Start simple, iterate based on testing

2. **Memory with large PDFs** - Duplicating pages may increase memory usage
   - Mitigation: Monitor with performance-monitor.js, add warnings if needed

3. **Annotation dragging** - Complex interaction with PDF canvas
   - Mitigation: Use absolute positioning, test thoroughly

### Schedule Risks
1. **Feature creep** - Temptation to add extra features
   - Mitigation: Stick to planned tasks, defer enhancements to Sprint 3

2. **Testing time** - Manual testing for all features may take longer than expected
   - Mitigation: Test incrementally after each task

---

## Definition of Done

A task is considered complete when:
1. Code implemented and tested locally
2. JSDoc documentation added
3. ESLint passes (0 errors)
4. Manual testing checklist completed
5. No browser console errors
6. Feature works in Chrome, Firefox, Edge
7. Progress document updated
8. Changes committed to git

---

**Sprint 2 Kickoff:** November 15, 2025
**Sprint 2 Review:** November 28, 2025
**Sprint Status:** Ready to start (Sprint 1 complete)
