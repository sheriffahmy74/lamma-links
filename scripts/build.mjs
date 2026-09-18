/**
 * Build script — src/ -> dist/
 *
 * 1. Copies static assets and scripts.
 * 2. Pre-renders the social cards into index.html from the central config,
 *    so the page works fully with JavaScript disabled.
 * 3. Substitutes the SEO / Open Graph placeholders.
 *
 * No bundler needed: everything ships as plain ES modules.
 */

import { readFile, writeFile, mkdir, cp, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { brand, socialLinks } from "../src/config/site.config.js";
import { renderCard } from "../src/scripts/app.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const publicDir = path.join(root, "public");
const dist = path.join(root, "dist");

/** Escapes text destined for an HTML attribute. */
const attr = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/**
 * Finds the logo to use.
 *
 * An explicit `brand.logo` wins. Otherwise the first `lamma-logo.*` file in
 * public/assets/logo/ is used, preferring vector, then lossless raster — so
 * dropping the official file into that folder is all that is required.
 */
async function resolveLogo() {
  if (brand.logo) return brand.logo;

  const logoDir = path.join(publicDir, "assets", "logo");
  if (!existsSync(logoDir)) return brand.logoFallback;

  const preference = [".svg", ".png", ".webp", ".jpg", ".jpeg"];
  const files = (await readdir(logoDir)).filter(
    (f) =>
      preference.includes(path.extname(f).toLowerCase()) &&
      // never the archived source artwork
      !/\.original\.[a-z]+$/i.test(f),
  );

  if (files.length === 0) return brand.logoFallback;

  // Prefer a file actually named lamma-logo.*, then fall back to any image.
  const named = files.filter((f) => /^lamma-logo\./i.test(f));
  const pool = named.length ? named : files;

  pool.sort(
    (a, b) =>
      preference.indexOf(path.extname(a).toLowerCase()) -
      preference.indexOf(path.extname(b).toLowerCase()),
  );

  return `assets/logo/${pool[0]}`;
}

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  // 1. Static assets (logo, etc.) + source scripts and styles.
  // The untouched `*.original.*` artwork is kept in the repo for reference
  // but never shipped — it is several times the size of what the page uses.
  if (existsSync(publicDir)) {
    await cp(publicDir, dist, {
      recursive: true,
      filter: (source) => !/\.original\.[a-z]+$/i.test(source),
    });
  }
  await cp(path.join(src, "styles"), path.join(dist, "styles"), { recursive: true });
  await cp(path.join(src, "scripts"), path.join(dist, "scripts"), { recursive: true });
  await cp(path.join(src, "config"), path.join(dist, "config"), { recursive: true });

  // 2. Pre-render the cards.
  const links = socialLinks.map(renderCard).join("\n        ");

  // 3. Fill the template.
  const siteUrl = brand.siteUrl.replace(/\/$/, "");
  const logo = await resolveLogo();

  const mime =
    {
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    }[path.extname(logo).toLowerCase()] || "image/png";

  let html = await readFile(path.join(src, "index.html"), "utf8");

  html = html
    .replaceAll("__TITLE__", attr(brand.title))
    .replaceAll("__DESCRIPTION__", attr(brand.description))
    .replaceAll("__SITE_URL__", attr(siteUrl))
    .replaceAll("__LOGO__", attr(logo))
    .replaceAll("__LOGO_MIME__", mime)
    .replaceAll("__BRAND_NAME__", brand.nameAr)
    .replaceAll("__TAGLINE__", brand.tagline)
    .replace("__LINKS__", links);

  await writeFile(path.join(dist, "index.html"), html, "utf8");

  // Hosting niceties.
  // .nojekyll stops GitHub Pages from running Jekyll, which would otherwise
  // strip files and folders beginning with an underscore.
  await writeFile(path.join(dist, ".nojekyll"), "", "utf8");
  await writeFile(
    path.join(dist, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
    "utf8",
  );
  await writeFile(
    path.join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`,
    "utf8",
  );

  const live = socialLinks.filter((l) => l.url).length;
  console.log(
    `✓ Built dist/ — ${socialLinks.length} links (${live} live), site: ${siteUrl}`,
  );
  console.log(`  logo: ${logo}${logo === brand.logoFallback ? "  (PLACEHOLDER)" : ""}`);
}

build().catch((err) => {
  console.error("✗ Build failed:", err);
  process.exit(1);
});
