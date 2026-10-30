export const capabilities = [
  ['⬡', 'Agentic AI reasoning', 'LangGraph orchestration and retrieval-augmented assistants bridge deterministic bio-computation with evidence-grounded interpretation.'],
  ['◈', 'Workflow agnostic', 'Native support for WDL, Nextflow, Snakemake, and CWL across local, cloud, and HPC execution.'],
  ['◎', 'GPU-accelerated stack', 'NVIDIA PyTorch and CUDA support high-performance learning for multi-omics and drug-discovery workloads.'],
  ['⬕', 'End-to-end provenance', 'Model Registry and LIMS-X metadata connect raw inputs, workflow execution, and reported results.'],
  ['◇', 'Reliability-first design', 'Short-lived tokens, role-based access control, auditable operations, and automated service testing.'],
  ['⚙', 'Modular pipeline system', 'Composable workflow steps can be customized or replaced without losing reproducibility.'],
  ['☁', 'Cloud and HPC ready', 'Consistent execution across laptops, Slurm clusters, AWS, Azure, and GCP.'],
  ['⟐', 'Scientific integrations', 'Connect research data, LIMS and ELN systems, object storage, workflow engines, and collaboration tools.'],
] as const;

export const literatureStages = [
  ['Question', 'A natural-language biomedical question, optionally scoped to a research domain.'],
  ['Query expansion', 'Related query variants reduce the chance that relevant evidence is missed due to wording.'],
  ['Vector search', 'Embeddings match against per-domain FAISS indexes and merge candidates by PMID.'],
  ['Hybrid search', 'BM25 keyword retrieval is fused with vector results for domain searches.'],
  ['Re-ranking', 'Candidate abstracts are re-scored before evidence reaches the model.'],
  ['Knowledge graph', 'Optional Neo4j context adds linked biomedical entities.'],
  ['Answer generation', 'A locally hosted model writes from retrieved abstracts.'],
  ['PMID citations', 'Passages retain PubMed identifiers so evidence can be traced.'],
] as const;

export const omics = [
  'Single-cell transcriptomics', 'Whole genome and exome sequencing', 'Proteomics and mass spectrometry',
  'ATAC-seq', 'ChIP-seq', 'Bulk RNA-seq', 'Spatial transcriptomics', 'Structural variant calling',
  'DNA methylation', 'Circular RNA', 'Multi-omics integration', 'CRISPR screens',
  'Variant prioritization', 'Drug target discovery', 'Clinical translational pipelines',
] as const;

export const architecture = [
  ['OmniBioAI Studio and Web Studio', 'Researcher interfaces for projects, data, workflows, and results'],
  ['Agentic AI orchestration', 'LangGraph, local models, retrieval, and governed integrations'],
  ['BioFlow runtime', 'Nextflow, WDL, Snakemake, CWL, and Tool Execution Service'],
  ['LIMS-X and provenance', 'Samples, metadata, model registry, lineage, and audit history'],
  ['Compute infrastructure', 'Local, container, GPU, Slurm, Kubernetes, and public cloud'],
] as const;

export const publications = [
  ['2025', 'Genetic mutations in lymphocytic variant of hypereosinophilic syndrome: study of five siblings', 'Frontiers in Medicine', 'https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2025.1679484/full'],
  ['2018', 'Whole Exome Sequencing identifies common and rare variant Metabolic QTLs in a Middle Eastern Population', 'Nature Communications', 'https://www.nature.com/articles/s41467-017-01972-9'],
  ['2015', 'MetaRNA-Seq: An Interactive Tool to Browse and Annotate Metadata from RNA-Seq Studies', 'BioMed Research International', 'https://onlinelibrary.wiley.com/doi/10.1155/2015/318064'],
] as const;

export const genomes = [
  'Human (GRCh37 / GRCh38)', 'Mouse (GRCm38 / GRCm39)', 'Rat', 'Zebrafish', 'Drosophila', 'C. elegans',
  'Arabidopsis', 'S. cerevisiae', 'E. coli', 'SARS-CoV-2', 'Plasmodium falciparum', 'Macaca mulatta',
] as const;
