import type { ReactNode } from 'react';
import { PageShell } from './PageShell';

export interface LegalSection { id: string; title: string; content: ReactNode }

export function LegalLayout({ title, sections }: { title: string; sections: LegalSection[] }) {
  return <PageShell compact><main id="main-content"><header className="legal-hero shell"><p className="eyebrow">Legal</p><h1>{title}</h1><p className="muted">Effective 3 October 2026 · Last updated 3 October 2026</p></header><div className="shell legal-layout"><nav className="legal-toc" aria-label={`${title} contents`}>{sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</nav><article className="legal-content">{sections.map((section) => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.content}</section>)}</article></div></main></PageShell>;
}
