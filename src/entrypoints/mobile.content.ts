import "../lib/languages.js";
import "../lib/config.js";
import "../lib/platformInfo.js";
import "../lib/i18n.js";
import "../contentScript/popupMobile.js";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  allFrames: false,
  main() {},
});
