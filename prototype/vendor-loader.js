// vendor-loader.js
// Try to load local vendor scripts under `prototype/vendor/` first.
// If local files are missing, fall back to jsDelivr CDN.
(async function () {
  const baseLocal = 'vendor/'; // relative to prototype/index.html

  // CDN URLs with SRI hashes for security
  const cdn = {
    pdfjs: {
      url: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js',
      integrity: 'sha384-uLiAv4VcjM5H2Jsqzl8EajEaxPugj1CIzQaCjQ8c5//vC+elhxO5pZfXGxoLQi1W',
    },
    pdfWorker: {
      url: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js',
      integrity: 'sha384-cdzss87ZwpiG252tPQexupMwS1W1lTzzgy/UlNUHXW6h8aaJpBizRQk9j8Vj3zw9',
    },
    pdfLib: {
      url: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
      integrity: 'sha384-weMABwrltA6jWR8DDe9Jp5blk+tZQh7ugpCsF3JwSA53WZM9/14PjS5LAJNHNjAI',
    },
  };

  function loadScript(url, integrity = null) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url;
      s.async = false;
      if (integrity) {
        s.integrity = integrity;
        s.crossOrigin = 'anonymous';
      }
      s.onload = () => resolve(url);
      s.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(s);
    });
  }

  // attempt to load local vendor files; if any fail, fall back to CDN for that file
  const assets = { pdfjs: null, pdfWorker: null, pdfLib: null };

  // Try local pdf.js
  try {
    await loadScript(`${baseLocal}pdf.min.js`);
    assets.pdfjs = `${baseLocal}pdf.min.js`;
  } catch (e) {
    console.warn('Local pdf.min.js not found, falling back to CDN with SRI');
    await loadScript(cdn.pdfjs.url, cdn.pdfjs.integrity);
    assets.pdfjs = cdn.pdfjs.url;
  }

  // Try local pdf-lib
  try {
    await loadScript(`${baseLocal}pdf-lib.min.js`);
    assets.pdfLib = `${baseLocal}pdf-lib.min.js`;
  } catch (e) {
    console.warn('Local pdf-lib.min.js not found, falling back to CDN with SRI');
    await loadScript(cdn.pdfLib.url, cdn.pdfLib.integrity);
    assets.pdfLib = cdn.pdfLib.url;
  }

  // Prefer local pdf.worker if present, otherwise use CDN worker that matches the pdfjs build
  // We won't load the worker script into the page; we expose its URL for pdf.js to use.
  try {
    // quick fetch to verify existence
    const resp = await fetch(`${baseLocal}pdf.worker.min.js`, { method: 'HEAD' });
    if (resp.ok) {
      assets.pdfWorker = `${baseLocal}pdf.worker.min.js`;
    } else throw new Error('no local worker');
  } catch (e) {
    console.warn('Local pdf.worker.min.js not found, using CDN worker');
    assets.pdfWorker = cdn.pdfWorker.url;
  }

  // Expose chosen assets for app.js to configure workerSrc etc.
  window.PDF_ASSETS = assets;
  console.info('PDF assets loaded:', assets);
  // Update on-page status banner if present
  try {
    const statusEl = document.getElementById('vendor-status');
    if (statusEl) {
      const parts = [];
      parts.push(`pdf.js: ${assets.pdfjs}`);
      parts.push(`pdf-lib: ${assets.pdfLib}`);
      parts.push(`pdf.worker: ${assets.pdfWorker}`);
      statusEl.textContent = `Loaded vendor assets — ${parts.join(' | ')}`;
      statusEl.style.background = '#eef9f1';
      statusEl.style.borderColor = '#c6efd6';
    }
  } catch (err) {
    console.warn('Failed to update vendor-status element', err);
  }
  // Finally, load the app modules and main script
  try {
    // Load utility modules first
    await loadScript('src/utils/performance-monitor.js');

    // Load core modules
    await loadScript('src/viewer.js');
    await loadScript('src/annotations.js');
    await loadScript('src/export.js');

    // Load main app (can switch between app.js and app-refactored.js)
    const appScript = 'app-refactored.js'; // Use refactored version
    await loadScript(appScript);

    console.info('✅ All application modules loaded successfully');
  } catch (e) {
    console.error('Failed to load application modules:', e);
    alert('Failed to load application. Please refresh the page.');
  }
}());
