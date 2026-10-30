import { render, screen } from '@testing-library/react';
import { App } from '../App';
import { routeFromPath } from '../config';
import { pageMeta, renderHead } from '../seo';

describe('route resolution and pages', () => {
  it.each([
    ['/', 'home'], ['/index.html', 'home'], ['/about', 'about'], ['/about.html', 'about'],
    ['/privacy', 'privacy'], ['/privacy.html', 'privacy'], ['/terms', 'terms'], ['/terms.html', 'terms'],
    ['/admin', 'admin'], ['/admin.html', 'admin'], ['/missing', 'not-found'],
  ] as const)('maps %s to %s', (path, expected) => expect(routeFromPath(path)).toBe(expected));

  it.each([
    ['about', 'Built by researchers, for researchers'],
    ['privacy', 'Privacy Policy'],
    ['terms', 'Terms of Service'],
    ['admin', 'Beta requests'],
    ['not-found', 'Page not found'],
  ] as const)('renders the %s page', (route, heading) => {
    render(<App route={route} />);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('provides unique canonical metadata and keeps admin out of search', () => {
    const canonicals = Object.values(pageMeta).map((meta) => meta.canonical);
    expect(new Set(canonicals).size).toBe(canonicals.length);
    expect(renderHead('home')).toContain('application/ld+json');
    expect(renderHead('admin')).toContain('noindex, nofollow, noarchive');
  });
});
