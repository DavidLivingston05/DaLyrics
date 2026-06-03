import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_URL = 'https://raw.githubusercontent.com/openscriptures/morphhb/refs/heads/master/Source%20XML/KJV.xml';
const OUTPUT_DIR = join(__dirname, '..', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'bible.xml');

async function main() {
  const url = process.argv[2] || DEFAULT_URL;

  console.log(`Downloading Bible XML from:\n  ${url}\n`);
  console.log('Note: For Tamil Bibles, use a URL like:\n' +
    '  https://raw.githubusercontent.com/.../tamil.xml\n');

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  const text = await resp.text();

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, text, 'utf-8');
  console.log(`Saved ${(text.length / 1024 / 1024).toFixed(1)}MB to ${OUTPUT_FILE}`);
}

main().catch(err => { console.error('Failed:', err.message); process.exit(1); });
