# OmniBioAI Landing Page

Official marketing and download landing page for [OmniBioAI Studio](https://github.com/man4ish/omnibioai-studio) — an AI-native, reproducible bioinformatics platform for multi-omics research.

---

## What this repo is

A self-contained static site (zero build step, zero dependencies) that serves as the public face of OmniBioAI Studio. It covers:

- Platform overview and feature highlights
- Multi-omics pipeline coverage (20+ modalities)
- System requirements and installation instructions
- Download links for all release artifacts (macOS DMG, Linux AppImage/DEB/RPM, Windows EXE)
- Architecture overview
- Peer-reviewed publications
- Beta access request form

**Live site:** deploy any of the three HTML files directly — no bundler, no framework, no Node.js required.

---

## Screenshots

| Architecture | Health Status |
|---|---|
| ![Architecture](https://raw.githubusercontent.com/man4ish/omnibioai-studio/main/docs/screenshots/architecture.png) | ![Health](https://raw.githubusercontent.com/man4ish/omnibioai-studio/main/docs/screenshots/health.png) |

| Code Coverage | Tool Images |
|---|---|
| ![Coverage](https://raw.githubusercontent.com/man4ish/omnibioai-studio/main/docs/screenshots/coverage.png) | ![Tools](https://raw.githubusercontent.com/man4ish/omnibioai-studio/main/docs/screenshots/tool-images.png) |

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Main landing page — features, downloads, omics coverage, request form |
| `about.html` | About page — team, mission, background |
| `admin.html` | Internal admin/ops view |

---

## Local development

No build step needed. Open directly in a browser:

```bash
# Option 1 — just open the file
open index.html

# Option 2 — serve locally (avoids any browser file:// restrictions)
python -m http.server 8080
# then visit http://localhost:8080
```

---

## Updating download links

Download URLs are hardcoded in `index.html` under the `#download` section. When a new release is tagged in [omnibioai-studio](https://github.com/man4ish/omnibioai-studio), update these links:

```
Current pattern:
https://github.com/man4ish/omnibioai-studio/releases/download/v0.3.0-beta/<artifact>

Artifacts to update:
- OmniBioAI Studio-0.3.0-beta-arm64.dmg          ← macOS Apple Silicon
- OmniBioAI Studio-0.3.0-beta.dmg                ← macOS Intel
- OmniBioAI Studio-0.3.0-beta.AppImage           ← Linux x64
- OmniBioAI Studio-0.3.0-beta-arm64.AppImage     ← Linux ARM64
- omnibioai-studio_0.3.0-beta_amd64.deb          ← Debian/Ubuntu x64
- omnibioai-studio_0.3.0-beta_arm64.deb          ← Debian/Ubuntu ARM64
- omnibioai-studio-0.3.0-beta.x86_64.rpm         ← RHEL/Fedora x64
- omnibioai-studio-0.3.0-beta.aarch64.rpm        ← RHEL/Fedora ARM64
- OmniBioAI Studio Setup 0.3.0-beta.exe          ← Windows x64
```

Also update the version badge in the hero section (`v0.3.0-beta`) and the requirements section.

---

## Updating the beta access form

The request form (`#request` section) currently submits with `onsubmit="return false;"` — it is a static placeholder. To wire it to a real backend:

1. Replace `onsubmit="return false;"` with a `fetch()` POST to your endpoint
2. Or point the form `action` at a service like Formspree, Netlify Forms, or your own Django endpoint
3. Update the submit button handler to show a success/error state

---

## Design system

The site uses no external CSS frameworks. Styles are inline in each HTML file. Key design tokens (defined in `:root`):

| Token | Value | Usage |
|---|---|---|
| `--green` | `#2563eb` | Primary brand color, buttons, accents |
| `--bg` | `#f6f8ff` | Page background |
| `--bg2` | `#ffffff` | Card backgrounds |
| `--text` | `#0b1220` | Primary text |
| `--text-muted` | `#475569` | Secondary text |

Fonts loaded from Google Fonts: `DM Serif Display` (headings), `DM Mono` (code/labels), `Outfit` (body).

---

## Deploying

The site is pure static HTML — deploy anywhere:

```bash
# GitHub Pages (simplest)
# Enable Pages in repo settings → deploy from main branch root

# Netlify drag-and-drop
# Drop the repo folder at app.netlify.com/drop

# nginx (self-hosted)
cp index.html about.html admin.html /var/www/html/
```

No build process, no environment variables, no server-side rendering.

---

## Keeping in sync with releases

This repo should be updated alongside [omnibioai-studio](https://github.com/man4ish/omnibioai-studio) releases. The typical release checklist:

- [ ] Update version string (`v0.3.0-beta` → new version) in hero badge, requirements section, download section
- [ ] Update all download URLs to point to new release tag
- [ ] Update hero stats if plugin/pipeline counts have changed
- [ ] Update publications section if new papers are out
- [ ] Test all download links resolve correctly
- [ ] Deploy

> 💡 Tip: Claude Code can automate this entire checklist.
> Run `claude` in this repo and paste the new version + artifact filenames.

---

## Related repositories

| Repo | Purpose |
|---|---|
| [omnibioai-studio](https://github.com/man4ish/omnibioai-studio) | Electron + React + Vite desktop app |
| [omnibioai](https://github.com/man4ish/omnibioai) | Django backend — 150+ plugin bioinformatics platform |
| [omnibioai-workflow-bundles](https://github.com/man4ish/omnibioai-workflow-bundles) | 600+ bioinformatics pipeline bundles |
| [omnibioai-landing](https://github.com/man4ish/omnibioai-landing) | This landing page |

---

## License

© 2026 OmniBioAI. All rights reserved.
