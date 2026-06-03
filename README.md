# DaLyric

Church lyrics presentation app for song slides, Bible projection, and live stage display.

## Features

- **Song Library** — Import, edit, and organize songs. Bulk import from plain text files.
- **Slide Editor** — Create and arrange slide decks with plain text or visual grid mode.
- **Bible Browser** — Browse/search scripture with support for custom XML Bible translations. Verse list is virtualized for smooth scrolling over thousands of verses. XML parsing runs off the main thread via a Web Worker.
- **Bible Config Modal** — Configure verse/chapter display position, fonts, colors, and backgrounds for bilingual (Tamil + English) projection.
- **Fullscreen Projection** — Display songs and Bible verses on an external screen or projector. Includes auto-advance timer, lower thirds, speaker banners, and announcement ticker.
- **Countdown Timer** — Pre-service countdown overlay on the projection window with animated circle.
- **Live Preview / Stage Display** — Monitor what's being projected in real time.
- **Mobile Remote** — Control presentations from your phone via WebSocket pairing with exponential backoff reconnection.
- **Setlist / Service Queue** — Order songs for a service and advance through them (Ctrl+N / Ctrl+P).
- **Undo Slide History** — Ctrl+Z to undo projection changes (up to 50 steps).
- **Auto-Advance** — Configurable timer (5s / 10s / 30s) to automatically advance through slides.
- **Bible Style Context** — Centralized bible verse style management (font size, color, background, heading) shared across all panels.
- **Incremental IndexedDB Persistence** — Songs, setlists, and bible history auto-save with debounced writes.

## Getting Started

```
npm install
npm run vite:dev
```

Open http://localhost:3000 in your browser.

For the desktop app with projection window:

```
npm run dev
```

## Downloading a Bible XML

```
npm run download-bible
```

This downloads the KJV Bible XML to `data/bible.xml`. To use a different translation or language (e.g., Tamil Bible), provide a URL:

```
npm run download-bible -- https://example.com/path/to/tamil-bible.xml
```

You can also download manually and place the XML file anywhere; the Bible Panel has an "Upload XML" button.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Arrow Right / Down | Next slide |
| Arrow Left / Up | Previous slide |
| C | Toggle clear screen |
| Escape | Toggle blackout |
| Ctrl+Z | Undo last projection change |
| Ctrl+N | Next setlist item |
| Ctrl+P | Previous setlist item |

## Tech Stack

React 19, TypeScript, Vite 6, Tailwind CSS v4, Electron
