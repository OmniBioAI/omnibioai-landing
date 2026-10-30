export const siteConfig = {
  name: 'OmniBioAI',
  origin: 'https://omnibioai.org',
  workerUrl: 'https://beta-requests.mandecent-gupta.workers.dev',
  docsUrl: 'https://docs.omnibioai.org',
  controlUrl: 'https://control.omnibioai.org',
  webStudioUrl: 'https://webstudio.omnibioai.org',
  videosUrl: 'https://videos.omnibioai.org',
  contactEmail: 'manish@omnibioai.org',
} as const;

export type RouteId = 'home' | 'about' | 'privacy' | 'terms' | 'admin' | 'not-found';

export function routeFromPath(pathname: string): RouteId {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/index.html') return 'home';
  if (path === '/about' || path === '/about.html') return 'about';
  if (path === '/privacy' || path === '/privacy.html') return 'privacy';
  if (path === '/terms' || path === '/terms.html') return 'terms';
  if (path === '/admin' || path === '/admin.html') return 'admin';
  return 'not-found';
}
