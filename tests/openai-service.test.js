const test = require("node:test");
const assert = require("node:assert/strict");

const { openaiPrompt } = require("../src/background/openaiPrompt.js");

test("buildMessages should include target language and text list", () => {
  const messages = openaiPrompt.buildMessages({
    sourceLanguage: "auto",
    targetLanguage: "zh-CN",
    texts: ["Hello", "<b>World</b>"],
  });

  assert.equal(messages.length, 2);
  assert.equal(messages[0].role, "system");
  assert.equal(messages[1].role, "user");
  assert.match(messages[1].content, /"targetLanguage":"zh-CN"/);
  assert.match(messages[1].content, /"texts":\["Hello","<b>World<\/b>"\]/);
});

test("buildRequestBody should include model and decoding params", () => {
  const body = openaiPrompt.buildRequestBody({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "x" }],
    temperature: 0.2,
    maxTokens: 1024,
  });

  assert.equal(body.model, "gpt-4o-mini");
  assert.equal(body.temperature, 0.2);
  assert.equal(body.max_tokens, 1024);
  assert.equal(Array.isArray(body.messages), true);
});

test("parseOpenAIResponse should parse plain JSON content", () => {
  const response = {
    choices: [
      {
        message: {
          content:
            '{"detectedLanguage":"en","translations":["你好","<b>世界</b>"]}',
        },
      },
    ],
  };

  const result = openaiPrompt.parseOpenAIResponse(response, 2);
  assert.deepEqual(result.translations, ["你好", "<b>世界</b>"]);
  assert.equal(result.detectedLanguage, "en");
});

test("parseOpenAIResponse should parse fenced JSON content", () => {
  const response = {
    choices: [
      {
        message: {
          content:
            '```json\n{"detectedLanguage":"en","translations":["你好"]}\n```',
        },
      },
    ],
  };

  const result = openaiPrompt.parseOpenAIResponse(response, 1);
  assert.deepEqual(result.translations, ["你好"]);
});

test("requestTranslations should call fetch and return parsed result", async () => {
  let called = false;
  const mockFetch = async (url, options) => {
    called = true;
    assert.equal(url, "https://api.openai.com/v1/chat/completions");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer test-key");
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '{"detectedLanguage":"en","translations":["你好","世界"]}',
            },
          },
        ],
      }),
    };
  };

  const result = await openaiPrompt.requestTranslations({
    apiUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "test-key",
    model: "gpt-4o-mini",
    sourceLanguage: "auto",
    targetLanguage: "zh-CN",
    texts: ["hello", "world"],
    fetchImpl: mockFetch,
  });

  assert.equal(called, true);
  assert.deepEqual(result.translations, ["你好", "世界"]);
  assert.equal(result.detectedLanguage, "en");
});

test("requestTranslations should normalize base API URL before request", async () => {
  const mockFetch = async (url) => {
    assert.equal(url, "https://api.openai.com/v1/chat/completions");
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"detectedLanguage":"en","translations":["ok"]}',
            },
          },
        ],
      }),
    };
  };

  const result = await openaiPrompt.requestTranslations({
    apiUrl: "https://api.openai.com/v1",
    apiKey: "test-key",
    model: "gpt-4o-mini",
    sourceLanguage: "auto",
    targetLanguage: "zh-CN",
    texts: ["hello"],
    fetchImpl: mockFetch,
  });

  assert.deepEqual(result.translations, ["ok"]);
});

test("requestTranslations should throw on HTTP error", async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 401,
    statusText: "Unauthorized",
    text: async () => "unauthorized",
  });

  await assert.rejects(
    () =>
      openaiPrompt.requestTranslations({
        apiUrl: "https://api.openai.com/v1/chat/completions",
        apiKey: "bad-key",
        model: "gpt-4o-mini",
        sourceLanguage: "auto",
        targetLanguage: "zh-CN",
        texts: ["hello"],
        fetchImpl: mockFetch,
      }),
    /OpenAI compatible request failed/
  );
});

test("requestTranslationsWithFallback should return fallback result", async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 429,
    statusText: "Too Many Requests",
    text: async () => "rate limit",
  });

  const result = await openaiPrompt.requestTranslationsWithFallback(
    {
      apiUrl: "https://api.openai.com/v1/chat/completions",
      apiKey: "test-key",
      model: "gpt-4o-mini",
      sourceLanguage: "auto",
      targetLanguage: "zh-CN",
      texts: ["hello"],
      fetchImpl: mockFetch,
    },
    async () => ({
      detectedLanguage: "en",
      translations: ["你好"],
    })
  );

  assert.deepEqual(result, {
    detectedLanguage: "en",
    translations: ["你好"],
  });
});
