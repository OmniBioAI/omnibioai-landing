import { PageShell } from '../components/PageShell';

export function NotFoundPage() {
  return <PageShell compact><main className="not-found shell" id="main-content"><div><p className="eyebrow">404</p><h1>Page not found</h1><p className="muted">The address may have changed, or the page may no longer exist.</p><a className="button" href="/">Return home</a></div></main></PageShell>;
}
