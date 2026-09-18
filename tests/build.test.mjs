/**
 * Guards the build output: the things that would silently break the page
 * or bloat it for someone on mobile data after scanning the QR.
 *
 * Requires `npm run build` to have run.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { brand, socialLinks } from "../src/config/site.config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");

const built = existsSync(indexPath);
const opts = { skip: built ? false : "run `npm run build` first" };

const html = () => readFile(indexPath, "utf8");

test("no unreplaced template placeholders remain", opts, async () => {
  const out = await html();
  const leftovers = out.match(/__[A-Z_]+__/g);
  assert.equal(leftovers, null, `unreplaced: ${leftovers?.join(", ")}`);
});

test("every live social URL is present in the built page", opts, async () => {
  const out = await html();
  for (const link of socialLinks.filter((l) => l.url)) {
    assert.ok(out.includes(link.url), `${link.label} URL missing from dist`);
  }
});

test("the built page carries the SEO and Open Graph metadata", opts, async () => {
  const out = await html();
  for (const needle of [
    `<title>${brand.title}</title>`,
    'property="og:title"',
    'property="og:image"',
    'property="og:url"',
    'name="twitter:card"',
    'rel="canonical"',
    'rel="icon"',
  ]) {
    assert.ok(out.includes(needle), `missing: ${needle}`);
  }
});

test("the referenced logo is actually shipped", opts, async () => {
  const out = await html();
  const src = out.match(/class="hero__logo"[\s\S]*?src="([^"]+)"/)?.[1];
  assert.ok(src, "logo <img> not found");

  const file = path.join(dist, src);
  assert.ok(existsSync(file), `logo file missing from dist: ${src}`);
  assert.ok((await stat(file)).size > 0, "logo file is empty");
});

test("the logo stays small enough for mobile data", opts, async () => {
  const out = await html();
  const src = out.match(/class="hero__logo"[\s\S]*?src="([^"]+)"/)[1];
  const { size } = await stat(path.join(dist, src));

  // 300KB ceiling: this loads right after a QR scan, often on cellular.
  assert.ok(size < 300 * 1024, `logo is ${(size / 1024).toFixed(0)}KB, expected <300KB`);
});

test("the archived original artwork is not shipped", opts, async () => {
  const logoDir = path.join(dist, "assets", "logo");
  const shipped = existsSync(logoDir) ? await readdir(logoDir) : [];
  assert.ok(
    !shipped.some((f) => /\.original\./i.test(f)),
    `original artwork leaked into dist: ${shipped.join(", ")}`,
  );
});

test("hosting files are emitted", opts, async () => {
  for (const f of ["robots.txt", "sitemap.xml", ".nojekyll"]) {
    assert.ok(existsSync(path.join(dist, f)), `missing ${f}`);
  }
});

test("the page is readable without JavaScript", opts, async () => {
  const out = await html();
  // Cards must be pre-rendered, not left to the client-side script.
  const anchors = out.match(/<a class="card/g) ?? [];
  assert.equal(anchors.length, socialLinks.filter((l) => l.url).length);
});
