# Lamma QR

**Encoded URL:** https://sheriffahmy74.github.io/lamma-links

| File               | Use                                              |
| ------------------ | ------------------------------------------------ |
| `lamma-social.svg` | Print / large format (vector, scales infinitely) |
| `lamma-social.png` | 2048 x 2048 raster — stickers, posters, social   |

- Error correction: **H** (~30% of the code can be damaged and still scan).
- The QR points at the Lamma page only — never at a social network directly.
  Social URLs can therefore change at any time without reprinting anything.

Regenerate after changing `siteUrl` in `src/config/site.config.js`:

```bash
npm run qr
```

**Print tips:** keep it at least 2.5 cm wide, preserve the white quiet
zone around the code, and keep strong dark-on-light contrast.
