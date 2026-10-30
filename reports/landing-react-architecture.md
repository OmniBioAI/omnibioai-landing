# Landing React architecture

## Decision

The site uses React 18.3.1, strict TypeScript, and Vite 6.4.5. Vite produces a browser bundle and a temporary SSR bundle; `scripts/prerender.mjs` renders all route documents at build time and then removes the SSR artifact. There is no production Node server and no runtime coupling to another OmniBioAI service.

React Router was not introduced. The site has five shallow document routes, GitHub Pages serves explicit generated files/directories, and a small deterministic `routeFromPath` function covers clean and legacy paths. This has less runtime code and fewer hosting assumptions than client-side routing.

## Layout

- `src/entry-client.tsx` hydrates prerendered markup.
- `src/entry-server.tsx` renders route HTML and metadata.
- `src/pages/` owns page compositions.
- `src/components/` owns reusable UI and integrations.
- `src/data/` owns typed content/catalog data.
- `src/config.ts` owns public origins and route resolution.
- `src/seo.ts` owns route metadata and factual Organization JSON-LD.
- `src/styles.css` owns tokens, components, breakpoints, and reduced-motion behavior.
- `src/test/` and `e2e/` own unit/component and production browser tests.
- `web/index.html` is the Vite/prerender template.
- `dist/` is the sole deployable artifact and is ignored by Git.

## Rendering and deployment

Ten route artifacts are prerendered: `/`, the clean and `.html` variants for about/privacy/terms/admin, and `404.html`. Each contains the complete meaningful page content before hydration. `robots.txt`, `sitemap.xml`, `.nojekyll`, assets, and public data are generated/copied into `dist/`.

Pinned exact dependency versions and `package-lock.json` make `npm ci` reproducible. Node 20+ is supported; CI uses Node 22.
