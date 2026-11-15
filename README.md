# Rose 🌹

**An interactive 3D ASCII flower, built for the browser.**

Rose turns a mathematical flower model into a living field of colored characters. It is inspired by a Python / Pygame ASCII rose renderer and reimagined as a self-contained web experience.

## Live demo

After enabling GitHub Pages, your site will be available at:

`https://YOUR-USERNAME.github.io/Rose/`

## Features

- Procedurally generated rose with 26 layered petals
- Golden-angle petal arrangement
- Animated 3D-style perspective projection
- ASCII character shading and multiple color palettes
- Adjustable rotation speed and character density
- Drag to rotate and scroll to zoom
- Pause, reset, surprise-me, fullscreen, and save-image controls
- Responsive layout for desktop and mobile
- No build step and no JavaScript dependencies

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For a local development server, you can also run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Controls

| Action | Control |
|---|---|
| Pause / resume | Pause bloom button |
| Rotate | Drag inside the rose stage |
| Zoom | Mouse wheel / trackpad |
| Change colors | Color Story selector |
| Change speed | Rotation Speed slider |
| Change detail | Character Density slider |
| Save artwork | Save image button |
| Fullscreen | Top-right fullscreen button |

## Deploy with GitHub Pages

1. Create a new repository named `Rose` on GitHub.
2. Upload the contents of this project (keep `index.html` at the repository root).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site.

## Project structure

```text
Rose/
├── index.html
├── styles.css
├── src/
│   └── rose.js
├── assets/
│   └── screenshots/
├── README.md
├── LICENSE
└── .gitignore
```

## License

Released under **CC0 1.0 Universal**. You may copy, modify, distribute, and use this project, including commercially, without asking permission or providing attribution. See [LICENSE](LICENSE).

---

Made with math & curiosity.
