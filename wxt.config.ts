import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  outDir: ".output",
  manifest: {
    name: "__MSG_extensionName__",
    description: "__MSG_extensionDescription__",
    default_locale: "en",
    version: "0.2.0",
    permissions: ["storage", "activeTab", "contextMenus", "webRequest"],
    host_permissions: ["<all_urls>"],
    optional_permissions: ["webNavigation"],
    commands: {
      "hotkey-toggle-translation": {
        suggested_key: { default: "Ctrl+T", mac: "MacCtrl+T" },
        description: "__MSG_lblSwitchTranslatedAndOriginal__",
      },
      "hotkey-toggle-translation-alt": {
        suggested_key: { default: "Alt+A", mac: "Alt+A" },
        description: "__MSG_lblSwitchTranslatedAndOriginal__",
      },
      "hotkey-toggle-dual": {
        suggested_key: { default: "Ctrl+D", mac: "MacCtrl+D" },
        description: "__MSG_lblSwitchDual__",
      },
    },
    web_accessible_resources: [
      {
        resources: ["/icons/*", "/contentScript/css/*"],
        matches: ["<all_urls>"],
      },
    ],
    options_ui: {
      page: "options/index.html",
      open_in_tab: true,
      browser_style: false,
    },
    action: {
      default_icon: "/icons/icon-32.png",
      default_title: "__MSG_pageActionTitle__",
    },
  },
});
