# See PDF Editor v2.0 - Quick Reference

## 🚀 Quick Start

```bash
npm run dev
# Visit http://localhost:5173
```

## ✨ Key Features

### Multi-PDF Editing (Default)
- 📚 Upload multiple PDFs simultaneously
- 🔄 Drag pages to reorder across documents
- ↻ Rotate pages 90° clockwise
- ❌ Delete unwanted pages
- 💾 Export merged PDF

### OCR (Optical Character Recognition)
- 🔍 Extract text from scanned PDFs
- 💾 Auto-download as .txt file
- 📊 Confidence metrics
- 🚀 Client-side processing

### Single-PDF Mode
- 📝 Annotations with 6 colors
- ↶ Undo/Redo (Ctrl+Z/Y)
- ➕ Duplicate pages
- Access via "📄 Single PDF Editor" link

## 🎯 How to Use OCR

1. **Upload PDFs**: Drag & drop files
2. **Wait for preview**: Pages load as thumbnails
3. **Click OCR button**: "🔍 OCR Pages"
4. **Confirm**: Dialog asks to confirm
5. **Wait**: Status shows progress
6. **Get results**: Text file downloads automatically
7. **Check console**: Full results logged

## 📊 What's New in v2.0

### From v1.0:
- ✅ Multi-PDF is now default (was single-PDF)
- ✅ Added OCR capability
- ✅ Renamed to "See PDF Editor"
- ✅ Faster loading (3-4x improvement)
- ✅ Better error handling
- ✅ Auto-download OCR results

## 🔧 Technical Details

### Libraries Used:
- **pdf.js 2.16.105**: PDF rendering
- **pdf-lib 1.17.1**: PDF manipulation
- **Tesseract.js 5.0.4**: OCR engine

### Loading Strategy:
- **PDF libraries**: Load synchronously (fast, ~1-2s)
- **Tesseract.js**: Load asynchronously (background)
- **OCR initialization**: Lazy (only when used)

### Performance:
- Initial load: ~1-2 seconds
- First OCR: ~3-5 seconds (includes init)
- Subsequent OCR: ~2-3 seconds per page

## 🐛 Troubleshooting

### "OCR failed: Tesseract.js is not loaded"
**Solution:** Refresh the page and wait 2-3 seconds before using OCR

### "No page previews found"
**Solution:** Wait for page thumbnails to load before clicking OCR

### OCR results are poor
**Tips:**
- Use high-quality scanned documents
- Ensure text is clearly visible
- Avoid rotated or skewed images
- Try rescanning at higher DPI (300+)

### Page loads slowly
**Causes:**
- Large PDF files (>50MB)
- Many pages (>100)
- Slow internet (CDN fallback)

**Solutions:**
- Use smaller PDFs
- Split large PDFs
- Download vendor libraries locally

## 📁 File Structure

```
see_pdfeditor/
├── index.html                   # Root redirect
└── prototype/
    ├── index.html              # Multi-PDF Editor (default)
    ├── single-pdf.html         # Single-PDF Mode
    ├── multi-pdf-app.js        # Multi-PDF logic
    ├── multi-pdf-styles.css    # Multi-PDF styles
    ├── vendor-loader.js        # Library loader
    └── src/
        ├── ocr-handler.js      # OCR processing
        ├── multi-pdf-manager.js # Document manager
        ├── multi-pdf-ui.js     # UI controller
        ├── viewer.js           # PDF viewer
        ├── annotations.js      # Annotations (single-PDF)
        └── export.js           # PDF export
```

## 🎨 UI Elements

### Main Page:
- **Header**: Title and mode switcher
- **Drop Zone**: Upload area
- **Status Bar**: Document count
- **OCR Status**: Progress indicator (appears during OCR)
- **Controls**: OCR, Export, Clear, Help buttons
- **Document List**: Sidebar with loaded PDFs
- **Page Grid**: Thumbnail grid with drag/drop

### During OCR:
- Button text: "🔍 1/5..." (shows progress)
- Status bar: "🔍 Processing page 1 of 5..."
- Button disabled: Yes
- Auto-hides: After 3 seconds

## ⌨️ Keyboard Shortcuts

### Multi-PDF Mode:
- `?` - Show help modal
- `Esc` - Close help modal

### Single-PDF Mode:
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `?` - Show help
- `Esc` - Close help

## 🔒 Privacy & Security

### Client-Side Only:
- ✅ All processing in browser
- ✅ No server uploads
- ✅ No data collection
- ✅ No tracking
- ✅ No accounts needed

### Content Security Policy:
- Restricted script sources
- No inline scripts (except vendor loader)
- WebAssembly allowed (for Tesseract)
- Blob URLs allowed (for workers)

## 📦 Dependencies

### Runtime:
- None (all loaded from CDN or local vendor/)

### Development:
```json
{
  "eslint": "^8.50.0",
  "markdown-link-check": "3.10.3"
}
```

## 🌐 Browser Support

### Minimum Requirements:
- ES6+ support
- WebAssembly support (for OCR)
- Canvas API
- File API
- Blob API

### Tested Browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## 📝 Common Use Cases

### Merge Multiple PDFs:
1. Upload all PDFs
2. Arrange pages in desired order
3. Click "Export Merged PDF"

### Extract Text from Scanned PDF:
1. Upload scanned PDF
2. Click "OCR Pages"
3. Text file downloads automatically

### Reorder Pages:
1. Upload PDF(s)
2. Drag thumbnails to new positions
3. Export when satisfied

### Remove Pages:
1. Upload PDF
2. Click × on unwanted pages
3. Export cleaned PDF

### Rotate Pages:
1. Upload PDF
2. Click ↻ on pages to rotate
3. Export corrected PDF

## 🎓 Tips & Tricks

### Faster OCR:
- Process fewer pages at once
- Use high-quality sources
- Close other browser tabs
- Use desktop browser (not mobile)

### Better Results:
- Ensure good contrast
- Avoid handwriting
- Use printed text
- Straight (not skewed) text
- Minimum 300 DPI

### Performance:
- Close unused documents
- Clear all between sessions
- Use local vendor files (not CDN)
- Process in smaller batches

### Organization:
- Name files clearly before upload
- Group related pages together
- Use document list sidebar
- Preview before exporting

## 📞 Support

### Documentation:
- `README.md` - Full documentation
- `UPGRADE-SUMMARY.md` - Version 2.0 changes
- `OCR-FIX-SUMMARY.md` - OCR fixes & performance

### Issues:
- Check browser console for errors
- Ensure browser meets requirements
- Try different PDF files
- Refresh page if issues persist

### Getting Help:
1. Check documentation files
2. Review browser console
3. Test with sample PDF
4. Report issue with details

## 🎉 Enjoy!

See PDF Editor v2.0 is ready to use with:
- ⚡ Fast loading
- 🔍 OCR capability
- 📚 Multi-PDF support
- 🔒 Privacy-first design
- 💯 Free & open source

Happy editing! 🚀
