const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const distChrome = path.join(root, "dist", "chrome");

test("chrome build should generate required MV3 artifacts", () => {
  execSync("npm run chrome", { cwd: root, stdio: "pipe" });

  const manifestPath = path.join(distChrome, "manifest.json");
  const backgroundEntryPath = path.join(
    distChrome,
    "background",
    "background-entry.js"
  );

  assert.ok(existsSync(manifestPath), "dist/chrome/manifest.json should exist");
  assert.ok(
    existsSync(backgroundEntryPath),
    "dist/chrome/background/background-entry.js should exist"
  );

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background?.service_worker, "background/background-entry.js");
});
