# Deployment compatibility

Status: PASS locally; deployment not attempted.

The baseline deploys the repository root to the `gh-pages` branch after validation. CI now performs `npm ci`, strict type checking, lint, unit/component tests, a production build, Playwright installation/E2E, then rebuilds and publishes only `dist/` on authorized pushes to `main`.

The output is static and includes `.nojekyll`, canonical clean route directories, legacy `.html` documents, `404.html`, robots, sitemap, hashed assets, preserved brand assets, and public site data. It needs no Node process, database, LIMS, Auth, Studio, Control Center, Docs, Workbench, or Gateway runtime.

No DNS, TLS, Cloudflare tunnel, public ingress, reverse proxy, shared container, or production deployment was modified. GitHub Pages/edge infrastructure continues to own custom-domain behavior, HTTPS, caching, compression, redirects, and security response headers.

Direct nested route loading is supported by physical `route/index.html` artifacts. Legacy URLs remain physical files. Unknown paths use GitHub Pages `404.html` behavior. Query strings pass through unchanged.

The obsolete root HTML is not copied into `dist/`; it remains tracked solely as migration evidence and as input to the one-time catalog extraction utility.
