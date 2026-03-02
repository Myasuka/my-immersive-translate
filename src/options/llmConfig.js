"use strict";

const twpLlmConfig = (function () {
  const providerPresets = {
    openai: "https://api.openai.com/v1/chat/completions",
    deepseek: "https://api.deepseek.com/chat/completions",
    moonshot: "https://api.moonshot.cn/v1/chat/completions",
  };

  function getProviderPreset(provider) {
    return providerPresets[provider] || "";
  }

  function isValidApiUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (e) {
      return false;
    }
  }

  function normalizeApiUrl(value) {
    const raw = String(value || "").trim();
    if (!isValidApiUrl(raw)) return raw;

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

  return {
    providerPresets,
    getProviderPreset,
    isValidApiUrl,
    normalizeApiUrl,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = twpLlmConfig;
}

export { twpLlmConfig };
