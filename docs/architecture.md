# My Immersive Translate Architecture

## Overview

This project keeps the original extension architecture and adds an OpenAI-compatible LLM translation path.

Core layers:

1. **Content scripts** (`src/contentScript/`)
   - Parse page DOM into translatable pieces
   - Request translations from background
   - Render bilingual output and translation progress/floating controls

2. **Background layer** (`src/background/`)
   - Translation orchestration (`translationService.js`)
   - Service adapters: `openai`, `google`, `yandex`, `bing`, `deepl`
   - Translation cache integration
   - Browser actions/context menu/command handling (MV3 worker for Chrome/Edge)

3. **Config & language layer** (`src/lib/`)
   - Persistent config model (`config.js`)
   - Language/service capability mapping (`languages.js`)
   - Site-specific rules (`specialRules.js`)

4. **UI layer**
   - Popup (`src/popup/old-popup.*`): quick actions + engine switching
   - Options (`src/options/*`): LLM provider preset/API config and behavior settings

## Translation flow

1. User triggers translation (popup button, floating button, shortcut, context menu)
2. `pageTranslator` extracts visible text pieces and attributes
3. Content script sends `translateHTML`/`translateText` messages to background
4. Background selects engine by config + `getAlternativeService`
5. For `openai`:
   - Build prompt/request (`openaiPrompt.js`)
   - Call OpenAI-compatible endpoint
   - Parse JSON translation payload
   - On failure, fallback to Google service
6. Result is cached and returned to content script
7. Content script updates DOM and keeps dynamic translation loop running

## MV3 notes (Edge/Chrome)

- Chrome/Edge use `manifest_version: 3` + service worker entry `background/background-entry.js`
- Legacy `browserAction/pageAction` usage replaced with `chrome.action`
- Context menu action scope uses `"action"` contexts

## Key extension points

- Add new LLM providers: implement OpenAI-compatible base URL/model presets in options
- Add provider-specific logic: extend `openaiPrompt.js` request/response handling
- Add site adaptations: update `src/lib/specialRules.js`
