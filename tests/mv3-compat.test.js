const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

test("chrome manifest should use MV3 service worker", () => {
  const manifestPath = path.join(root, "src", "chrome_manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background?.service_worker, "background/background-entry.js");
  assert.ok(manifest.action, "manifest.action should exist for MV3");
});

test("chrome background source should not use MV2-only action APIs", () => {
  const backgroundPath = path.join(root, "src", "background", "chrome_background.js");
  const source = readFileSync(backgroundPath, "utf8");

  const mv2OnlyTokens = [
    "chrome.browserAction",
    "chrome.pageAction",
    '"browser_action"',
    '"page_action"',
    "'browser_action'",
    "'page_action'",
  ];

  for (const token of mv2OnlyTokens) {
    assert.equal(source.includes(token), false, `found deprecated token: ${token}`);
  }
});
