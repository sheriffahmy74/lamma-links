/**
 * Verifies the generated QR files actually decode back to the Lamma page.
 *
 * Generating a QR is easy; generating one that *scans* is the thing that
 * matters, so this decodes the real PNG pixels rather than trusting the
 * encoder. Run `npm run qr` first (npm run check does this for you).
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import jsQR from "jsqr";
import { PNG } from "pngjs";

import { brand } from "../src/config/site.config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const qrDir = path.join(root, "qr");
const expected = brand.siteUrl.replace(/\/$/, "");

const pngPath = path.join(qrDir, "lamma-social.png");
const svgPath = path.join(qrDir, "lamma-social.svg");

const generated = existsSync(pngPath) && existsSync(svgPath);
const opts = { skip: generated ? false : "run `npm run qr` first" };

test("the PNG decodes to the Lamma page URL", opts, async () => {
  const png = PNG.sync.read(await readFile(pngPath));
  const result = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);

  assert.ok(result, "PNG should be decodable as a QR code");
  assert.equal(result.data, expected);
});

test("the PNG is print resolution", opts, async () => {
  const png = PNG.sync.read(await readFile(pngPath));
  assert.ok(png.width >= 1024, `expected >=1024px, got ${png.width}`);
  assert.equal(png.width, png.height, "QR must be square");
});

test("the SVG is a valid, self-contained vector QR", opts, async () => {
  const svg = await readFile(svgPath, "utf8");
  assert.match(svg, /<svg[^>]+viewBox=/);
  assert.ok(!/<image\b/.test(svg), "SVG must be true vector, not a wrapped raster");
  assert.ok(svg.includes("</svg>"), "SVG must be well-formed");
});

test(
  "the QR points at the Lamma page, never straight at a social network",
  opts,
  async () => {
    const png = PNG.sync.read(await readFile(pngPath));
    const { data } = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);

    const host = new URL(data).hostname;
    for (const social of ["instagram.com", "facebook.com", "tiktok.com"]) {
      assert.ok(!host.endsWith(social), `QR must not resolve to ${social}`);
    }
  },
);
