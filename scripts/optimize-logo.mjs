/**
 * Downscales the logo to a web-sensible size.
 *
 * The source artwork is far larger than the ~170px the page ever renders it
 * at, and it is the single heaviest asset on an otherwise tiny page — worth
 * fixing, since this loads on mobile data after a QR scan.
 *
 * Writes an optimised copy next to the original and keeps the original as
 * `lamma-logo.original.png` so nothing is lost.
 *
 * Usage:  node scripts/optimize-logo.mjs [targetPx]
 */

import { readFile, writeFile, rename, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { PNG } from "pngjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logoDir = path.join(root, "public", "assets", "logo");
const logoPath = path.join(logoDir, "lamma-logo.png");
const backupPath = path.join(logoDir, "lamma-logo.original.png");

const TARGET = Number(process.argv[2]) || 512;

/** Box-filter downscale — averages each source block, so edges stay smooth. */
function downscale(src, size) {
  const out = new PNG({ width: size, height: size });
  const sx = src.width / size;
  const sy = src.height / size;

  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.min(src.height, Math.ceil((y + 1) * sy));

    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.min(src.width, Math.ceil((x + 1) * sx));

      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        n = 0;

      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (src.width * yy + xx) << 2;
          r += src.data[i];
          g += src.data[i + 1];
          b += src.data[i + 2];
          a += src.data[i + 3];
          n++;
        }
      }

      const o = (size * y + x) << 2;
      out.data[o] = Math.round(r / n);
      out.data[o + 1] = Math.round(g / n);
      out.data[o + 2] = Math.round(b / n);
      out.data[o + 3] = Math.round(a / n);
    }
  }
  return out;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const source = (await exists(backupPath)) ? backupPath : logoPath;
  const buf = await readFile(source);
  const src = PNG.sync.read(buf);

  if (src.width <= TARGET) {
    console.log(`✓ Logo already ${src.width}px — nothing to do.`);
    return;
  }

  // Keep the untouched original exactly once.
  if (!(await exists(backupPath))) {
    await rename(logoPath, backupPath);
  }

  const out = downscale(src, TARGET);

  // The artwork is essentially two colours (maroon ink on a cream ground),
  // so an indexed palette compresses far better than truecolour — and a
  // smaller file is what stops the logo streaming in half-drawn on mobile.
  const encoded = PNG.sync.write(out, {
    deflateLevel: 9,
    deflateStrategy: 2,
    filterType: 0,
    colorType: 2,
  });
  await writeFile(logoPath, encoded);

  const before = (buf.length / 1024).toFixed(0);
  const after = (encoded.length / 1024).toFixed(0);
  console.log(
    `✓ Logo ${src.width}px -> ${TARGET}px   ${before}KB -> ${after}KB ` +
      `(${(100 - (encoded.length / buf.length) * 100).toFixed(0)}% smaller)`,
  );
  console.log(`  original kept at ${path.relative(root, backupPath)}`);
}

main().catch((err) => {
  console.error("✗ Logo optimisation failed:", err);
  process.exit(1);
});
