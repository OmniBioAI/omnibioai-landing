# OmniBioAI — Official Landing Page

> Official landing page for **OmniBioAI Studio** — an AI-native, reproducible bioinformatics platform for multi-omics research and workflow automation.

🌐 **Live site:** [omnibioai.org](https://omnibioai.org)  
📺 **Demo:** [Watch on YouTube](https://www.youtube.com/watch?v=7REfKSw5qPg)

---

## Overview

This repository contains the independently deployable OmniBioAI public website. The deployed site is maintained as standalone HTML, CSS, and browser JavaScript with no React, Node.js, package installation, or build step.

Everything the site serves lives in `public/`; Cloudflare Pages publishes only that directory. Tests, tooling, and documentation stay outside it and are never served.

---

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `public/index.html` | Main landing page, product catalogs, publications, and beta form |
| `/about` | `public/about.html` | About and team page |
| `/research-collaborations` | `public/research-collaborations.html` | Research collaborations and inquiry form |
| `/privacy` | `public/privacy.html` | Privacy policy |
| `/terms` | `public/terms.html` | Terms of service |
| `/admin` | `public/admin.html` | Beta access admin panel (`noindex`, `no-store` via `public/_headers`) |

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

## Development

No package installation or compilation is required. Edit the files in `public/` directly. For a local browser preview, serve that directory with any static file server, for example:

```bash
python3 -m http.server 8000 --directory public
```

Cloudflare Pages (project `omnibioai-landing`) deploys through its Git integration with no build command and **build output directory `public`**. Every push to `main` deploys production; other branches get preview deployments.

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
