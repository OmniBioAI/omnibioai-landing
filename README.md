# OmniBioAI — Official Landing Page

> Official landing page for **OmniBioAI Studio** — an AI-native, reproducible bioinformatics platform for multi-omics research and workflow automation.

🌐 **Live site:** [omnibioai.org](https://omnibioai.org)  
📺 **Demo:** [Watch on YouTube](https://www.youtube.com/watch?v=oZa-iJcv5bE)

---

## Overview

This repository contains the static HTML/CSS/JS landing page for OmniBioAI Studio. The site is a single-page application with multiple sections covering features, supported omics modalities, system requirements, platform downloads, architecture, publications, and a private beta access request form.

The site is built with vanilla HTML, CSS, and JavaScript — no build tools or frameworks required.

---

## Pages

| File | Description |
|------|-------------|
| `index.html` | Main landing page (hero, features, omics, downloads, architecture, publications, beta form) |
| `about.html` | About page |
| `admin.html` | Beta access admin panel |

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
- Windows installer (NSIS EXE) — 95 MB

All installers include a **30-day free trial license**. Access is gated behind a beta approval form.

---

## Key Platform Stats (v0.4.0-beta)

| Metric | Value |
|--------|-------|
| Bioinformatics pipelines | 50+ |
| Integrated analysis tools | 500+ |
| Plugins | 125+ |
| Agentic pipelines | 10+ |
| Platform microservices | 20+ |

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
         │ Handshake (Sub-3ms Latency)
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

OmniBioAI Studio v0.4.0-beta is in **private beta**. Researchers can apply via the request form on the landing page. Approved researchers receive a platform-specific download link and onboarding support within 1–2 business days.

👉 [Request Access](https://omnibioai.org/#request)

---

## Development

This is a static site — no build step required.

```bash
# Clone the repo
git clone https://github.com/man4ish/omnibioai-landing.git
cd omnibioai-landing

# Serve locally (any static server)
python3 -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080` in your browser.

---

## Related Repositories

| Repo | Description |
|------|-------------|
| [omnibioai-studio](https://github.com/man4ish/omnibioai-studio) | Desktop application (Electron) — releases and installers |

---

## License

© 2026 OmniBioAI. All rights reserved.