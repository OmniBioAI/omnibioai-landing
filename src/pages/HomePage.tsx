import qrUrl from '../../assets/omnibioai-studio-qr.svg';
import siteData from '../../data/site-data.json';
import catalogs from '../data/catalogs.json';
import { AccessForm } from '../components/AccessForm';
import { CatalogSection, type CatalogGroup } from '../components/CatalogSection';
import { ExternalLink } from '../components/ExternalLink';
import { PageShell } from '../components/PageShell';
import { siteConfig } from '../config';
import { architecture, capabilities, genomes, literatureStages, omics, publications } from '../data/content';

export function HomePage() {
  return <PageShell>
    <main id="main-content">
      <section className="hero">
        <div className="shell">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">Private beta — accepting researchers</p>
              <h1>AI-native platform for <em>multi-omics research</em></h1>
              <p className="hero-copy">OmniBioAI unifies reproducible multi-omics analysis, evidence-grounded AI, and scientific workflow infrastructure across local, HPC, and cloud environments.</p>
              <div className="hero-actions">
                <a className="button" href="#request">Request access</a>
                <ExternalLink className="button button-secondary" href={siteConfig.videosUrl}>Watch demo ↗</ExternalLink>
                <ExternalLink className="button button-secondary" href={siteConfig.webStudioUrl}>Try Web Studio ↗</ExternalLink>
              </div>
            </div>
            <ExternalLink className="hero-qr" href={siteConfig.webStudioUrl}>
              <img src={qrUrl} width="248" height="248" alt="QR code for Web Studio" />
              <strong>Open on your phone</strong><span>Scan to launch Web Studio</span>
            </ExternalLink>
          </div>
          <div className="stat-grid" aria-label="Platform catalog summary">
            <div className="stat"><strong>{siteData.catalogs.tes_tools}</strong><span>TES tool definitions</span></div>
            <div className="stat"><strong>{siteData.catalogs.workflows}</strong><span>Workflows</span></div>
            <div className="stat"><strong>{siteData.catalogs.plugins}</strong><span>Workbench plugins</span></div>
            <div className="stat"><strong>{siteData.catalogs.reference_databases}</strong><span>Reference databases documented</span></div>
          </div>
          <p className="muted"><ExternalLink href={siteConfig.controlUrl}>View live platform metrics and health ↗</ExternalLink></p>
        </div>
      </section>

      <section className="section" id="literature-ai">
        <div className="shell">
          <div className="section-head"><div><p className="eyebrow">Biomedical literature intelligence</p><h2>Powered by PubMed. Enhanced by AI.</h2></div><p>Evidence-grounded retrieval over locally indexed abstracts. Answers retain PMID citations so researchers can trace claims back to source literature.</p></div>
          <div className="pipeline">{literatureStages.map(([title, description]) => <article key={title}><h3>{title}</h3><p className="muted">{description}</p></article>)}</div>
          <p className="notice">Indexes are being re-embedded to 1024 dimensions. <ExternalLink href={`${siteConfig.controlUrl}/overview`}>View live re-indexing progress ↗</ExternalLink></p>
        </div>
      </section>

      <section className="section" id="features">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Core capabilities</p><h2>Built for real science, not demos</h2></div><p>Reliability, traceability, portability, and evidence remain first-class requirements across the platform.</p></div>
          <div className="card-grid">{capabilities.map(([icon, title, description]) => <article className="card" key={title}><span className="card-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </div>
      </section>

      <CatalogSection
        id="enterprise-integrations"
        eyebrow="Enterprise and scientific integrations"
        title="Connected across your stack"
        intro="The migrated catalog preserves every integration card present in the baseline."
        groups={catalogs.integrations as CatalogGroup[]}
        docsHref={`${siteConfig.docsUrl}/integrations/`}
      />

      <CatalogSection
        id="reference-databases"
        eyebrow="Biomedical reference databases"
        title="Reference knowledge, one query away"
        intro="Read-only reference plugins span genomic, clinical, protein, chemical, pathway, and ontology resources."
        groups={catalogs.referenceDatabases as CatalogGroup[]}
        docsHref={`${siteConfig.docsUrl}/reference-data/database-catalog/`}
      />

      <section className="section" id="omics">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Multi-omics</p><h2>From raw data to interpretable results</h2></div><p>Modalities already represented by the platform and its documented workflows.</p></div><div className="tag-cloud">{omics.map((item) => <span className="tag" key={item}>{item}</span>)}</div></div>
      </section>

      <section className="section" id="catalogs">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Platform catalogs</p><h2>Discoverable building blocks</h2></div><p>Catalog figures are sourced from the maintained `data/site-data.json` snapshot dated {siteData.updated_at} and describe distinct inventories.</p></div>
          <div className="card-grid">
            <article className="card"><h3>{siteData.catalogs.workflows} workflows</h3><p>Reusable workflow bundles across research domains.</p><ExternalLink href={`${siteConfig.docsUrl}/workflows-catalog/`}>Workflow catalog ↗</ExternalLink></article>
            <article className="card"><h3>{siteData.catalogs.plugins} plugins</h3><p>Workbench extensions and domain integrations.</p><ExternalLink href={`${siteConfig.docsUrl}/plugins/`}>Plugin catalog ↗</ExternalLink></article>
            <article className="card"><h3>{siteData.catalogs.tes_tools} tools</h3><p>Configured Tool Execution Service definitions.</p><ExternalLink href={`${siteConfig.docsUrl}/tools/`}>Tool catalog ↗</ExternalLink></article>
          </div>
        </div>
      </section>

      <section className="section" id="genomes">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Reference organisms</p><h2>Genome assets for twelve organisms</h2></div><p>Reference bundles and annotations are documented in the organism assets catalog.</p></div><div className="tag-cloud">{genomes.map((genome) => <span className="tag" key={genome}>{genome}</span>)}</div><p><ExternalLink href={`${siteConfig.docsUrl}/reference-data/organism-assets/`}>Review organism assets ↗</ExternalLink></p></div>
      </section>

      <section className="section" id="architecture">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Architecture</p><h2>One traceable path through the stack</h2></div><p>A modular architecture separates research interfaces, orchestration, deterministic workflow execution, metadata, and compute.</p></div><div className="architecture">{architecture.map(([title, description]) => <article key={title}><h3>{title}</h3><p className="muted">{description}</p></article>)}</div></div>
      </section>

      <section className="section" id="download">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Desktop applications</p><h2>Coming soon</h2></div><p>macOS, Linux, and Windows installers remain intentionally unavailable while the desktop release is prepared. Web Studio is available for approved users.</p></div><ExternalLink className="button" href={siteConfig.webStudioUrl}>Open Web Studio ↗</ExternalLink></div>
      </section>

      <section className="section" id="publications">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Selected publications</p><h2>Peer-reviewed research</h2></div><p>Existing publications preserved from the baseline site.</p></div>{publications.map(([year, title, journal, href]) => <article className="publication" key={href}><time>{year}</time><div><h3>{title}</h3><p className="muted">{journal}</p></div><ExternalLink href={href}>View paper ↗</ExternalLink></article>)}</div>
      </section>

      <section className="section" id="request">
        <div className="narrow"><div className="section-head"><div><p className="eyebrow">Private beta</p><h2>Request access</h2></div><p>Tell us about your research and preferred platform. Submission is sent only to the existing approved beta-request service.</p></div><AccessForm /></div>
      </section>
    </main>
  </PageShell>;
}
