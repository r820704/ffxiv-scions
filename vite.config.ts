/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { copyFileSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

/**
 * '+' when the build commit is past the latest release tag (release-please
 * stamps tags like `v0.9.0` only on Release PR merges). Empty otherwise:
 * - No tags exist yet (bootstrap state, before first release-please run)
 * - HEAD sits exactly on a release tag
 *
 * Surfaced in the footer so visitors can tell stable vs in-development builds
 * apart without needing commit hashes.
 */
function getVersionSuffix(): string {
  try {
    const tags = execSync('git tag --list', { stdio: ['pipe', 'pipe', 'pipe'] })
      .toString()
      .trim();
    if (!tags) return '';
    execSync('git describe --tags --exact-match HEAD', { stdio: 'pipe' });
    return '';
  } catch {
    return '+';
  }
}

const versionSuffix = getVersionSuffix();

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
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_VERSION_SUFFIX__: JSON.stringify(versionSuffix),
  },
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
