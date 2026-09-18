/**
 * ============================================================
 *  Lamma — Central Configuration
 * ============================================================
 *  This is the ONLY place you need to edit to change:
 *    - Social media URLs
 *    - Brand text
 *    - The public site URL encoded inside the QR code
 *
 *  Used by:
 *    - src/scripts/app.js   (renders the links on the page)
 *    - scripts/build.mjs    (injects links into the built HTML)
 *    - scripts/make-qr.mjs  (encodes siteUrl into the QR files)
 * ============================================================
 */

export const brand = {
  nameAr: "لمّة",
  tagline: "لمّة جديدة، كل مرة",
  title: "لمّة | كل لينكاتنا",
  description: "تابع لمّة على كل منصاتنا وخليك دايمًا قريب من كل جديد.",

  /**
   * The welcome screen shown once, right after the QR is scanned.
   * Egyptian colloquial Arabic on purpose — it should read like a person
   * greeting you, not like a website.
   */
  welcome: {
    greeting: "أهلًا بيك",
    line: "نوّرت لمّة",
    wish: "أتمنالك يوم حلو زيّك",
    cta: "يلا بينا",
  },

  /**
   * The public URL of THIS page.
   * The QR code points here — never directly at a social network.
   * Change it once after deployment and re-run: npm run qr
   */
  siteUrl: "https://sheriffahmy74.github.io/lamma-links",

  /**
   * Logo path, relative to the site root.
   *
   * You do NOT normally need to edit this: the build script scans
   * public/assets/logo/ and automatically uses any file named
   * `lamma-logo.*` (.svg .png .webp .jpg .jpeg), preferring SVG, then PNG.
   * Just drop the official logo into that folder and run `npm run build`.
   *
   * Set an explicit path here only if you want to override that.
   */
  logo: null,

  /** Used when no logo file is found at all. */
  logoFallback: "assets/logo/lamma-logo.svg",

  /** Brand colors, sampled from the official logo artwork. */
  colors: {
    maroon: "#6B1220",
    cream: "#F8F0E6",
  },
};

/**
 * Social links, rendered top-to-bottom in this exact order.
 *
 *  id       : used for the icon lookup + CSS accent
 *  label    : shown to the user (platform names stay in English on purpose)
 *  url      : the destination. `null` => rendered as "coming soon", not clickable
 *  note     : small caption shown under the label (optional)
 */
export const socialLinks = [
  {
    id: "facebook",
    label: "Facebook",
    handle: "JoinLamma",
    // Canonical page URL. The share link it came from carried `rdid` and
    // `share_url` tracking params; they redirect to this same page, so the
    // clean form is used instead — shorter and stable.
    url: "https://www.facebook.com/JoinLamma",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@lamma_experiences",
    url: "https://www.instagram.com/lamma_experiences?stkn=OHZlcG80YTF5NjYz",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@lamma.experiences",
    url: "https://www.tiktok.com/@lamma.experiences?_r=1&_t=ZS-99nvRqG1Pvh",
  },
  {
    id: "app",
    label: "Lamma App",
    handle: "تطبيق لمّة",
    // TODO: Lamma App link is not available yet.
    // When the app store / web app URL exists, put it here and the card
    // becomes a live link automatically. No other file needs to change.
    url: null,
  },
];

export default { brand, socialLinks };
