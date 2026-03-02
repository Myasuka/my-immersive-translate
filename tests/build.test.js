const test = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const distChrome = path.join(root, ".output", "chrome-mv3");

test("chrome build should generate required MV3 artifacts", () => {
  execSync("npm run build", { cwd: root, stdio: "pipe" });

  const manifestPath = path.join(distChrome, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  assert.ok(existsSync(manifestPath), ".output/chrome-mv3/manifest.json should exist");
  assert.equal(manifest.manifest_version, 3);

  const serviceWorker = manifest.background?.service_worker;
  assert.ok(serviceWorker, "manifest.background.service_worker should exist");
  assert.ok(
    existsSync(path.join(distChrome, serviceWorker)),
    `service_worker file ${serviceWorker} should exist`
  );

  assert.equal(manifest.background?.service_worker, "background.js");
});
