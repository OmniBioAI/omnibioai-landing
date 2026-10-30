import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/index.html', '/about', '/about.html', '/privacy', '/privacy.html', '/terms', '/terms.html', '/admin', '/admin.html'];

test('homepage and primary navigation render from the production build', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AI-native platform');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Built by researchers');
});

for (const route of routes) {
  test(`direct route loads: ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
  });
}

test('unknown route renders the 404 page through static fallback', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('mobile menu supports keyboard interaction', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const toggle = page.locator('.nav-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('contact form validates and submits to the approved endpoint', async ({ page }) => {
  let payload: Record<string, string> | undefined;
  await page.route('https://beta-requests.mandecent-gupta.workers.dev/submit', async (route) => {
    payload = route.request().postDataJSON() as Record<string, string>;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/#request');
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByLabel('First name')).toBeFocused();
  await page.getByLabel('First name').fill('Ada');
  await page.getByLabel('Last name').fill('Lovelace');
  await page.getByLabel('Work or institutional email').fill('ada@example.edu');
  await page.getByLabel('Institution', { exact: true }).fill('Analytical Engine Lab');
  await page.getByLabel('Role').selectOption({ label: 'Research scientist' });
  await page.getByLabel('Primary use case').selectOption({ label: 'Multi-omics analysis' });
  await page.getByLabel('Linux').check();
  await page.getByLabel('Research or workflow needs').fill('Reproducible multi-omics workflows');
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByText(/Request submitted/)).toBeVisible();
  expect(payload?.email).toBe('ada@example.edu');
});

test('contact form exposes a deterministic failure state', async ({ page }) => {
  await page.route('https://beta-requests.mandecent-gupta.workers.dev/submit', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Temporarily unavailable"}' }));
  await page.goto('/#request');
  await page.getByLabel('First name').fill('Ada'); await page.getByLabel('Last name').fill('Lovelace');
  await page.getByLabel('Work or institutional email').fill('ada@example.edu'); await page.getByLabel('Institution', { exact: true }).fill('Lab');
  await page.getByLabel('Role').selectOption({ label: 'Research scientist' }); await page.getByLabel('Primary use case').selectOption({ label: 'Multi-omics analysis' });
  await page.getByLabel('Linux').check(); await page.getByLabel('Research or workflow needs').fill('Reproducible research workflows');
  await page.getByRole('button', { name: 'Submit request' }).click();
  await expect(page.getByText('Temporarily unavailable')).toBeVisible();
});

for (const width of [375, 390, 768, 1280, 1440]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
}

test('representative public pages have no serious automated accessibility violations', async ({ page }) => {
  for (const route of ['/', '/about', '/privacy']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('critical external destinations remain correct', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', 'https://docs.omnibioai.org');
  await expect(page.getByRole('link', { name: /Try Web Studio/ })).toHaveAttribute('href', 'https://webstudio.omnibioai.org');
});

test('admin workflow authenticates, lists, and approves through the existing API boundary', async ({ page }) => {
  const request = { id: 'req-1', first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.edu', institution: 'Analytical Engine Lab', role: 'Research scientist', use_case: 'Multi-omics analysis', platform: 'linux', research: 'Reproducible workflows', status: 'pending', submitted_at: '2026-10-30T12:00:00Z' };
  let approved = false;
  await page.route('https://beta-requests.mandecent-gupta.workers.dev/admin/requests', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ requests: [request] }) }));
  await page.route('https://beta-requests.mandecent-gupta.workers.dev/admin/requests/req-1', async (route) => {
    approved = route.request().method() === 'PATCH' && route.request().headers()['x-admin-key'] === 'test-key';
    await route.fulfill({ status: approved ? 200 : 403, contentType: 'application/json', body: approved ? '{"ok":true}' : '{"error":"Denied"}' });
  });
  await page.goto('/admin');
  await page.getByLabel('Admin password').fill('test-key');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('ada@example.edu')).toBeVisible();
  await page.getByRole('button', { name: 'View' }).click();
  await expect(page.getByRole('dialog')).toContainText('Reproducible workflows');
  await page.getByRole('button', { name: 'Approve and send email' }).click();
  expect(approved).toBe(true);
});

test('captures visual validation evidence', async ({ page }, testInfo) => {
  for (const [name, width, height, route] of [
    ['home-mobile', 390, 844, '/'],
    ['home-tablet', 768, 1024, '/'],
    ['home-desktop', 1440, 1000, '/'],
    ['about-desktop', 1280, 900, '/about'],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto(route);
    await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: false });
  }
});
