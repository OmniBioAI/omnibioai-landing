# OmniBioAI landing React migration baseline

Date: 2026-10-30 (America/Chicago)

Workstream: `OMNIBIOAI_LANDING_REACT_MIGRATION_V1`

Repository: `/home/manish/Desktop/omnibioai-ecosystem/omnibioai-landing`

Parent workspace: `/home/manish/Desktop/omnibioai-ecosystem`

## Change-control snapshot

- Repository top level: `/home/manish/Desktop/omnibioai-ecosystem/omnibioai-landing`
- Worktree: the repository top level above; no alternate landing worktree is active.
- Branch: `main`, tracking `origin/main`.
- HEAD: `c171824a51ce565454872c771647b0c755fce80d` (`landing: hide system requirements until desktop apps ship (#27)`).
- Landing repository status before migration: clean. There were no staged, unstaged, untracked, or ignored files reported by Git.
- Parent ecosystem status: dirty, including many sibling repositories. Those changes are outside this workstream and must not be touched.
- No commit, push, tag, deployment, DNS, ingress, proxy, tunnel, or sibling-service operation is authorized.

Commands used for the snapshot included `git status --short --branch`, `git status --short --ignored`, `git diff --stat`, `git diff --cached --stat`, `git worktree list --porcelain`, `git ls-tree`, and `git log`.

## Existing architecture and deployment

The baseline is a framework-free static website: five independent HTML documents with inline CSS and JavaScript, plus local images/SVGs and one JSON data file. There is no `package.json`, lockfile, TypeScript, bundler, unit-test framework, browser-test framework, sitemap, robots file, or application-level security-header configuration.

GitHub Actions validates HTML/CSS and external links on pushes and pull requests to `main`. A successful push to `main` publishes the entire repository directory to the `gh-pages` branch through `peaceiris/actions-gh-pages@v3`. The public domain is `https://omnibioai.org`. The deployed `/about.html` currently redirects to `/about`, demonstrating clean-URL behavior at the host. Production deployment was not run and will not be run in this workstream.

The current `gh-pages` tree mirrors the source tree and adds `.nojekyll`. No `CNAME`, Dockerfile, reverse-proxy configuration, deployment script, CSP, or other response-header configuration is present in the active source. Hosting-level DNS, TLS, redirects, caching, and headers therefore remain owned outside this repository.

## Public entry points and routes

| Source entry | Observed URL | Purpose | Baseline SEO state |
| --- | --- | --- | --- |
| `index.html` | `/` and `/index.html` | Main product/marketing page and access form | Title only; missing description, canonical, social metadata, and structured data |
| `about.html` | `/about.html`, hosted redirect to `/about` | Mission, team, publications, contact CTA | Description and partial Open Graph metadata; no canonical |
| `admin.html` | `/admin.html` | Password-gated beta-request operations console | No explicit `noindex`; client-side credential entry and Worker API access |
| `privacy.html` | `/privacy.html` | Privacy policy | Description, partial Open Graph metadata, canonical |
| `terms.html` | `/terms.html` | Terms of service | Description, partial Open Graph metadata, canonical |

The homepage contains public fragment routes for `literature-ai`, `features`, `enterprise-integrations`, `omics`, `download`, `catalogs`, `reference-databases`, `genomes`, `architecture`, `publications`, `request`, and hidden/legacy `requirements` content. Legal pages contain their own table-of-contents fragment identifiers. These anchors are part of the URL-acceptance scope.

No dedicated contact page, search route, analytics integration, consent manager, or downloadable file is present. Contact is represented by the beta-request form and factual `mailto:` links. The private admin page is a tracked user-facing entry point and must be migrated, protected from indexing, and kept functionally separate from public navigation.

## Functional baseline

| Function | Baseline implementation | Dependency / behavior |
| --- | --- | --- |
| Beta access submission | Required name, email, institution, role, use case, platform, and research fields | `POST https://beta-requests.mandecent-gupta.workers.dev/submit`; displays true success only after an OK response and otherwise displays an error |
| Admin sign-in/list | Password stored for the tab in `sessionStorage` | `GET /admin/requests` with `X-Admin-Key` on the same Worker origin |
| Admin decisions | Approve/reject with optional note and busy/error states | `PATCH /admin/requests/:id`; API result governs success feedback |
| Admin export | In-browser CSV generation | Uses the currently filtered/loaded request data; no server write |
| Catalog metrics | Fetches `data/site-data.json`, uses a five-second timeout and local-storage cache | Fallback is existing document content |
| Public ecosystem metrics | Fetches `https://control.omnibioai.org/report/public-stats` | Progressive enhancement; static placeholders remain on failure |
| GitHub data | Fetches Studio repository metadata and landing commit data | Progressive enhancement for stars and last-updated date |
| Navigation | Desktop “More” dropdown and mobile toggle | Escape, outside click, and link activation close menus; `aria-expanded` is updated |
| Integration/reference filtering | Client-side category filters | Buttons expose `aria-pressed` state |
| Motion | Intersection/number/card/rotator animation | Existing code detects `prefers-reduced-motion` for major effects |

