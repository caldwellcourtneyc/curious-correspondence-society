// Inline every assets/*.png|jpg referenced in page.html as a base64 data URI,
// producing a single self-contained giveaway file. Google Fonts stay on the CDN
// (graceful serif fallback when offline). Re-run after editing page.html.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const src = readFileSync(path.join(dir, "index.html"), "utf8");
const assetDir = path.join(dir, "assets");
const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

const cache = {};
for (const f of readdirSync(assetDir)) {
  const ext = path.extname(f).toLowerCase();
  if (!mime[ext]) continue;
  const b64 = readFileSync(path.join(assetDir, f)).toString("base64");
  cache[f] = `data:${mime[ext]};base64,${b64}`;
}

// Replace src="assets/<file>" (filenames may contain spaces) with the data URI.
let out = src.replace(/src="assets\/([^"]+)"/g, (m, name) => {
  const uri = cache[name];
  if (!uri) { console.warn("MISSING asset:", name); return m; }
  return `src="${uri}"`;
});

const outPath = path.join(dir, "curious-correspondence-society-kit.html");
writeFileSync(outPath, out);
const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`wrote ${path.basename(outPath)} — ${kb} KB — ${Object.keys(cache).length} assets inlined`);
