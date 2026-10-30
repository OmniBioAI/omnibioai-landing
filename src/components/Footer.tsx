import { ExternalLink } from './ExternalLink';
import { siteConfig } from '../config';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="footer-brand">OmniBioAI</p>
          <p>AI-native bioinformatics for reproducible research.</p>
          <p>© 2026 OmniBioAI. All rights reserved.</p>
        </div>
        <nav aria-label="Footer">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href={`mailto:${siteConfig.contactEmail}`}>Contact</a>
          <ExternalLink href={siteConfig.docsUrl}>Documentation</ExternalLink>
        </nav>
        <div className="footer-social">
          <ExternalLink href="https://github.com/OmniBioAI">GitHub</ExternalLink>
          <ExternalLink href="https://discord.gg/Hu6vgfAFn">Discord</ExternalLink>
          <ExternalLink href="https://twitter.com/OmniBioAI">Twitter</ExternalLink>
        </div>
      </div>
    </footer>
  );
}
