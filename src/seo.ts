import type { RouteId } from './config';
import { siteConfig } from './config';

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
}

export const pageMeta: Record<RouteId, PageMeta> = {
  home: {
    title: 'OmniBioAI — AI-native bioinformatics platform',
    description: 'Reproducible multi-omics analysis, biomedical AI, and workflow orchestration across local, HPC, and cloud environments.',
    canonical: `${siteConfig.origin}/`,
  },
  about: {
    title: 'About the OmniBioAI team',
    description: 'Meet the researchers and engineers building OmniBioAI, an AI-native platform for reproducible multi-omics analysis.',
    canonical: `${siteConfig.origin}/about`,
  },
  privacy: {
    title: 'Privacy Policy — OmniBioAI',
    description: 'How OmniBioAI collects, uses, shares, retains, and protects personal information.',
    canonical: `${siteConfig.origin}/privacy`,
  },
  terms: {
    title: 'Terms of Service — OmniBioAI',
    description: "Terms governing use of OmniBioAI's website, hosted platform, API, and Studio.",
    canonical: `${siteConfig.origin}/terms`,
  },
  admin: {
    title: 'Beta requests admin — OmniBioAI',
    description: 'Restricted OmniBioAI beta request administration.',
    canonical: `${siteConfig.origin}/admin`,
    robots: 'noindex, nofollow, noarchive',
  },
  'not-found': {
    title: 'Page not found — OmniBioAI',
    description: 'The requested OmniBioAI page could not be found.',
    canonical: `${siteConfig.origin}/404.html`,
    robots: 'noindex, follow',
  },
};

export function renderHead(route: RouteId): string {
  const meta = pageMeta[route];
  const structured = route === 'home'
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.origin,
        logo: `${siteConfig.origin}/assets/omnibioai-logo.svg`,
        sameAs: ['https://github.com/OmniBioAI', 'https://twitter.com/OmniBioAI'],
      }).replace(/</g, '\\u003c')
    : '';

  return [
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${meta.description}">`,
    `<meta name="robots" content="${meta.robots ?? 'index, follow'}">`,
    `<link rel="canonical" href="${meta.canonical}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${siteConfig.name}">`,
    `<meta property="og:title" content="${meta.title}">`,
    `<meta property="og:description" content="${meta.description}">`,
    `<meta property="og:url" content="${meta.canonical}">`,
    `<meta property="og:image" content="${siteConfig.origin}/assets/omnibioai-logo.svg">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${meta.title}">`,
    `<meta name="twitter:description" content="${meta.description}">`,
    structured ? `<script type="application/ld+json">${structured}</script>` : '',
  ].filter(Boolean).join('\n    ');
}
