# Landing website inventory

Date: 2026-10-30. Source baseline: `c171824a51ce565454872c771647b0c755fce80d`.

## Pages

| Page | Baseline entry | React implementation | Status |
| --- | --- | --- | --- |
| Home/product | `index.html` | `HomePage` | Preserved and reorganized into semantic sections |
| About/team | `about.html` | `AboutPage` | Preserved |
| Beta administration | `admin.html` | `AdminPage` | Preserved, no-indexed, accessible dialog added |
| Privacy policy | `privacy.html` | `PrivacyPage` | Preserved in a shared legal layout |
| Terms of service | `terms.html` | `TermsPage` | Preserved in a shared legal layout |

No other active HTML entry was found. Files under `oboslete/` are historical evidence, not public pages. Legacy root HTML remains tracked as baseline/source evidence but is excluded from `dist/`; production deploys only the React-generated artifact.

## Shared elements

- `Header`, `Footer`, `PageShell`, `LegalLayout`, `ExternalLink`, `CatalogSection`, and `AccessForm` replace duplicated markup.
- Design tokens and responsive rules live in `src/styles.css`.
- Brand logo, mark, QR code, and both portraits are preserved. The founder had no baseline portrait asset, so an initial-based placeholder remains rather than a fabricated photo.
- Space Grotesk, JetBrains Mono, and Playfair Display remain the typography system.

## Functional disposition

| Function | Disposition | Evidence |
| --- | --- | --- |
| Beta access form | Preserved and improved | Same Worker `/submit`; native validation, pending, real success, and fail-closed error states; unit and E2E tests |
| Admin authentication/list | Preserved | Same Worker `/admin/requests` and `X-Admin-Key`; E2E boundary test |
| Approve/reject | Preserved | Same encoded request path, PATCH status/note, pending/error behavior; E2E approval test |
| CSV export | Preserved | Browser-generated escaped CSV of the visible request set |
| Catalog data | Improved | Build-time typed import replaces runtime local fetch/cache while preserving the maintained JSON snapshot |
| Integration/reference filters | Preserved and improved | Accessible pressed states and live count; unit test |
| Desktop/mobile navigation | Preserved and improved | Shared keyboard-accessible component; unit/E2E tests |
| Motion | Replaced | Decorative motion was reduced; reduced-motion support is global and content does not depend on animation |
| Control public-stats fetch | Replaced | Baseline production rendered placeholders and local audit proved the endpoint lacks cross-origin permission; direct live-metrics link avoids console errors |
| GitHub stars/commit decoration | Intentionally retired | Non-essential third-party decoration removed from the critical path; official GitHub link remains |

There is no analytics, ad tracking, consent manager, site search, or downloadable artifact in the active baseline. External destinations were inventoried from source; critical Docs, API, Web Studio, Videos, Control Center, GitHub, Discord, Twitter, publications, profiles, and mail links are retained.

## Asset accounting

All six active local asset/data files are accounted for: three SVG brand/QR assets, two JPG portraits, and `data/site-data.json`. The production artifact includes these assets plus hashed optimized imports. No credential or private endpoint is present.
