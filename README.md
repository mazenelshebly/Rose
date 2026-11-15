# Rose 🌹 — أحبك بكل لغات العالم

A full-screen typographic rose animation. Open the page and watch a flower form gradually: stem, leaves, sepals, then red petals built from ways to say **“I love you”** in languages from around the world.

## Experience

- No navigation, dashboards, or settings panel
- The bloom begins automatically on page load
- The rose is drawn with multilingual text fragments
- Stem and leaves form before the red petals open
- A quiet closing message appears after the bloom
- Replay button lets visitors watch the animation again
- Responsive canvas for desktop and mobile

## Run locally

Open `index.html` in a modern browser, or run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy with GitHub Pages

1. Put `index.html`, `styles.css`, and `src/rose.js` in the repository root/structure shown below.
2. In GitHub, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
4. Open the Pages URL after the deployment finishes.

## Structure

```text
Rose/
├── index.html
├── styles.css
├── src/
│   └── rose.js
├── README.md
├── LICENSE
└── .gitignore
```

## Translation note

The rose uses a curated selection of common expressions. Some languages change wording based on gender, formality, dialect, or relationship, so this is an artistic multilingual selection rather than a claim to cover every language or every variant.

## License

CC0 1.0 Universal. See [LICENSE](LICENSE).
