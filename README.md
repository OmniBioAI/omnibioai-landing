# OmniBioAI — Official Landing Page

> Official landing page for **OmniBioAI Studio** — an AI-native, reproducible bioinformatics platform for multi-omics research and workflow automation.

🌐 **Live site:** [omnibioai.org](https://omnibioai.org)  
📺 **Demo:** [Watch on YouTube](https://www.youtube.com/watch?v=7REfKSw5qPg)

---

## Overview

This repository contains the independently deployable OmniBioAI public website: static HTML, CSS, and browser JavaScript with no client framework.

Everything the site serves lives in `public/`; Cloudflare Pages publishes only that directory. The landing page, `public/index.html`, is **generated** from `src/` by [Eleventy](https://www.11ty.dev/) and committed; every other page in `public/` is still edited by hand. Tests, tooling, and documentation stay outside `public/` and are never served.

---

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `public/index.html` | Main landing page, product catalogs, publications, and beta form — **generated from `src/`, do not edit directly** (see [How to edit the site](#how-to-edit-the-site)) |
| `/about` | `public/about.html` | About and team page |
| `/research-collaborations` | `public/research-collaborations.html` | Research collaborations and inquiry form |
| `/privacy` | `public/privacy.html` | Privacy policy |
| `/terms` | `public/terms.html` | Terms of service |
| `/admin` | `public/admin.html` | Beta access admin panel (`noindex`, `no-store` via `public/_headers`) |
| any unknown path | `public/404.html` | Not-found page, returned with status 404 (without it, Pages would serve the home page with 200) |

`public/data/site-data.json` holds the catalog figures, the research inventory, and `research_inquiry_url`, the endpoint the inquiry form submits to. `public/_headers` sets the response headers.

---

## Platform Coverage

The download section provides installers for:

**macOS**
- Apple Silicon (ARM64) — DMG · 101 MB
- Intel (x86_64) — DMG · 105 MB

**Linux x86_64**
- AppImage (any distro, Ubuntu 20.04+)
- DEB package (Ubuntu / Debian / Mint)
- RPM package (RHEL / Fedora / CentOS)

**Linux ARM64** (NVIDIA DGX / AWS Graviton / Raspberry Pi)
- AppImage ARM64
- DEB ARM64
- RPM ARM64

**Windows**
- Windows installer (NSIS EXE) — ~90 MB

All installers include a **30-day free trial license**. Access is gated behind a beta approval form.

---

## Key Platform Stats (reviewed 2026-08-23)

The landing page combines repository-specific catalog figures. They are not
interchangeable counts: TES reports configured tool definitions, Workbench
reports enabled plugins, and container availability varies by deployment.

| Metric | Value |
|--------|-------|
| Studio catalog tools | 12,110+ |
| TES tool definitions | 15,012 |
| Workbench plugins | 351 |
| Container inventory | Historical 1,120+ baseline; deployment-dependent |
| Workflow bundles | 350+ |
| Agentic pipelines | 10+ |
| Knowledge domains | 150+ |
| Microservices | 40 services in the current Studio Compose stack |

The Studio download links on this page currently target the `v0.8.0-beta`
artifacts — the latest published release in the Studio repository. No stable
(non-beta) `v0.8.0` release exists yet; update the links and version labels
together when a stable release is cut.

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 16 GB | 32 GB (64 GB with local LLM) |
| Storage | ~5 GB (Docker images) + 50–200 GB data | — |
| OS | Ubuntu 20.04+, macOS 12+, Windows 10/11 (WSL2) | — |
| Docker | Engine 24+ or Docker Desktop | — |
| GPU | Optional (NVIDIA + nvidia-container-toolkit for local LLM) | — |

Fully offline after first boot. Internet required only for initial Docker image pull (~10 GB from ghcr.io).

---

## Supported Omics Modalities

- Single-cell transcriptomics (scRNA-seq)
- Whole exome & genome sequencing (WGS / WES)
- Proteomics & mass spectrometry
- ATAC-seq (chromatin accessibility)
- ChIP-seq (protein-DNA interactions)
- Bulk RNA-seq
- Spatial transcriptomics
- Spatial + single-cell integration
- Structural variant (SV) calling
- DNA methylation / bisulfite sequencing
- Circular RNA (circRNA)
- Multi-omics integration
- CRISPR screen analysis
- Variant prioritization ML
- Drug discovery / GNN-based target identification
- Clinical translational pipelines

---

## Technology Stack

**Languages & Frameworks**
`Python` · `R` · `JavaScript` · `FastAPI` · `Django` · `React`

**Workflow Engines**
`Nextflow` · `WDL` · `Snakemake` · `CWL`

**Bioinformatics Tools**
`GATK` · `Seurat` · `DESeq2`

**AI / ML**
`LangGraph` · `PyTorch` · `CUDA` · `HuggingFace` · `Ollama`

**Infrastructure**
`Docker` · `Kubernetes` · `Slurm` · `AWS` · `Azure` · `GCP`

**Data & Messaging**
`MySQL` · `Redis` · `Celery`

---

## Architecture

```
OmniBioAI Studio UI (Desktop Frontend)
         │ Service handshake & orchestration
Agentic AI Orchestration (LangGraph / Ollama / HuggingFace)
         │ Orchestration & Data Mapping
BioFlow Runtime Engine (Nextflow / WDL / Snakemake)
         │ Tracking & Provenance Link
LIMS-X Metadata & Sample Tracking System
         │ Infrastructure Layer
GPU Accelerated Stack (CUDA / NVIDIA DGX Spark)
```

---

## Publications

Selected peer-reviewed work powered by OmniBioAI platform methods:

- **2025** — *Genetic mutations in lymphocytic variant of hypereosinophilic syndrome: study of five siblings* — Frontiers in Medicine  
- **2018** — *Whole Exome Sequencing identifies common and rare variant Metabolic QTLs in a Middle Eastern Population* — Nature Communications  
- **2015** — *MetaRNA-Seq: An Interactive Tool to Browse and Annotate Metadata from RNA-Seq Studies* — BioMed Research International

---

## Beta Access

OmniBioAI Studio v0.8.0-beta is in **private beta**. Researchers can apply via the request form on the landing page. Approved researchers receive a platform-specific download link and onboarding support within 1–2 business days.

👉 [Request Access](https://omnibioai.org/#request)

---

## How to edit the site

The landing page (`/`) is built from `src/` into `public/index.html`. **Never edit `public/index.html` by hand**: the next build overwrites it, and CI (`.github/workflows/build-check.yml`) fails when the committed file doesn't match what `src/` builds. The other pages (`about.html`, `research-collaborations.html`, `privacy.html`, `terms.html`, `404.html`, `admin.html`) are still plain HTML in `public/`, edited directly.

### Build and preview locally

Requires Node 18+ (CI uses 22).

```bash
npm install          # once
npm run dev          # rebuild on save + live preview at http://localhost:8080
npm run build        # one-off build → public/index.html
npm run check        # build, then fail if public/index.html differs from git
```

Always commit the `src/` change **and** the rebuilt `public/index.html` together.

### Where each section lives

The page is `src/index.njk`, which includes the sections in order. The shared `<head>`, inlined CSS and inlined JS live in `src/_includes/layouts/base.njk`.

| Section (anchor) | Markup | Data | Styles |
|---|---|---|---|
| Nav | `src/_includes/sections/nav.njk` | — | `03-nav.css` |
| Hero + stats | `sections/hero.njk` | organisms count ← `genomes.json` | `01-webstudio-qr.css`, `04-hero.css` |
| Literature AI (`#literature-ai`) | `sections/literature-ai.njk` | — | `06-literature-ai.css` |
| Core capabilities (`#features`) | `sections/capabilities.njk` | — | `07-capabilities.css` |
| Integrations (`#enterprise-integrations`) | `sections/integrations.njk` | `src/data/integrations.json` | `08-integrations.css` |
| Reference databases (`#reference-databases`) | `sections/reference-dbs.njk` | `src/data/referenceDatabases.json` | `08-integrations.css` |
| Catalogs (`#catalogs`) | `sections/catalogs.njk` | `src/data/catalogs.json` | `09-catalogs.css` |
| Omics (`#omics`) | `sections/omics.njk` | `src/data/omics.json` | `10-omics.css` |
| Reference genomes (`#genomes`) | `sections/genomes.njk` | `src/data/genomes.json` | `11-genomes.css` |
| System requirements (hidden, HTML comment) | `sections/requirements.njk` | — | `13-requirements.css` |
| Desktop apps (`#download`) | `sections/desktop-apps.njk` | — | `14-desktop-apps.css` |
| Architecture + PHI (`#architecture`, `#privacy`) | `sections/architecture.njk` | organisms count ← `genomes.json` | `12-architecture.css` |
| Request access form (`#request`) | `sections/request-access.njk`, `sections/toast.njk` | — | `15-request-access.css`, `17-toast.css` |
| Footer | `sections/footer.njk` | — | `16-footer.css` |

- **Styles**: `src/styles/NN-*.css`, and **scripts**: `src/scripts/NN-*.js`. The build inlines every file of each folder into the page's single `<style>` / `<script>`, in filename order, so the numeric prefix sets the cascade and execution order. `02-base.css` holds the colour tokens; `18-responsive.css` holds all media-query overrides (kept last so it wins). The scripts share one classic script scope, so the form's inline `onclick`/`onsubmit` handlers can call the functions they define.
- The integration and reference-database sections share `src/_includes/partials/card-catalog.njk` (filter bar and card groups).
- **Adding a new section**: create `src/_includes/sections/<name>.njk` (start it with a `<!-- ── Name ── -->` comment and a `<section id="…">`), include it at the right place in `src/index.njk`, and add `src/styles/NN-<name>.css` if needed. Pick a number that puts it before `18-responsive.css`.

### Add an integration

Add one object to the right group's `items` in `src/data/integrations.json`:

```json
{
  "name": "Neptune",
  "description": "Experiments, runs and metadata",
  "url": "https://docs.omnibioai.org/integrations/details/neptune/"
}
```

The card, the group count, the filter-button count and the "N integrations across M categories" total are all computed from the file. A new category is a new group object `{ "id", "title", "description", "items": [] }`. Its `id` becomes the filter's `data-group`.

### Add a reference database

Add one object to the right group's `items` in `src/data/referenceDatabases.json`:

```json
{"name": "NewDB", "description": "What it provides"}
```

Cards link to their group's `url` (the docs catalog anchor). Add `"status": "scaffold"` or `"status": "licence required"` for entries that are not connected yet. The implemented / licence-required / scaffolded breakdown and the totals are recomputed. The matching tile in `src/data/catalogs.json` ("Reference database plugins") is a hand-written figure, so update its `detail` text too.

### Add a reference genome

Append one object to `src/data/genomes.json`:

```json
{
  "species": "Felis catus",
  "commonName": "Cat",
  "assemblies": "F.catus_Fca126",
  "annotation": "Ensembl 116",
  "useCases": "Comparative genomics",
  "onDisk": [{"file": "Genome"}, {"file": "GTF"}, {"index": "BWA"}]
}
```

`{"file": …}` renders a grey file badge and `{"index": …}` a green prepared-index badge, in the order listed. The species count in the genomes intro, the hero "Organisms" stat and the architecture tile all follow the number of entries. The rest of the intro sentence (transcripts and prepared indexes) is prose in `sections/genomes.njk`.

### Catalog tiles and omics areas

`src/data/catalogs.json` holds the five catalog tiles: `value`, `label`, `detail`, `url`, plus `attributes`, the `data-*` hooks the page scripts and `site-data.json` use to update the figure at runtime. Keep those hooks as they are. `src/data/omics.json` holds the omics cards: `label`, `title`, `description`, `tags`.

### Runtime figures

Elements with `data-site-stat="<key>"` are overwritten in the browser by `public/data/site-data.json` → `catalogs.<key>`. When you change a count in `src/` that has such a hook (integrations, reference databases, organisms, workflows, plugins, TES tools, API routes, literature indexes), update `site-data.json` too, or visitors will see the old figure once the JSON loads.

## Development

Cloudflare Pages (project `omnibioai-landing`) deploys through its Git integration with no build command and **build output directory `public`**. Every push to `main` deploys production; other branches get preview deployments. Because the generated `public/index.html` is committed, nothing changes on the Pages side and no build runs there. `package.json` exists only for local and CI builds.

For a quick preview without Node, serve `public/` with any static file server, for example:

```bash
python3 -m http.server 8000 --directory public
```

The `Sync Version` workflow rewrites release versions in both `src/_includes/sections/*.njk` and `public/index.html`, so the two stay identical.

Research inquiry form tests (Node 22; the browser suite needs Playwright and Chromium):

```bash
node --test html-tests/research-inquiry.test.mjs
RESEARCH_PLAYWRIGHT_MODULE=<playwright module> RESEARCH_CHROMIUM_PATH=<chromium> node --test html-tests/research-inquiry.browser.mjs
```

## Beta approval release pairing

The beta-request Worker source lives in the private `omnibioai-beta-worker` repository. The live pair is that repository's `live/` Worker and `public/admin.html`; treat them as one tested release unit. `admin-live/admin.html` is the preserved copy of the previously deployed admin page and is not published.

The newer, never-deployed Worker (`next/` in `omnibioai-beta-worker`) pairs with a newer admin page that is not committed here. Test and release them together; do not publish either one independently.

---

## Related Repositories

| Repo | Description |
|------|-------------|
| [omnibioai-studio](https://github.com/OmniBioAI/omnibioai-studio) | Desktop application (Electron) — releases and installers |
| `omnibioai-research-inquiries` (private) | Cloudflare Worker behind the research inquiry form (`inquiries.omnibioai.org`) |
| `omnibioai-beta-worker` (private) | Cloudflare Worker behind the beta access form and admin panel |

---

## License

© 2026 OmniBioAI. All rights reserved.
