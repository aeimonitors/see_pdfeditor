Acceptance tests & criteria — MVP

This document lists the acceptance criteria and a small set of test cases to validate the MVP flows.

Core acceptance criteria (MVP)

- Open & render: The app opens a local PDF and displays pages with correct ordering and readable text.
- Thumbnail navigation: Thumbnails for all pages are visible; clicking a thumbnail navigates to that page.
- Reorder pages: The user can reorder pages via drag-and-drop thumbnails; the UI updates immediately.
- Export: After reordering, the user can export/download a new PDF where pages are in the new order.
- No server leakage: At no point should the original PDF bytes be transmitted to any remote server in clear form (prototype is fully client-side).

Sample acceptance tests

1) Open large PDF
   - Given: a 100-page PDF with embedded fonts
   - When: user opens file
   - Then: thumbnails are generated within 10s on a typical dev machine; first viewable page renders within 3s

2) Reorder and export
   - Given: a 5-page PDF
   - When: user drags page 5 to position 1 and clicks Export
   - Then: downloaded PDF opens in Acrobat/Preview with pages in the new order (5,1,2,3,4)

3) No outbound network
   - Given: the prototype is running locally
   - When: user opens a PDF and exports
   - Then: browser network panel shows no outbound requests containing the PDF bytes

Edge/negative tests

- Open a password-protected PDF should show a clear error message that the file is unsupported (or prompt for password if engine supports it).
- Very large PDFs (>=200MB) should trigger a warning about potential memory pressure.
