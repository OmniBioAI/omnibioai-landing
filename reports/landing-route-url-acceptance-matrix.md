# Route and URL acceptance matrix

Production build tested with Playwright Chromium 156 through Playwright 1.64.1 on 2026-10-30.

| URL | Artifact | Direct load | Refresh | Canonical/indexing |
| --- | --- | --- | --- | --- |
| `/` | `index.html` | Pass | Pass | Canonical `/`, index |
| `/index.html` | `index.html` | Pass | Pass | Canonical `/`, index |
| `/about` | `about/index.html` | Pass | Pass | Canonical `/about`, index |
| `/about.html` | `about.html` | Pass | Pass | Canonical `/about`, index |
| `/privacy` | `privacy/index.html` | Pass | Pass | Canonical `/privacy`, index |
| `/privacy.html` | `privacy.html` | Pass | Pass | Canonical `/privacy`, index |
| `/terms` | `terms/index.html` | Pass | Pass | Canonical `/terms`, index |
| `/terms.html` | `terms.html` | Pass | Pass | Canonical `/terms`, index |
| `/admin` | `admin/index.html` | Pass | Pass | Canonical `/admin`, noindex/noarchive |
| `/admin.html` | `admin.html` | Pass | Pass | Canonical `/admin`, noindex/noarchive |
| unknown | `404.html` host fallback | Pass via explicit fallback acceptance | N/A | noindex/follow |

All homepage fragment identifiers represented in the baseline remain present: literature AI, features, enterprise integrations, omics, catalogs, reference databases, genomes, architecture, downloads, publications, and access request. Legal table-of-contents fragments are preserved. Query strings are not consumed or rewritten, so hosting/browser behavior preserves them.

GitHub Pages already redirects `/about.html` to `/about` in production. The dual artifacts retain direct compatibility without adding a redirect chain or changing ingress.

URL_ACCEPTANCE=10/10 for existing clean/legacy document URLs. The explicit 404 acceptance is additional.
