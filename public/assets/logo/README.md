# ضع شعار لمّة هنا / Drop the Lamma logo here

**خطوة واحدة فقط:**

1. ضع ملف الشعار في هذا الفولدر باسم `lamma-logo.svg` أو `lamma-logo.png`.
2. شغّل: `npm run build`

خلاص. الصفحة هتستخدمه تلقائيًا كـlogo وكـfavicon.

---

## Details

The build script scans this folder and picks up any file named
`lamma-logo.*` automatically. Supported extensions, in order of preference:

| Priority | Extension                             |
| -------- | ------------------------------------- |
| 1        | `.svg` (best — sharp at every size)   |
| 2        | `.png` (use a transparent background) |
| 3        | `.webp`                               |
| 4        | `.jpg` / `.jpeg`                      |

The chosen file is used for **both** the on-page logo and the favicon /
Apple touch icon. Nothing is resized, recolored, or modified.

`lamma-logo.svg` currently in this folder is a **temporary placeholder**
(it says "PLACEHOLDER" on it). Replacing it removes the placeholder.

### Recommended specs

- Square-ish artwork, at least 512 × 512 px if raster.
- Transparent background (the page has a dark background).
- SVG preferred.

### Overriding the path

If your file must live elsewhere or have a different name, set an explicit
path in [`src/config/site.config.js`](../../../src/config/site.config.js):

```js
logo: "assets/logo/my-custom-name.png",
```
