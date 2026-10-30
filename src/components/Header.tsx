import { useEffect, useRef, useState } from 'react';
import logoUrl from '../../assets/omnibioai-logo.svg';
import { ExternalLink } from './ExternalLink';
import { siteConfig } from '../config';

const primaryLinks = [
  ['Literature AI', '/#literature-ai'],
  ['Features', '/#features'],
  ['Integrations', '/#enterprise-integrations'],
  ['Omics', '/#omics'],
] as const;

export function Header({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setMoreOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);

  const closeMenus = () => {
    setOpen(false);
    setMoreOpen(false);
  };

  return (
    <header className="site-header">
      <nav className="site-nav shell" aria-label="Primary" ref={navRef}>
        <a className="brand" href="/" aria-label="OmniBioAI beta home" onClick={closeMenus}>
          <img src={logoUrl} width="190" height="44" alt="OmniBioAI" />
          <span>beta</span>
        </a>
        <button
          ref={toggleRef}
          className="nav-toggle"
          type="button"
          aria-controls="primary-navigation"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <div className={`nav-panel ${open ? 'is-open' : ''}`} id="primary-navigation">
          {!compact && primaryLinks.map(([label, href]) => <a href={href} key={href} onClick={closeMenus}>{label}</a>)}
          <ExternalLink href={siteConfig.docsUrl}>Docs</ExternalLink>
          <div className="nav-more">
            <button type="button" aria-expanded={moreOpen} aria-controls="more-navigation" onClick={() => setMoreOpen((value) => !value)}>
              More <span aria-hidden="true">▾</span>
            </button>
            <div className={`nav-more-menu ${moreOpen ? 'is-open' : ''}`} id="more-navigation">
              {!compact && <>
                <a href="/#catalogs" onClick={closeMenus}>Catalogs</a>
                <a href="/#reference-databases" onClick={closeMenus}>Reference DBs</a>
                <a href="/#genomes" onClick={closeMenus}>Genomes</a>
                <a href="/#architecture" onClick={closeMenus}>Architecture</a>
                <a href="/#publications" onClick={closeMenus}>Papers</a>
              </>}
              <a href="/about" onClick={closeMenus}>About</a>
              <a href="/privacy" onClick={closeMenus}>Privacy</a>
              <a href="/terms" onClick={closeMenus}>Terms</a>
              <ExternalLink href={`${siteConfig.docsUrl}/developer/`}>Developers ↗</ExternalLink>
              <ExternalLink href={`${siteConfig.docsUrl}/api-reference/`}>API ↗</ExternalLink>
              <ExternalLink href={siteConfig.videosUrl}>Demo ↗</ExternalLink>
              <ExternalLink href={siteConfig.webStudioUrl}>Web app ↗</ExternalLink>
            </div>
          </div>
          <a className="button button-small" href="/#request" onClick={closeMenus}>Request access</a>
        </div>
      </nav>
    </header>
  );
}
