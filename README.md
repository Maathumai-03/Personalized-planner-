# Personalized planner

This site helps organize to-dos and daily routines in one place: tasks by day and category, plus clubs and external projects with your roles.

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Data is stored in the browser (`localStorage`). Use **Export JSON** in the app to back up your data.

## Stack

React, TypeScript, Vite.

## Deploy on GitHub Pages

This repo includes [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). After you push to `main`, GitHub Actions builds the site and publishes it.

**One-time setup (in the GitHub repo):**

1. **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).

The live site will be at:

`https://maathumai-03.github.io/Personalized-planner-/`

(If you rename the repository, update the `base` path in [`vite.config.ts`](vite.config.ts) to `/<new-repo-name>/`.)
