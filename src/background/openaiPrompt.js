"use strict";

const openaiPrompt = (function () {
  const DEFAULT_SYSTEM_PROMPT =
    "You are a translation engine. Translate each input text to the target language while preserving meaning and any HTML tags. Return only valid JSON in this format: {\"detectedLanguage\":\"<lang>\",\"translations\":[\"...\"]}.";

  function buildMessages({
    sourceLanguage = "auto",
    targetLanguage,
    texts,
    customPrompt = "",
  }) {
    const userPayload = JSON.stringify({
      sourceLanguage,
      targetLanguage,
      texts,
    });

    return [
      {
        role: "system",
        content: customPrompt || DEFAULT_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userPayload,
      },
    ];
  }

  function buildRequestBody({
    model,
    messages,
    temperature = 0,
    maxTokens = 2048,
  }) {
    return {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };
  }

  function stripCodeFence(content) {
    const trimmed = String(content || "").trim();
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return fenceMatch ? fenceMatch[1] : trimmed;
  }

  function parseContentToJson(content) {
    const stripped = stripCodeFence(content);
    try {
      return JSON.parse(stripped);
    } catch (e) {
      const first = stripped.indexOf("{");
      const last = stripped.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        return JSON.parse(stripped.slice(first, last + 1));
      }
      throw e;
    }
  }

  function normalizeTranslations(result, expectedLength) {
    let translations = [];
    if (Array.isArray(result.translations)) {
      translations = result.translations.map((item) => String(item));
    } else if (typeof result.translation === "string") {
      translations = [result.translation];
    }

    if (translations.length !== expectedLength) {
      throw new Error(
        `Unexpected translations length: ${translations.length}, expected: ${expectedLength}`
      );
    }
    return translations;
  }

  function parseOpenAIResponse(response, expectedLength) {
    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Missing OpenAI compatible response content");
    }

    const parsed = parseContentToJson(content);
    const translations = normalizeTranslations(parsed, expectedLength);
    return {
      detectedLanguage: parsed.detectedLanguage || "und",
      translations,
    };
  }

  function normalizeApiUrl(value) {
    const raw = String(value || "").trim();
    const url = new URL(raw);
    let pathname = url.pathname.replace(/\/+$/, "");
    const host = url.host.toLowerCase();

    if (!pathname || pathname === "") {
      if (host.includes("api.deepseek.com")) {
        pathname = "/chat/completions";
      } else {
        pathname = "/v1/chat/completions";
      }
    } else if (pathname === "/v1") {
      pathname = "/v1/chat/completions";
    } else if (!pathname.endsWith("/chat/completions")) {
      pathname = `${pathname}/chat/completions`;
    }

    url.pathname = pathname;
    return url.toString();
  }

  function appendDebugLog(entry) {
    try {
      if (typeof globalThis.__appendImmersiveDebugLog === "function") {
        globalThis.__appendImmersiveDebugLog(entry);
        return;
      }
      if (!globalThis.__IMMERSIVE_TRANSLATE_DEBUG__) {
        globalThis.__IMMERSIVE_TRANSLATE_DEBUG__ = { logs: [] };
      }
      const logs = globalThis.__IMMERSIVE_TRANSLATE_DEBUG__.logs;
      logs.push({
        time: Date.now(),
        ...entry,
      });
      while (logs.length > 400) logs.shift();
    } catch (e) {}
  }

  async function requestTranslations({
    apiUrl,
    apiKey,
    model,
    sourceLanguage = "auto",
    targetLanguage,
    texts,
    customPrompt = "",
    temperature = 0,
    maxTokens = 2048,
    fetchImpl = fetch,
  }) {
    if (!apiKey) throw new Error("OpenAI compatible API key is required");
    if (!targetLanguage) throw new Error("Target language is required");
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("Texts must be a non-empty array");
    }

    const messages = buildMessages({
      sourceLanguage,
      targetLanguage,
      texts,
      customPrompt,
    });
    const body = buildRequestBody({
      model,
      messages,
      temperature,
      maxTokens,
    });

    const normalizedApiUrl = normalizeApiUrl(apiUrl);
    const startedAt = Date.now();
    const response = await fetchImpl(normalizedApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = response.text ? await response.text() : "";
      appendDebugLog({
        kind: "llm_request",
        ok: false,
        url: normalizedApiUrl,
        model,
        textCount: texts.length,
        targetLanguage,
        durationMs: Date.now() - startedAt,
        status: response.status,
        statusText: response.statusText,
      });
      console.warn("[Immersive Translate][LLM] request failed", {
        url: normalizedApiUrl,
        model,
        textCount: texts.length,
        targetLanguage,
        durationMs: Date.now() - startedAt,
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(
        `OpenAI compatible request failed: ${response.status} ${response.statusText} ${errorBody}`.trim()
      );
    }

    const data = await response.json();
    const parsed = parseOpenAIResponse(data, texts.length);
    appendDebugLog({
      kind: "llm_request",
      ok: true,
      url: normalizedApiUrl,
      model,
      textCount: texts.length,
      targetLanguage,
      durationMs: Date.now() - startedAt,
      status: response.status,
      statusText: response.statusText,
    });
    console.info("[Immersive Translate][LLM] request ok", {
      url: normalizedApiUrl,
      model,
      textCount: texts.length,
      targetLanguage,
      durationMs: Date.now() - startedAt,
    });
    return parsed;
  }

  async function requestTranslationsWithFallback(options, fallbackFn) {
    try {
      return await requestTranslations(options);
    } catch (error) {
      if (typeof fallbackFn !== "function") throw error;
      return await fallbackFn(error);
    }
  }

  return {
    DEFAULT_SYSTEM_PROMPT,
    buildMessages,
    buildRequestBody,
    parseOpenAIResponse,
    normalizeApiUrl,
    requestTranslations,
    requestTranslationsWithFallback,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = openaiPrompt;
}

export { openaiPrompt };
