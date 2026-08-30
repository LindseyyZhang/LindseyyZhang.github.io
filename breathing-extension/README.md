# Cat Wave Breathing 🐾

A minimalist breathing coach for office workers. A stylized sleeping cat's
back line morphs into a fluid sine wave that expands and contracts through
three science-backed breathing patterns, with an optional synthesized cat
purr that swells on the exhale.

Ships as both a standalone web app and a Chrome Extension (Manifest V3:
popup, side panel, and an in-page overlay widget).

## Stack

React 18 + TypeScript + Vite, Tailwind CSS v4, HTML5 Canvas (no charting
libs — the wave is hand-rolled `y = base - A(t) · sin(kx + ωt)` math), and
the Web Audio API for the purr synth.

## Breathing modes

| Mode | Cycle | Pattern |
| --- | --- | --- |
| ⚡ Cyclic Sighing | 10s | Two inhales (`easeOutQuad` → micro-pause → `easeInOutCubic`) then one long `easeOutCubic` exhale — a fast physiological reset. |
| 🧘 Resonant Breathing | 11s | Symmetric `easeInOutSine` inhale/exhale, ~5.5 breaths/min. |
| 🫁 Chest Expansion | 9s | Deep over-expansion inhale (amplitude to 1.2, stroke 2→4px) and a slow tapering exhale. |

The math and easing curves live in `src/lib/breathingModes.ts` and
`src/lib/easing.ts`; the canvas renderer is `src/components/CatWaveCanvas.tsx`.

## Project layout

```
src/
  lib/                breathing-mode config, easing, color, storage, purr synth
  components/
    CatWaveCanvas.tsx  the animated wave + cat silhouette
    BreathingApp.tsx   mode tabs, play/pause, timer, sound toggle (shared UI)
  popup/, sidepanel/   extension entry points (mount BreathingApp)
  content/             content-script overlay (shadow DOM, Tailwind inlined)
  background/          MV3 service worker
  App.tsx, main.tsx    standalone web app entry
public/
  manifest.json        MV3 manifest (copied verbatim into dist/)
  icons/               generated PNG icons (16/32/48/128)
scripts/gen_icons.py   regenerates the icons (no external deps)
```

## Develop

```bash
npm install
npm run dev        # standalone web app at http://localhost:5173
```

The popup and side panel pages are also servable in dev at
`http://localhost:5173/popup.html` and `/sidepanel.html`. The content
script and background service worker aren't meaningfully testable outside
a loaded extension — use the build + load-unpacked flow below for those.

## Build

```bash
npm run build
```

This runs three Vite builds into the same `dist/`:

1. the main multi-page app (standalone `index.html`, `popup.html`, `sidepanel.html`)
2. `src/content/main.tsx` → a single self-contained `dist/content.js` (IIFE, Tailwind CSS inlined into a shadow root — never leaks into or out of the host page)
3. `src/background/main.ts` → `dist/background.js` (ES module service worker)

`public/manifest.json` and `public/icons/` are copied into `dist/` automatically as static assets.

## Load the extension in Chrome

1. `npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `breathing-extension/dist` folder
5. Click the extension icon for the popup, or open Chrome's side panel
   (puzzle-piece icon area → panel picker) to pin "Cat Wave Breathing" there
6. Visit any `http(s)://` page and look for the 🐾 icon in the bottom-right
   corner — click it to open the floating breathing widget

Mode selection and the sound toggle persist via `chrome.storage.sync`
(falls back to `localStorage` in the plain web app / dev server, where
`chrome.storage` doesn't exist).

## Regenerating icons

```bash
npm run gen-icons   # python3 scripts/gen_icons.py
```
