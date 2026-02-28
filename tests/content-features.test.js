const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const source = readFileSync(
  path.join(__dirname, "..", "src", "contentScript", "pageTranslator.js"),
  "utf8"
);

test("dual style should support mask and separator modes", () => {
  assert.equal(source.includes('dualStyle==="mask"'), true);
  assert.equal(source.includes('dualStyle==="separator"'), true);
  assert.equal(source.includes("maskxxxxxxxx"), false);
});

test("content script should include progress indicator and floating toggle", () => {
  assert.equal(source.includes("immersive-translate-progress"), true);
  assert.equal(source.includes("immersive-translate-floating-button"), true);
  assert.equal(source.includes("showTranslationProgress("), true);
});
