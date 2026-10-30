# Security review

Status: PASS for repository-owned controls; hosting-header ownership is documented.

- `npm audit --audit-level=low`: zero vulnerabilities after upgrading patched Vite 6, Playwright, ESLint, and test-only Vitest tooling.
- Exact versions and a lockfile are committed; CI uses `npm ci`.
- No token, password, credential, private endpoint, or environment secret is bundled.
- React escaping is used throughout; there is no `dangerouslySetInnerHTML`.
- External new-tab links use `noopener noreferrer`.
- Admin key remains tab-scoped in `sessionStorage`, is transmitted only in the existing `X-Admin-Key` header, and is never prerendered or persisted in source.
- Applicant IDs are encoded before API path use. CSV cells quote embedded quotes.
- The public form reports success only after an OK API response and disables duplicate submission while pending.
- Admin and 404 pages are no-indexed; admin is absent from public navigation and sitemap.
- Production source maps are disabled.

GitHub Pages owns TLS, caching, redirect, and HTTP response headers. The repository contains no evidence of an existing CSP, HSTS, Referrer-Policy, Permissions-Policy, frame policy, or X-Content-Type-Options control. GitHub Pages does not support arbitrary response headers from static files, so unsupported proxy/infrastructure changes were not made. Recommended headers must be handled in a separately authorized hosting/edge workstream without weakening current policy.

External resources are Google Fonts plus existing official/public API destinations. The failing cross-origin Control Center fetch was removed and replaced with a direct link. No new tracking was introduced.
