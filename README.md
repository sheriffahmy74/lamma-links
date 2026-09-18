# لمّة — Social Links + QR

صفحة الروابط الرسمية لبراند **لمّة**، تُفتح عن طريق QR Code.

**Live:** https://sheriffahmy74.github.io/lamma-links

---

## Stack

HTML + CSS + vanilla JS (ES modules). لا توجد framework ولا backend ولا
database. الـdependencies كلها **dev-only** — الصفحة نفسها تُشحن بصفر
JavaScript dependencies.

|         |                                                     |
| ------- | --------------------------------------------------- |
| Build   | Node script صغير (`scripts/build.mjs`) — لا bundler |
| Hosting | GitHub Pages (static)                               |
| Deploy  | تلقائي عند كل push على `main`                       |

## Structure

```
.
├── src/
│   ├── index.html              # القالب (placeholders تُملأ وقت البناء)
│   ├── config/
│   │   └── site.config.js      # ★ الروابط والنصوص — المصدر الوحيد للحقيقة
│   ├── scripts/
│   │   ├── app.js              # يرسم الكروت من الـconfig
│   │   └── icons.js            # أيقونات SVG inline (بدون مكتبة)
│   └── styles/
│       └── main.css
├── public/
│   └── assets/logo/            # ★ اللوجو هنا
├── scripts/
│   ├── build.mjs               # src + public -> dist
│   └── make-qr.mjs             # ينشئ ملفات الـQR
├── qr/                         # ★ ملفات الـQR الجاهزة للطباعة
├── tests/
└── dist/                       # ناتج البناء (غير متتبع في git)
```

## Commands

```bash
npm install      # مرة واحدة

npm run dev      # بناء + تشغيل محلي على http://localhost:5173
npm run build    # production build -> dist/
npm run qr       # إعادة توليد ملفات الـQR
npm test         # الاختبارات (تشمل فك تشفير الـQR فعليًا)
npm run lint
npm run format
npm run check    # format + lint + test + build
```

## تغيير الروابط

كل الروابط في مكان واحد: [`src/config/site.config.js`](src/config/site.config.js)

```js
export const socialLinks = [
  { id: "facebook", label: "Facebook", url: "https://..." },
  { id: "instagram", label: "Instagram", url: "https://..." },
  { id: "tiktok", label: "TikTok", url: "https://..." },
  { id: "app", label: "Lamma App", url: null }, // TODO
];
```

عدّل الرابط، ثم `npm run build`. لا حاجة لتعديل أي ملف آخر.

> **Lamma App:** `url: null` حاليًا، فيظهر الكارت كـ"قريبًا" غير قابل
> للضغط. بمجرد وضع رابط حقيقي مكان `null` يتحول تلقائيًا إلى رابط شغال.

## تغيير اللوجو

ضع الملف في `public/assets/logo/` باسم `lamma-logo.svg` أو `lamma-logo.png`
ثم `npm run build`. البناء يلتقطه تلقائيًا ويستخدمه كـlogo وfavicon.
التفاصيل في [`public/assets/logo/README.md`](public/assets/logo/README.md).

## QR

| ملف                   | الاستخدام                     |
| --------------------- | ----------------------------- |
| `qr/lamma-social.svg` | طباعة / large format (vector) |
| `qr/lamma-social.png` | 2048×2048 — ستيكرز، بوسترات   |

الـQR يشفّر **رابط صفحة لمّة فقط** — لا يشير مباشرة إلى أي منصة تواصل.
هذه هي فكرة _dynamic by destination_: الكود المطبوع ثابت للأبد، بينما
الروابط داخل الصفحة يمكن تغييرها في أي وقت بدون إعادة طباعة.

لو تغيّر `siteUrl`، شغّل `npm run qr`.

## Deployment

أي push على `main` يشغّل [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
الذي يعمل lint + test + build ثم ينشر `dist/` على GitHub Pages.
