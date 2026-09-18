/**
 * QR generator — writes qr/lamma-social.svg and qr/lamma-social.png
 *
 * The QR encodes ONLY the Lamma page URL (brand.siteUrl), never a social
 * network directly. That is the "dynamic by destination" architecture:
 * the printed code never changes, while the page behind it can be edited
 * at any time from src/config/site.config.js.
 *
 * Error correction is set to 'H' (~30% recoverable), which keeps the code
 * scannable even when printed small, on textured stock, or partially worn.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import QRCode from "qrcode";
import { brand } from "../src/config/site.config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "qr");

const target = brand.siteUrl.replace(/\/$/, "");

/** Shared encoding options — print-safe. */
const options = {
  errorCorrectionLevel: "H",
  margin: 4, // 4-module quiet zone, per the QR spec
  color: {
    dark: "#0E0D0B",
    light: "#FFFFFF",
  },
};

async function main() {
  await mkdir(outDir, { recursive: true });

  // --- SVG: resolution independent, ideal for print / large format ---
  const svg = await QRCode.toString(target, { ...options, type: "svg", width: 1024 });
  await writeFile(path.join(outDir, "lamma-social.svg"), svg, "utf8");

  // --- PNG: 2048px, ~300 DPI at ~17cm — safe for posters and stickers ---
  const png = await QRCode.toBuffer(target, { ...options, type: "png", width: 2048 });
  await writeFile(path.join(outDir, "lamma-social.png"), png);

  // --- A human-readable note next to the files ---
  await writeFile(
    path.join(outDir, "README.md"),
    [
      "# Lamma QR",
      "",
      `**Encoded URL:** ${target}`,
      "",
      "| File | Use |",
      "| --- | --- |",
      "| `lamma-social.svg` | Print / large format (vector, scales infinitely) |",
      "| `lamma-social.png` | 2048 x 2048 raster — stickers, posters, social |",
      "",
      "- Error correction: **H** (~30% of the code can be damaged and still scan).",
      "- The QR points at the Lamma page only — never at a social network directly.",
      "  Social URLs can therefore change at any time without reprinting anything.",
      "",
      "Regenerate after changing `siteUrl` in `src/config/site.config.js`:",
      "",
      "```bash",
      "npm run qr",
      "```",
      "",
      "**Print tips:** keep it at least 2.5 cm wide, preserve the white quiet",
      "zone around the code, and keep strong dark-on-light contrast.",
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`✓ QR written to qr/ — encodes: ${target}`);
}

main().catch((err) => {
  console.error("✗ QR generation failed:", err);
  process.exit(1);
});
