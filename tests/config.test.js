const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadConfigContext() {
  const writes = [];
  const listeners = [];

  const chrome = {
    i18n: {
      getAcceptLanguages(callback) {
        callback(["en"]);
      },
    },
    storage: {
      local: {
        get(_keys, callback) {
          callback({});
        },
        set(obj) {
          writes.push(obj);
        },
      },
      onChanged: {
        addListener(fn) {
          listeners.push(fn);
        },
      },
    },
    runtime: {
      getManifest() {
        return { commands: {} };
      },
      reload() {},
    },
  };

  const context = {
    chrome,
    twpLang: {
      fixTLanguageCode(lang) {
        return lang;
      },
    },
    console,
    structuredClone,
    Promise,
    Map,
    Set,
    Date,
  };

  vm.createContext(context);
  const configPath = path.join(__dirname, "..", "src", "lib", "config.js");
  const source = readFileSync(configPath, "utf8")
    .replace(/^export\s*\{[^}]*\};?\s*$/gm, "")
    .replace(/^import\s[^;]+;?\s*$/gm, "");
  vm.runInContext(`${source}\n;globalThis.__twpConfig = twpConfig;`, context);

  return { twpConfig: context.__twpConfig, writes, listeners };
}

test("config should have OpenAI defaults", async () => {
  const { twpConfig } = loadConfigContext();
  await twpConfig.onReady();

  assert.equal(twpConfig.get("pageTranslatorService"), "openai");
  assert.equal(twpConfig.get("textTranslatorService"), "openai");
  assert.equal(
    twpConfig.get("openaiApiUrl"),
    "https://api.openai.com/v1/chat/completions"
  );
  assert.equal(twpConfig.get("openaiModel"), "gpt-4o-mini");
  assert.equal(twpConfig.get("openaiPrompt"), "");
  assert.equal(twpConfig.get("openaiMaxTokens"), 2048);
  assert.equal(twpConfig.get("openaiTemperature"), 0);
});

test("config set should persist OpenAI options to storage", async () => {
  const { twpConfig, writes } = loadConfigContext();
  await twpConfig.onReady();

  twpConfig.set("openaiApiKey", "test-key");
  twpConfig.set("openaiModel", "gpt-4.1-mini");

  assert.equal(writes[writes.length - 2].openaiApiKey, "test-key");
  assert.equal(writes[writes.length - 1].openaiModel, "gpt-4.1-mini");
});
