/**
 * SRI Hash Generator
 * Generates Subresource Integrity (SRI) hashes for vendor CDN assets
 *
 * Usage: node generate-sri.js
 * Output: vendor-sri.json with hashes for all vendor assets
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Vendor assets to generate SRI hashes for
const assets = [
  {
    name: 'pdf.js',
    url: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.min.js',
  },
  {
    name: 'pdf-lib',
    url: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  },
  {
    name: 'pdf.worker.js',
    url: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js',
  },
];

/**
 * Generate SHA-384 SRI hash from buffer
 */
function generateSRI(buffer) {
  const hash = crypto.createHash('sha384').update(buffer).digest('base64');
  return `sha384-${hash}`;
}

/**
 * Fetch asset from URL and generate SRI hash
 */
function fetchAndHash(asset) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching ${asset.name} from ${asset.url}...`);

    https.get(asset.url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${asset.url}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const sri = generateSRI(buffer);
        const sizeKB = (buffer.length / 1024).toFixed(2);

        console.log(`✓ ${asset.name}: ${sri} (${sizeKB} KB)`);

        resolve({
          name: asset.name,
          url: asset.url,
          integrity: sri,
          size: `${sizeKB} KB`,
          algorithm: 'sha384',
        });
      });
    }).on('error', reject);
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🔐 Generating SRI hashes for vendor assets...\n');

  try {
    const results = await Promise.all(assets.map(fetchAndHash));

    console.log('\n✅ All SRI hashes generated successfully!\n');

    // Save to JSON file
    const outputPath = path.join(__dirname, 'vendor-sri.json');
    const output = {
      generated: new Date().toISOString(),
      note: 'Subresource Integrity hashes for vendor CDN assets',
      assets: results,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`📄 Results saved to: ${outputPath}\n`);

    // Print JavaScript code snippet
    console.log('📋 Copy this to vendor-loader.js:\n');
    console.log('const vendorAssets = {');
    results.forEach((asset, index) => {
      const key = asset.name.replace('.js', '').replace('.', '_');
      console.log(`  '${key}': {`);
      console.log(`    cdn: '${asset.url}',`);
      console.log(`    integrity: '${asset.integrity}',`);
      console.log('    crossOrigin: \'anonymous\'');
      console.log(`  }${index < results.length - 1 ? ',' : ''}`);
    });
    console.log('};\n');
  } catch (err) {
    console.error('❌ Error generating SRI hashes:', err.message);
    process.exit(1);
  }
}

main();
