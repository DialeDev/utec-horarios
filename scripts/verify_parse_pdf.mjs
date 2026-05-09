import fs from 'fs/promises';
import path from 'path';

// Import the parsePDF function from the source
// Polyfill minimal DOM types required by pdfjs when running in Node for verification
if (typeof globalThis.DOMMatrix === 'undefined') {
  // Minimal stub - pdfjs only checks existence for some ops in Node path
  globalThis.DOMMatrix = class DOMMatrix {};
}

// pdfjs checks for a global document/window in some branches. Provide minimal stubs.
if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
if (typeof globalThis.document === 'undefined') globalThis.document = { createElement: () => ({ getContext: () => null }) };

// Import parsePDF dynamically after shimming globals so pdfjs sees them during module init
let parsePDF;
async function lazyImport() {
  const mod = await import('../src/utils/pdfParser.js');
  parsePDF = mod.parsePDF;
}

async function main() {
  const pdfPath = path.resolve(process.cwd(), 'hoja_asesorias_example.pdf');
  const data = await fs.readFile(pdfPath);

  // Create a minimal File-like object with arrayBuffer()
  const fileLike = {
    async arrayBuffer() { return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength); },
    type: 'application/pdf',
    name: 'hoja_asesorias_example.pdf'
  };

  try {
    await lazyImport();
    const result = await parsePDF(fileLike);
    console.log('parsePDF OK');
    console.log('courses count:', result.courses.length);
    if (result.warnings && result.warnings.length) {
      console.log('warnings:', result.warnings);
    }
    // Print first course summary
    if (result.courses.length > 0) {
      const c = result.courses[0];
      console.log('first course sample:', { code: c.code, name: c.name, sections: c.sections.length });
    }
    process.exit(0);
  } catch (err) {
    console.error('parsePDF FAILED', err);
    process.exit(2);
  }
}

main();
