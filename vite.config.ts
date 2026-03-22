import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project URL: /<repo-name>/ — must match the repository name
const pagesBase = '/Personalized-planner-/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Local dev uses "/"; production build uses repo subpath for GitHub Pages
  base: command === 'build' ? pagesBase : '/',
  plugins: [react()],
}))
