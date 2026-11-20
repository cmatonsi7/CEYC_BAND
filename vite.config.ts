import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// GitHub Pages serves a project repo at https://<user>.github.io/<repo>/.
// The deploy workflow sets VITE_BASE to "/<repo>/". Locally it defaults to
// "./" (relative), which also works on any static host because the app uses
// HashRouter and the HTML always lives at the site root.
const base = process.env.VITE_BASE ?? './';

/**
 * Writes the list of built files into dist/sw.js so the service worker can
 * precache everything (including lazy-loaded screens and fonts) for offline
 * use, and gives it a new version on every build so updates roll out.
 */
function precacheServiceWorker(): Plugin {
  let files: string[] = [];
  return {
    name: 'precache-service-worker',
    apply: 'build',
    generateBundle(_opts, bundle) {
      files = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
    },
    writeBundle(opts) {
      const dir = opts.dir ?? 'dist';
      const swPath = join(dir, 'sw.js');
      const list = [...files, 'data/library.json', 'favicon.svg', 'manifest.webmanifest', 'icon-192.png'];
      const version = createHash('sha1').update(list.join('|') + readFileSync(join(dir, 'data/library.json'))).digest('hex').slice(0, 10);
      const src = readFileSync(swPath, 'utf8')
        .replace("'__VERSION__'", JSON.stringify(version))
        .replace("['__PRECACHE__']", JSON.stringify(list.map((f) => `./${f}`)));
      writeFileSync(swPath, src);
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), precacheServiceWorker()],
  build: { outDir: 'dist', sourcemap: false },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
