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

/**
 * Runs the welcome overlay.
 *
 * Shown once per visit, then dismissed automatically — or immediately by
 * tapping, pressing a key, or the button. It is `hidden` in the markup and
 * only switched on here, so a visitor without JavaScript never gets stuck
 * behind a screen that nothing can close.
 */
export function initWelcome(el, { autoHideMs = 4200 } = {}) {
  if (!el) return;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // With reduced motion the greeting is a flourish that costs the visitor
  // time, so skip straight to the links.
  if (reduced) {
    el.remove();
    return;
  }

  el.hidden = false;
  document.body.classList.add("is-welcoming");

  let done = false;
  const dismiss = () => {
    if (done) return;
    done = true;

    clearTimeout(timer);
    el.classList.add("welcome--out");
    document.body.classList.remove("is-welcoming");

    el.addEventListener("transitionend", () => el.remove(), { once: true });
    // Fallback in case the transition never fires (background tab, etc.).
    setTimeout(() => el.remove(), 900);

    window.removeEventListener("keydown", dismiss);
  };

  const timer = setTimeout(dismiss, autoHideMs);

  el.addEventListener("click", dismiss);
  window.addEventListener("keydown", dismiss);

  // Kick off the entrance on the next frame so the transition actually runs.
  requestAnimationFrame(() => el.classList.add("welcome--in"));
}

// Auto-run in the browser (skipped when imported by the Node build script).
if (typeof document !== "undefined") {
  const mount = () => {
    renderLinks(document.getElementById("links"));
    initWelcome(document.getElementById("welcome"));
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
}
