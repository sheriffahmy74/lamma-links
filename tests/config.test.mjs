/**
 * Tests for the link config and the card renderer.
 * Run with: npm test
 */

import test from "node:test";
import assert from "node:assert/strict";

import { brand, socialLinks } from "../src/config/site.config.js";
import { renderCard } from "../src/scripts/app.js";

test("all four platforms are present, in order", () => {
  assert.deepEqual(
    socialLinks.map((l) => l.label),
    ["Facebook", "Instagram", "TikTok", "Lamma App"],
  );
});

test("live URLs match the ones supplied by the brand, exactly", () => {
  const byId = Object.fromEntries(socialLinks.map((l) => [l.id, l.url]));

  assert.equal(byId.facebook, "https://www.facebook.com/share/19NCVk6S4W/");
  assert.equal(
    byId.instagram,
    "https://www.instagram.com/lamma_experiences?stkn=OHZlcG80YTF5NjYz",
  );
  assert.equal(
    byId.tiktok,
    "https://www.tiktok.com/@lamma.experiences?_r=1&_t=ZS-99nvRqG1Pvh",
  );
});

test("Lamma App has no invented URL", () => {
  const app = socialLinks.find((l) => l.id === "app");
  assert.equal(app.url, null);
});

test("live cards render as anchors with safe rel attributes", () => {
  for (const link of socialLinks.filter((l) => l.url)) {
    const html = renderCard(link, 0);
    assert.match(html, /^<a /, `${link.label} should be an <a>`);
    assert.ok(html.includes(`href="${link.url}"`), `${link.label} href`);
    assert.ok(html.includes('rel="noopener noreferrer"'), `${link.label} rel`);
    assert.ok(html.includes('target="_blank"'), `${link.label} target`);
  }
});

test("the app card renders without an href and does not break the UI", () => {
  const html = renderCard(
    socialLinks.find((l) => l.id === "app"),
    3,
  );
  assert.doesNotMatch(html, /href=/);
  assert.match(html, /^<div /);
  assert.ok(html.includes('aria-disabled="true"'));
  assert.ok(html.includes("card--soon"));
});

test("every card carries an accessible label", () => {
  for (const [i, link] of socialLinks.entries()) {
    assert.ok(renderCard(link, i).includes("aria-label="), `${link.label} aria-label`);
  }
});

test("the QR target is an absolute https URL to the Lamma page", () => {
  const url = new URL(brand.siteUrl);
  assert.equal(url.protocol, "https:");

  // The QR must never point straight at a social network.
  for (const host of ["instagram.com", "facebook.com", "tiktok.com"]) {
    assert.ok(!url.hostname.endsWith(host), `siteUrl must not be ${host}`);
  }
});

test("SEO strings match the brief", () => {
  assert.equal(brand.title, "لمّة | كل لينكاتنا");
  assert.equal(
    brand.description,
    "تابع لمّة على كل منصاتنا وخليك دايمًا قريب من كل جديد.",
  );
  assert.equal(brand.tagline, "لمّة جديدة، كل مرة");
});
