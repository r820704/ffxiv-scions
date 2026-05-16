/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { copyFileSync } from 'node:fs'

/**
 * Mirrors the root-level NOTICES files into `public/` so the deployed site
 * can serve them at `/${base}/THIRD-PARTY-NOTICES{,.en}.md`. The root copies
 * remain the canonical source (GitHub renders them on the repo home and
 * convention puts NOTICES at the project root); `public/` is treated as a
 * build artefact and kept out of git.
 */
function syncRootNoticesToPublic(): Plugin {
  const files = ['THIRD-PARTY-NOTICES.md', 'THIRD-PARTY-NOTICES.en.md'] as const;
  const run = () => {
    for (const f of files) {
      copyFileSync(f, path.join('public', f));
    }
  };
  return {
    name: 'sync-root-notices-to-public',
    buildStart: run,
    configureServer: run,
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), syncRootNoticesToPublic()],
  base: process.env.VITE_BASE_URL || '/ffxiv-scions/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
