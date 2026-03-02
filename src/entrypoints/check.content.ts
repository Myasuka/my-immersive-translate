export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  allFrames: false,
  main() {
    // Respond to background's contentScriptIsInjected check
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.action === "contentScriptIsInjected") {
        sendResponse(true);
      }
    });
  },
});