External official destinations include Docs and API documentation, Control Center/public stats, Web Studio, Videos, GitHub, Discord, Twitter, publications, team profiles, and email addresses already present in source. No credentials or tokens are embedded in tracked source. The Worker hostname is an existing public API endpoint and is not a credential.

## Asset and source baseline

Tracked active assets are:

- `assets/omnibioai-logo.svg` — horizontal brand logo.
- `assets/omnibioai-mark.svg` — brand mark and favicon.
- `assets/omnibioai-studio-qr.svg` — QR code linking to Web Studio.
- `assets/praveen_photo.jpg` — team portrait.
- `assets/rajnish_kumar.jpg` — team portrait.
- `data/site-data.json` — public catalog counts, schema version 1, updated 2026-10-04.

There are no locally hosted font files or general icon files. Google Fonts supplies Space Grotesk, JetBrains Mono, and Playfair Display. Inline characters provide decorative icons. Historical documentation and a packaging script live under the misspelled tracked directory `oboslete/`; they are not active browser assets and are preserved pending dependency evidence.

Source sizes before migration:

| File | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| `index.html` | 171,819 | 34,748 |
| `about.html` | 61,722 | 32,775 |
| `admin.html` | 27,575 | 7,590 |
| `privacy.html` | 19,244 | 6,701 |
| `terms.html` | 16,325 | 6,078 |

The complete checkout excluding Git metadata occupies approximately 448 KiB. The homepage combines content, CSS, and behavior in one 1,900-line document, which is the primary maintainability concern.

## Baseline quality and risk assessment

### Rendering and SEO

All meaningful content is available as static HTML without JavaScript, which is a strong crawlability baseline. However, metadata is inconsistent, `robots.txt` and `sitemap.xml` are absent, the admin page is indexable by default, structured data is absent, clean and `.html` URL conventions are inconsistent, and the homepage lacks a meta description and canonical URL.

### Accessibility

Positive evidence includes semantic section headings, required form controls, some labels, mobile-navigation state attributes, keyboard Escape handling, and reduced-motion checks. Known baseline risks include inconsistent navigation across pages, links opening new tabs without consistent rel protection or visible warning, custom interactive controls that need full keyboard verification, an admin drawer without dialog semantics/focus management, status messages without consistent live regions, and no automated accessibility suite. No WCAG conformance claim is made from source inspection.

### Responsive behavior

The HTML contains responsive CSS, including mobile navigation. No baseline browser matrix or screenshot evidence is checked in. The required 375, 390, 768, 1280, and 1440 pixel acceptance viewports are therefore unverified at baseline.

### Performance

The current site has no application bundle and its initial documents are modest when compressed, but the homepage transfers a large HTML payload, repeats embedded styles, loads Google Fonts, and performs several third-party fetches after load. No local Chrome/Chromium or Lighthouse executable was available at baseline, so no honest Lighthouse score is recorded. Production Lighthouse measurements remain to be run if a browser can be provisioned through the migration toolchain.

### Security

Applicant values are escaped in the current admin renderer, and the form does not fake success. Risks and ownership boundaries include a tab-scoped admin secret accessible to page JavaScript, no repository-owned response headers, externally hosted fonts, broad cross-origin API dependencies, and no dependency audit because there are no JavaScript dependencies. The migration must not weaken Worker authentication or expose secrets. Header enforcement remains a hosting responsibility unless a GitHub Pages-compatible mechanism is evidenced.

## Baseline acceptance state

- Existing pages inventoried: 5/5 tracked HTML entries.
- React pages implemented: 0/5.
- Existing document URLs accepted: 0/7 (`/`, `/index.html`, `/about`, `/about.html`, `/admin.html`, `/privacy.html`, `/terms.html`) tested against a migrated build.
- Functional behaviors accepted: 0/10 against a migrated build (including progressive/decorative behaviors later dispositioned separately).
- Assets accounted for: 6/6 active local assets/data files identified; historical files preserved.
- Unit/component tests: not present.
- Browser E2E: not present.
- Production React build: not present.
- SEO: partial baseline.
- Accessibility: unverified baseline.
- Responsive validation: unverified baseline.
- Security validation: partial source review only.
- Deployment compatibility: current GitHub Pages model identified; React compatibility not yet established.

This report was created before implementation changes. It is the migration comparison point, not a completion claim.
