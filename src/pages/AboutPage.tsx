import praveenUrl from '../../assets/praveen_photo.jpg';
import rajnishUrl from '../../assets/rajnish_kumar.jpg';
import { ExternalLink } from '../components/ExternalLink';
import { PageShell } from '../components/PageShell';
import { publications } from '../data/content';
import { siteConfig } from '../config';

export function AboutPage() {
  return <PageShell compact>
    <main id="main-content">
      <header className="page-hero shell">
        <p className="eyebrow">About OmniBioAI</p>
        <h1>Built by researchers, for researchers</h1>
        <p className="hero-copy">OmniBioAI is an AI-native bioinformatics platform built to unify reproducible multi-omics analysis, evidence-grounded AI, and scientific infrastructure across local, HPC, and cloud environments.</p>
      </header>
      <section className="section">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Mission</p><h2>Why we built this</h2></div><p>Modern bioinformatics is fragmented. Tools break between clusters, pipelines become difficult to reproduce, and literature search remains disconnected from computation.</p></div>
          <div className="card-grid"><article className="card"><h3>Reproducibility</h3><p>Portable workflow definitions, containers, provenance, and governed metadata.</p></article><article className="card"><h3>Evidence</h3><p>Biomedical AI grounded in traceable literature and explicit data sources.</p></article><article className="card"><h3>Access</h3><p>A shared experience across desktop, web, HPC, and cloud execution.</p></article></div>
        </div>
      </section>
      <section className="section">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Team</p><h2>Meet the team</h2></div><p>A growing group of computational scientists, AI engineers, and domain experts building bioinformatics infrastructure.</p></div>
          <div className="team-grid">
            <article className="team-card"><div className="team-photo-placeholder" role="img" aria-label="Manish Kumar">MK</div><div className="team-body"><h3>Manish Kumar</h3><p className="eyebrow">Founder & Creator · Kansas City, USA</p><p>18+ years in bioinformatics and AI platform engineering across five countries. Bioinformatics Programmer at KUMC and creator of OmniBioAI.</p><div className="team-links"><ExternalLink href="https://github.com/man4ish">GitHub ↗</ExternalLink><ExternalLink href="https://www.linkedin.com/in/manishkumar-bioinformatics/">LinkedIn ↗</ExternalLink></div></div></article>
            <article className="team-card"><img src={rajnishUrl} width="640" height="480" alt="Rajnish Kumar, PhD" /><div className="team-body"><h3>Rajnish Kumar, PhD</h3><p className="eyebrow">Scientific Consultant · Warangal, India</p><p>Associate Professor at SR University and former Senior Scientist at KUMC. Expertise includes proteomics, epigenomics, circular RNA, and clinical genomics.</p><div className="team-links"><ExternalLink href="https://www.linkedin.com/in/dr-rajnish-kumar-6704a219/">LinkedIn ↗</ExternalLink><ExternalLink href="https://sru.edu.in/">SR University ↗</ExternalLink></div></div></article>
            <article className="team-card"><img src={praveenUrl} width="640" height="480" alt="Praveen Chakravarthi Veera Raghavulu" /><div className="team-body"><h3>Praveen C. V. Raghavulu</h3><p className="eyebrow">Scientific Advisor · Kansas City, USA</p><p>KUMC researcher with expertise in transcriptomics, RNA editing, computational genomics, reproductive biology, and gene expression.</p><div className="team-links"><ExternalLink href="https://www.kumc.edu/praghavulu.html">KUMC profile ↗</ExternalLink></div></div></article>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell"><div className="section-head"><div><p className="eyebrow">Publications</p><h2>Peer-reviewed research</h2></div><p>Selected publications represented on the original public website.</p></div>{publications.map(([year, title, journal, href]) => <article className="publication" key={href}><time>{year}</time><div><h3>{title}</h3><p className="muted">{journal}</p></div><ExternalLink href={href}>View paper ↗</ExternalLink></article>)}
          <div className="hero-actions"><a className="button" href="/#request">Request beta access</a><a className="button button-secondary" href={`mailto:${siteConfig.contactEmail}`}>Get in touch</a></div>
        </div>
      </section>
    </main>
  </PageShell>;
}
