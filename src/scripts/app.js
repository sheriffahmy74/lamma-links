/**
 * Renders the social link cards from the central config.
 *
 * The markup is also pre-rendered into index.html at build time
 * (see scripts/build.mjs) so the page is fully readable with JS
 * disabled. This script re-renders it on load to keep the runtime
 * and the build output driven by the exact same source of truth.
 */

import { socialLinks } from "../config/site.config.js";
import { iconFor, chevron } from "./icons.js";

/** Builds one card. Returns an <a> when a URL exists, otherwise a <div>. */
export function renderCard(link, index) {
  const live = Boolean(link.url);
  const tag = live ? "a" : "div";

  const attrs = live
    ? `href="${link.url}" target="_blank" rel="noopener noreferrer"`
    : `aria-disabled="true"`;

  const badge = live ? chevron() : `<span class="card__badge">قريبًا</span>`;

  return `
<${tag} class="card card--${link.id}${live ? "" : " card--soon"}"
   ${attrs}
   data-platform="${link.id}"
   style="--i:${index}"
   aria-label="${link.label}${live ? "" : " — قريبًا"}">
  <span class="card__icon">${iconFor(link.id)}</span>
  <span class="card__text">
    <span class="card__label">${link.label}</span>
    <span class="card__handle">${link.handle}</span>
  </span>
  ${badge}
</${tag}>`.trim();
}

/** Renders every card into the given container element. */
export function renderLinks(container, links = socialLinks) {
  if (!container) return;
  container.innerHTML = links.map(renderCard).join("\n");
}

// Auto-run in the browser (skipped when imported by the Node build script).
if (typeof document !== "undefined") {
  const mount = () => renderLinks(document.getElementById("links"));
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
}
