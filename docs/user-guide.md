# My Immersive Translate User Guide

## 1) Build the extension

```bash
npm install
npm run chrome
```

Build output: `dist/chrome/`

## 2) Install in Edge/Chrome

1. Open:
   - Edge: `edge://extensions`
   - Chrome: `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `dist/chrome`

## 3) Configure your LLM API

1. Open extension **Options**
2. Go to **Translations**
3. Set **Page translation service** to **OpenAI Compatible (LLM)**
4. Configure:
   - Provider preset (OpenAI / DeepSeek / Moonshot / Custom)
   - API URL
   - API Key
   - Model (example: `gpt-4o-mini`, `deepseek-chat`)
   - Optional prompt template
   - Temperature / Max tokens
5. Click **Test API Connection**

## 4) Daily usage

- Use popup **Translate** button
- Use floating page button (**Translate / Show Original**)
- Switch engine in popup (`OpenAI`, `Google`, `Yandex`)
- Shortcut support:
  - `Ctrl+T` (legacy)
  - `Alt+A` (new)

## 5) Fallback behavior

- If OpenAI-compatible request fails (key invalid, endpoint issue, rate limit), extension falls back to Google translation automatically.

## 6) Troubleshooting

### API test fails
- Check API URL format (`https://...`)
- Check API key validity
- Check model name exists for your provider

### Page does not translate
- Verify current site is not in Never Translate list
- Try switching engine to Google/Yandex
- Reload the tab and retry

### Hotkey not working
- Open browser shortcut manager:
  - Chrome/Edge: `chrome://extensions/shortcuts`
- Rebind the extension commands
