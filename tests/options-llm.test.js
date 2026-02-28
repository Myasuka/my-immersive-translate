const test = require("node:test");
const assert = require("node:assert/strict");

const twpLlmConfig = require("../src/options/llmConfig.js");

test("provider presets should return expected URLs", () => {
  assert.equal(
    twpLlmConfig.getProviderPreset("openai"),
    "https://api.openai.com/v1/chat/completions"
  );
  assert.equal(
    twpLlmConfig.getProviderPreset("deepseek"),
    "https://api.deepseek.com/chat/completions"
  );
  assert.equal(
    twpLlmConfig.getProviderPreset("moonshot"),
    "https://api.moonshot.cn/v1/chat/completions"
  );
  assert.equal(twpLlmConfig.getProviderPreset("custom"), "");
});

test("isValidApiUrl should validate http/https URLs", () => {
  assert.equal(
    twpLlmConfig.isValidApiUrl("https://api.openai.com/v1/chat/completions"),
    true
  );
  assert.equal(twpLlmConfig.isValidApiUrl("http://localhost:3000/v1/chat/completions"), true);
  assert.equal(twpLlmConfig.isValidApiUrl("ftp://example.com"), false);
  assert.equal(twpLlmConfig.isValidApiUrl("not-a-url"), false);
});
