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

  return {
    providerPresets,
    getProviderPreset,
    isValidApiUrl,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = twpLlmConfig;
}
