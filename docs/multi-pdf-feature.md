# Multi-PDF Editor Feature

## Overview
The Multi-PDF Editor allows users to upload multiple PDF files, preview all pages, and perform various operations before merging them into a single PDF document.

## Features

### 📤 Upload Multiple PDFs
- **Drag & Drop**: Drop multiple PDF files onto the upload zone
- **File Browser**: Click to browse and select multiple PDFs
- **File Size Limit**: Up to 50 MB per file
- **Batch Upload**: Add multiple files at once

### 📄 Page Preview
- **Visual Grid**: All pages displayed in a responsive grid layout
- **Live Preview**: Real-time thumbnail rendering using PDF.js
- **Source Tracking**: Each page shows which document it came from
- **Page Numbering**: Sequential numbering across all documents

### 🔄 Page Operations

#### Reorder
- Drag and drop pages to rearrange them
- Pages can be moved between documents
- Visual feedback during drag operations
- Live preview of the new order

#### Rotate
- Rotate individual pages by 90° clockwise
- Multiple rotations supported (90°, 180°, 270°)
- Rotation preserved in final export
- Visual preview of rotated pages

#### Delete
- Remove unwanted pages from final document
- Click the × button on any page
- Deleted pages are removed from export
- Does not affect original source files

### 📚 Document Management
- **Document List**: Sidebar shows all loaded PDFs
- **Page Count**: Display pages per document
- **Remove Documents**: Remove entire documents and their pages
- **Clear All**: Remove all documents at once

### 💾 Export & Merge
- **Single PDF Output**: Merge all pages into one document
- **Preserve Changes**: All rotations applied
- **Exclude Deletions**: Deleted pages not included
- **Custom Naming**: Specify output filename
- **Metadata**: Adds creation info to merged PDF

## Usage Instructions

### Getting Started
1. Navigate to the Multi-PDF Editor at `prototype/multi-pdf.html`
2. Upload PDF files using drag-and-drop or file browser
3. Wait for page previews to render

### Organizing Pages
1. **To Reorder**: Click and drag a page to a new position
2. **To Rotate**: Click the rotate button (↻) on a page
3. **To Delete**: Click the delete button (×) on a page

### Managing Documents
1. View the document list in the left sidebar
2. See page count for each document
3. Remove entire documents using the × button
4. Click "Clear All" to start over

### Exporting
1. Arrange pages in desired order
2. Apply any rotations needed
3. Delete unwanted pages
4. Click "Export Merged PDF"
5. Save the merged document to your computer

## Architecture

### Files
```
prototype/
├── multi-pdf.html              # Main HTML page
├── multi-pdf-app.js            # Application initialization
├── multi-pdf-styles.css        # Styling for multi-PDF UI
└── src/
    ├── multi-pdf-manager.js    # Core PDF management logic
    └── multi-pdf-ui.js         # UI components and rendering
```

### Components

#### MultiPDFManager
Handles the core PDF operations:
- Document loading and storage
- Page order management
- Rotation tracking
- PDF merging with pdf-lib

#### MultiPDFUI
Manages the user interface:
- File upload handling
- Document list rendering
- Page grid with previews
- Event handling for all operations

### Technology Stack
- **PDF.js**: Page rendering and preview generation
- **pdf-lib**: PDF manipulation and merging
- **Vanilla JavaScript**: No framework dependencies
- **CSS Grid**: Responsive page layout
- **Drag & Drop API**: Page reordering

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Touch-friendly interface

## Performance Notes
- **Large Files**: Files over 10 MB may take time to render
- **Many Pages**: Preview generation is sequential
- **Memory Usage**: Keep total pages under 500 for best performance
- **Rendering**: Uses requestAnimationFrame for smooth updates

## Security & Privacy
- **Client-Side Only**: All processing happens in the browser
- **No Uploads**: Files never leave your device
- **No Storage**: No data saved to disk without explicit user action
- **Memory Cleanup**: Resources freed after export

## Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and roles
- **Focus Management**: Clear visual focus indicators
- **Color Contrast**: WCAG 2.1 AA compliant

## Known Limitations
1. **File Size**: Individual files limited to 50 MB
2. **Page Count**: Best performance with <500 total pages
3. **Rotation**: Only 90° increments supported
4. **Undo**: No undo/redo for multi-PDF operations (planned)
5. **Annotations**: Annotations not preserved from source PDFs

## Future Enhancements
- [ ] Undo/redo support for all operations
- [ ] Page range selection
- [ ] Bulk rotation (rotate all pages)
- [ ] Custom page insertion (blank pages)
- [ ] Split documents by page range
- [ ] Preview zoom controls
- [ ] Annotation preservation
- [ ] Custom metadata editing
- [ ] Bookmark preservation
- [ ] Form field handling

## Testing
To test the Multi-PDF Editor:

```bash
# Start development server
cd prototype
python -m http.server 5173

# Open in browser
# Navigate to http://localhost:5173/multi-pdf.html
```

### Test Scenarios
1. **Basic Merge**: Upload 2-3 small PDFs, merge them
2. **Reordering**: Move pages between documents
3. **Rotation**: Rotate various pages, verify in export
4. **Deletion**: Delete pages, confirm they're excluded
5. **Large Files**: Test with 10+ MB files
6. **Many Pages**: Test with 100+ total pages
7. **Mobile**: Test on mobile devices

## Troubleshooting

### Pages Not Rendering
- Check browser console for errors
- Ensure PDF files are valid
- Try smaller files first
- Clear browser cache

### Slow Performance
- Reduce number of files
- Use smaller PDFs
- Close other browser tabs
- Check available RAM

### Export Failed
- Check browser console
- Verify all pages loaded
- Try exporting fewer pages
- Ensure enough disk space

## API Reference

### MultiPDFManager

```javascript
const manager = new MultiPDFManager();

// Add document
await manager.addDocument(arrayBuffer, 'filename.pdf');

// Rotate page
manager.rotatePage(docId, pageIndex, 90);

// Delete page
manager.deletePage(docId, pageIndex);

// Reorder pages
manager.reorderPages(fromIndex, toIndex);

// Merge to PDF
const pdfBytes = await manager.mergeToPDF();
```

### MultiPDFUI

```javascript
const ui = new MultiPDFUI(manager, {
  documentList: element,
  pageGrid: element
});

// Add files
await ui.addFiles([file1, file2]);

// Export merged PDF
await ui.exportMergedPDF();

// Clear all
ui.clearAll();
```

## Contributing
When contributing to the Multi-PDF feature:
1. Maintain client-side only architecture
2. Add appropriate error handling
3. Update this documentation
4. Test with various PDF types
5. Ensure accessibility standards

## License
MIT License - Same as main project
