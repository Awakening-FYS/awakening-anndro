This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Local environment setup (GitHub Discussion PAT)

This project reads a GitHub Personal Access Token (PAT) from `GITHUB_TOKEN` at runtime to post comments to a GitHub Discussion. For local development:

1. Create a new Personal Access Token on GitHub:
	- Classic token: give `repo` (if repo is private) and `write:discussion` scopes.
	- Fine-grained token: grant repository access to `Awakening-FYS/awakening-anndro` and enable Discussions Read & Write.

2. Copy the token and open `.env.local` in the project root. Replace `GITHUB_TOKEN=REPLACE_WITH_YOUR_GITHUB_PAT` with your token (no surrounding quotes).

3. Restart your Next.js dev server so the server process reads the new env value:
```
npm run dev
```

4. Verify the token locally by calling the diagnostic endpoint (available during development):
```
Invoke-RestMethod -Uri 'http://localhost:3000/api/github-test' -Method Get | ConvertTo-Json -Depth 5
```

If you accidentally committed a token, revoke it immediately on GitHub and replace it with a new one. Do not commit secrets to source control.


## Developer notes

Quick items useful when developing locally:

- Theme handling
	- This project uses class-based dark mode. The current implementation reads a `site-theme` key from `localStorage` and adds/removes the `dark` class on the `<html>` element early in `src/app/head.tsx`.
	- Use the theme toggle in the Navbar (Dark / Light / System) to persist a preference. To force dark from the console:

```js
localStorage.setItem('site-theme','dark'); location.reload();
```

- Favicons
	- Canonical favicons live in `public/` as `favicon.ico`, `favicon-dark.ico`, and `favicon-light.ico`.
	- If you add or replace icons, clear browser cache or add a query string `/?v=2` while testing.

- Image background removal and ICO conversion
	- ImageMagick (magick) is recommended for quick PNG/JPG -> ICO conversion. On Windows you can install via Chocolatey or Scoop, or download the official installer:
		- Chocolatey: `choco install imagemagick` (run in an elevated PowerShell)
		- Scoop: `scoop install imagemagick`
		- Verify with `magick -version`
	- Alternative (Node): use `sharp` to create a PNG and `png-to-ico` to make an ICO. See `DEVELOPER_NOTES.md` for examples.

- Removing temporary files
	- Some image previews and dev artifacts may be under `public/images/` (look for `dazuo_trans*` or `*preview*`). You can run `scripts/cleanup.ps1` to move non-production files into `scripts/archive/` for safekeeping.

