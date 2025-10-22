Developer notes

This file contains quick recipes and troubleshooting steps for contributors.

Theme
- Class-based dark mode is used. The inline script in `src/app/head.tsx` sets the `.dark` class early using `localStorage.getItem('site-theme')` and falls back to `prefers-color-scheme`.
- Theme toggle component: `src/components/ThemeToggle.tsx` (client). It writes `site-theme` and immediately applies the `.dark` class so you can test UI without a full reload.

Favicons
- Canonical files are in `public/`:
  - `favicon.ico` (default)
  - `favicon-dark.ico` (used for light scheme so the icon contrasts)
  - `favicon-light.ico`
- If favicons don't update in your browser, clear cache or open an incognito window, or use a query parameter on the page while testing (e.g., `http://localhost:3000/?v=2`).

ImageMagick (Windows)
- Chocolatey (elevated PowerShell):
  choco install imagemagick
- Scoop (non-elevated PowerShell):
  scoop install imagemagick
- Verify:
  magick -version

Node fallback for PNG -> ICO
- Example using `sharp` and `png-to-ico` in Node.js:

```js
// convert-to-ico.js
import sharp from 'sharp'
import fs from 'fs'
import pngToIco from 'png-to-ico'

async function run() {
  const png = await sharp('source.jpg').resize(256,256).png().toBuffer()
  const ico = await pngToIco([png])
  fs.writeFileSync('public/favicon.ico', ico)
}

run().catch(err => { console.error(err); process.exit(1) })
```

rembg and background removal
- `rembg` is convenient but requires `onnxruntime` in some environments. If `python -m rembg` errors with `onnxruntime` missing, install it via `pip install onnxruntime` or follow project docs.
- Alternatives: manual background removal with GIMP/Photoshop, or use ImageMagick for solid-color backgrounds.

Cleanup
- `scripts/cleanup.ps1` moves dev-only artifacts (files with `preview` or `trans` in name) into `scripts/archive` so they don't clutter `public/`.

If you want, I can:
- Run a repo-wide scan for `bg-white` and hard-coded colors and propose replacements with theme variables.
- Move dev artifacts into `scripts/` and create a PR with the changes.
