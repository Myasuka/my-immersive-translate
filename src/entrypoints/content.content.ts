import "../lib/languages.js";
import "../lib/config.js";
import "../lib/platformInfo.js";
import "../lib/i18n.js";
import "../lib/specialRules.js";
import "../contentScript/showOriginal.js";
import "../contentScript/enhance.js";
import "../contentScript/pageTranslator.js";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  allFrames: true,
  matchAboutBlank: true,
  main() {},
});
