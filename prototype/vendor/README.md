Place vendor JS files here to serve them locally and avoid CDN/network issues.

Required filenames (place these under `prototype/vendor/`):
- pdf.min.js           (pdf.js build)
- pdf.worker.min.js    (pdf.js worker build)
- pdf-lib.min.js       (PDFLib distribution)

You can download recommended versions from jsDelivr URLs and save them with the names above:

- https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js
- https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js
- https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js

After adding these files, reload `prototype/index.html` and the loader will pick the local copies instead of the CDN.
