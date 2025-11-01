# PDF Editor Prototype — Testing & Benchmarking

This prototype demonstrates the core MVP features: open PDFs, reorder pages, add comment pin annotations, and export with annotations flattened.

## Quick Start

1. **Start the local server:**
   ```powershell
   D:/Projects/see_pdfeditor/.venv/Scripts/python.exe -m http.server 5173
   ```

2. **Open in browser:**
   - Visit: http://localhost:5173
   - (Automatically redirects to `/prototype/`)

3. **Use the prototype:**
   - **Generate Sample:** Click "Generate sample PDF" for a quick 3-page test
   - **Load Test Files:** Click "Browse…" and select `test-150pages.pdf` or `test-500pages.pdf`
   - **Add Annotations:** Click "Add Comment Pin", then click on a page and enter comment text
   - **Export:** Click "Export reordered PDF (with annotations)"

## Files in This Directory

- `index.html` — Main prototype page
- `app.js` — Core application logic with performance instrumentation
- `styles.css` — Styling
- `vendor-loader.js` — Dynamic loader for pdf.js/pdf-lib (tries local vendor/ first, falls back to CDN)
- `vendor/` — Place vendor JS files here for offline/local operation (see vendor/README.md)
- `generate_test_pdf.py` — Python script to generate test PDFs
- `test-150pages.pdf` — 150-page test file (~0.11 MB)
- `test-500pages.pdf` — 500-page test file (~0.66 MB)

## Running Performance Benchmarks

1. **Open the prototype** in Chrome (for `performance.memory` API support)

2. **Open DevTools → Console** to see performance metrics

3. **Load a test file:**
   - Click "Browse…" and select one of the test PDFs
   - Or click "Generate sample PDF"

4. **Check performance output:**
   - Console shows "📊 Performance Metrics" with detailed timing
   - Status banner shows inline summary
   - Record these values in `docs/planning/performance-benchmarks.md`

### Generating Custom Test Files

```powershell
# Generate a PDF with custom page count
python generate_test_pdf.py --pages 200 --output test-200pages.pdf

# Generate without images (smaller file)
python generate_test_pdf.py --pages 100 --no-images --output test-100pages-text.pdf
```

## Testing Annotation Export

1. **Load a PDF** (generate sample or load test file)

2. **Add comment pins:**
   - Click "Add Comment Pin" button
   - Click on different locations on the pages
   - Enter comment text for each pin

3. **Export the PDF:**
   - Click "Export reordered PDF (with annotations)"
   - Save the file (e.g., `reordered-annotated.pdf`)

4. **Verify in external readers:**
   - Open the exported PDF in Adobe Acrobat, Preview, Foxit, or other readers
   - Confirm the comment pins (red circles + text) are visible
   - Document findings in `docs/planning/engine-strategy.md`

## Troubleshooting

### "pdf.js failed to load" alert
- Check that vendor-loader.js successfully loaded the libraries
- Look for the "PDF assets loaded:" message in the console
- If CDN is blocked, place vendor files in `vendor/` directory (see `vendor/README.md`)

### Performance metrics show "N/A" for memory
- Memory metrics require Chrome/Edge with `performance.memory` API
- Try Chrome with `--enable-precise-memory-info` flag for more accurate readings

### Annotations don't appear after export
- This is a known limitation: annotations are flattened as drawings, not native PDF annotation objects
- They should be visible in all readers but won't be editable
- Document this in the annotation fidelity test results

## Next Steps

After testing the prototype:
1. Record benchmark results in `docs/planning/performance-benchmarks.md`
2. Document annotation fidelity findings in `docs/planning/engine-strategy.md`
3. Compare performance against targets and identify optimization opportunities
4. Evaluate whether vendor SDKs are needed or if the hybrid approach is sufficient
