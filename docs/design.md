# Design Notes

## Why iterate from this repository

- The new upstream release line no longer provides source code.
- This repository still contains a complete and editable architecture for browser translation workflows.
- Incremental upgrades are lower risk than full rewrite.

## Major design decisions

## 1. OpenAI-compatible abstraction first

Instead of binding to one vendor SDK, we use a generic OpenAI-compatible HTTP interface:

- `apiUrl`
- `apiKey`
- `model`
- prompt + generation params

This supports OpenAI/DeepSeek/Moonshot/custom gateways with one implementation.

## 2. Keep legacy engines as fallback

Goal is LLM-first, but resilience matters:

- Primary: `openai`
- Fallback: `google`
- Optional alternatives: `yandex`, `bing`, `deepl`

This prevents total feature outage when third-party API is unavailable.

## 3. Preserve existing parsing pipeline

We keep existing content extraction/DOM patching logic and only replace translation provider internals.  
This minimizes behavior regressions on complex sites.

## 4. MV3-safe Chrome/Edge path

Chrome/Edge builds use service worker background and `chrome.action` APIs.

## Prompt strategy

Prompt constraints in `openaiPrompt.js`:

- preserve HTML tags
- output strict JSON
- return one translation per input string
- include detected source language

This keeps parsing deterministic and allows direct mapping back to DOM pieces.

## Current trade-offs

- OpenAI-compatible mode currently prioritizes compatibility and reliability over advanced streaming UX.
- UI is still based on original popup/options structure, with incremental modernization applied.
- Site rule migration is selective, not a full clone of the closed-source latest release behavior.
