# Boliyo — Hinglish captions & reel edits, in your browser

Boliyo is a working, browser-based caption studio for Reels, Shorts and YouTube.
Drop in a video, caption it in Hinglish (or ten other Indian languages), style
every word, and export — an MP4 with the captions burned in, or an SRT file.

Everything runs **on your device**. No upload, no server, no build step. Plain
HTML, CSS and JavaScript.

> A demo rebuild inspired by the Hinglish caption category (the kind of product
> captik.in makes). This is an independent, from-scratch implementation — the
> code, copy and design here are original.

## What actually works

| Feature | Status |
|---|---|
| **Auto captions from an uploaded video or voiceover** (Whisper, on-device) | ✅ |
| Accepts video *and* audio (MP4 · MOV · WebM · MP3 · WAV · M4A) | ✅ |
| Spoken-language picker (Hinglish/Hindi + 10 Indian languages) + auto-detect | ✅ |
| Bundled 12-second demo clip | ✅ |
| Word-timed captions synced to playback | ✅ |
| Live caption rendering on the video | ✅ |
| 24 caption looks (templates) applied instantly | ✅ |
| Per-word highlight ("pop") toggles | ✅ |
| Inline caption text editing | ✅ |
| Timeline with draggable caption blocks + playhead | ✅ |
| Auto-time a pasted script across the clip | ✅ |
| Live dictation via the Web Speech API (Chrome/Edge) | ✅ |
| Import / export SRT | ✅ |
| Export a captioned video (canvas + MediaRecorder → WebM) | ✅ |
| Aspect ratios 9:16 · 16:9 · 1:1 · 4:5 | ✅ |
| Projects saved to your browser (localStorage) | ✅ |

**How auto captions work:** Boliyo loads [Whisper](https://github.com/openai/whisper)
through [transformers.js](https://github.com/huggingface/transformers.js) and runs
it locally with WebAssembly. The first run downloads the speech model once
(~40 MB for *Tiny*, ~80 MB for *Base*) and the browser caches it. Nothing is
uploaded — the audio never leaves the device.

Live dictation and video export use browser APIs that are best supported in
Chromium browsers. Export plays the clip through once in real time while it
records. It is built mobile-first: the editor's right-hand panel becomes a
bottom sheet on phones.

## Run it locally

It is a static site — just open `index.html`, or serve the folder:

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, Vercel. For
GitHub Pages, push this folder to a repo and set Pages to build from the root of
the branch.

## Structure

```
index.html          landing page
editor.html         the working editor
templates.html      the caption-look gallery
pricing.html        plans
about.html          story + languages
assets/css/style.css  design system
assets/js/data.js     templates, sounds, languages
assets/js/editor.js   the caption engine
assets/js/app.js      site interactions
assets/js/vendor/transformers.min.js   transformers.js (Apache-2.0) — runs Whisper in the browser
assets/video/demo-reel.mp4   bundled demo clip (H.264)
assets/video/demo-reel.webm  same clip (VP9) — auto-picked where MP4/H.264 is unavailable
```

## Credits

- [transformers.js](https://github.com/huggingface/transformers.js) — Apache-2.0
- [Whisper](https://github.com/openai/whisper) models — MIT (OpenAI), via the
  `onnx-community/whisper-tiny` / `whisper-base` ONNX conversions on Hugging Face

## License

MIT — fork it, restyle it, ship it.
