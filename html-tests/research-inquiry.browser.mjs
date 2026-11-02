// Chromium behavioral integration with deterministic HTTP responses.
// Supply an installed Playwright module and browser executable; no React.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test, { before, after } from 'node:test';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.RESEARCH_PLAYWRIGHT_MODULE || 'playwright');
const html = await readFile(new URL('../research-collaborations.html', import.meta.url), 'utf8');
const pageUrl = 'http://127.0.0.1:18763/research-collaborations';
const siteDataUrl = 'http://127.0.0.1:18763/data/site-data.json';
const endpoint = 'http://127.0.0.1:18764/api/v1/research-inquiries';
const receipt = { status: 'received', inquiry_id: '00000000-0000-4000-8000-000000000001', submitted_at: '2026-11-02T12:00:00Z' };
let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.RESEARCH_CHROMIUM_PATH }); });
after(async () => { await browser?.close(); });

// configured: true uses the fixture endpoint, false publishes none, a string publishes that URL, null serves no site data.
async function open(t, responder, configured = true, viewport = { width: 1280, height: 900 }, inventory = {}) {
  const page = await browser.newPage({ viewport });
  t.after(() => page.close());
  await page.route('**/*', async route => {
    if (route.request().url() === pageUrl) {
      return route.fulfill({ contentType: 'text/html', body: html });
    }
    if (route.request().url() === siteDataUrl) {
      if (configured === null) return route.fulfill({ status: 404, body: '' });
      const url = typeof configured === 'string' ? configured : configured ? endpoint : '';
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ research_inquiry_url: url, research_inventory: inventory }) });
    }
    if (route.request().url() === endpoint) return responder(route);
    return route.abort(); // No fonts, analytics, or external network in fixture tests.
  });
  await page.goto(pageUrl);
  await page.waitForLoadState('networkidle');
  return page;
}

async function fill(page) {
  for (const [id, value] of Object.entries({
    'full-name': 'Synthetic Researcher', email: 'researcher@example.edu', institution: 'Example University',
    department: 'Computational Biology', country: 'United States',
    'proposed-collaboration': 'Synthetic benchmark evaluation only.',
  })) await page.locator('#' + id).fill(value);
  await page.locator('#research-interest').selectOption('multi_omics');
  await page.locator('#consent').check();
}
async function submit(page) {
  await fill(page);
  await page.locator('#submit-button').click();
}
async function expectState(page, value) {
  await page.waitForFunction(state => document.getElementById('form-status').dataset.state === state, value);
}

test('unconfigured endpoint cannot send or confirm', async t => {
  let requests = 0;
  const page = await open(t, () => { requests++; }, false);
  assert.equal(await page.locator('#submit-button').isDisabled(), true);
  await page.locator('form').evaluate(form => form.dispatchEvent(new Event('submit', { cancelable: true })));
  await expectState(page, 'error');
  assert.equal(requests, 0);
  assert.equal(await page.locator('#inquiry-reference').isVisible(), false);
});

test('missing or unsafe published endpoints keep the form disabled', async t => {
  for (const unsafe of [
    null,
    'http://api.example.test/api/v1/research-inquiries',
    'https://token:secret@api.example.test/api/v1/research-inquiries',
    'https://api.example.test/api/v1/research-inquiries?token=secret',
    'https://api.example.test/api/v1/research-inquiries#token',
    'https://api.example.test/admin',
    '/api/v1/research-inquiries',
  ]) {
    const page = await open(t, () => {}, unsafe);
    assert.equal(await page.locator('#submit-button').isDisabled(), true, String(unsafe));
    assert.equal(await page.locator('#full-name').isDisabled(), true, String(unsafe));
    assert.equal(await page.locator('#config-state').getAttribute('data-ready'), 'false');
  }
});

test('inventory values come from site data with built-in fallbacks', async t => {
  const page = await open(t, () => {}, false, undefined, { workflow_bundles: '350+', plugins: 42, codebase_lines: '' });
  assert.equal(await page.locator('[data-inventory=workflow_bundles]').textContent(), '350+');
  assert.equal(await page.locator('[data-inventory=plugins]').textContent(), '500+');
  assert.equal(await page.locator('[data-inventory=codebase_lines]').textContent(), '3M+ lines');
});

test('required fields and consent prevent network submission', async t => {
  let requests = 0;
  const page = await open(t, () => { requests++; });
  await page.locator('#submit-button').click();
  assert.equal(await page.locator('#full-name').getAttribute('aria-invalid'), 'true');
  await fill(page);
  await page.locator('#consent').uncheck();
  await page.locator('#submit-button').click();
  assert.equal(await page.locator('#consent').getAttribute('aria-invalid'), 'true');
  assert.equal(requests, 0);
});

test('success waits for persisted response and displays exact ID', async t => {
  let release;
  let received;
  const pending = new Promise(resolve => { release = resolve; });
  const page = await open(t, async route => {
    received = route.request().postDataJSON();
    await pending;
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(receipt) });
  });
  await submit(page);
  await expectState(page, 'loading');
  assert.equal(await page.locator('#inquiry-reference').isVisible(), false);
  release();
  await expectState(page, 'success');
  assert.equal(received.consent, true);
  assert.equal(received.company_fax, '');
  assert.equal(received.research_interest, 'multi_omics');
  assert.equal(await page.locator('#inquiry-reference').textContent(), 'Inquiry reference: ' + receipt.inquiry_id);
});

for (const [name, status, body] of [
  ['200 is not persisted confirmation', 200, receipt],
  ['missing ID', 201, { status: 'received' }],
  ['invalid ID', 201, { ...receipt, inquiry_id: '<img src=x onerror=alert(1)>' }],
  ['missing timestamp', 201, { status: 'received', inquiry_id: receipt.inquiry_id }],
  ['honeypot 204', 204, null],
  ['database failure', 503, { error: 'Unavailable' }],
  ['duplicate', 409, { error: 'Duplicate' }],
  ['too large', 413, { error: 'Too large' }],
  ['rate limited', 429, { error: 'Too many requests' }],
]) {
  test(name + ' cannot show success', async t => {
    const page = await open(t, route => route.fulfill({
      status, contentType: 'application/json', body: body ? JSON.stringify(body) : '',
    }));
    await submit(page);
    await expectState(page, 'error');
    assert.equal(await page.locator('#inquiry-reference').isVisible(), false);
    assert.equal(await page.locator('#submit-button').isEnabled(), true);
    assert.equal(await page.locator('#full-name').inputValue(), 'Synthetic Researcher');
  });
}

test('validation response renders field error as text', async t => {
  const page = await open(t, route => route.fulfill({ status: 422, contentType: 'application/json',
    body: JSON.stringify({ field_errors: { institutional_email: '<script>unsafe()</script>' } }) }));
  await submit(page);
  await expectState(page, 'error');
  assert.equal(await page.locator('#email-error').textContent(), '<script>unsafe()</script>');
  assert.equal(await page.locator('#email-error script').count(), 0);
});

test('network failure retains entered fields and no reference', async t => {
  const page = await open(t, route => route.abort('failed'));
  await submit(page);
  await expectState(page, 'error');
  assert.match(await page.locator('#form-status').textContent(), /No confirmation/);
  assert.equal(await page.locator('#inquiry-reference').isVisible(), false);
});

test('mobile navigation, labels, privacy, and SEO remain present', async t => {
  const page = await open(t, route => route.abort(), false, { width: 390, height: 844 });
  await page.locator('#nav-toggle').click();
  assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://omnibioai.org/research-collaborations');
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('#form-status').getAttribute('aria-live'), 'polite');
  assert.match(await page.locator('.privacy-callout').textContent(), /patient-identifiable/);
  assert.equal(await page.locator('form input:not([type=hidden]), form select, form textarea').evaluateAll(nodes =>
    nodes.every(node => node.labels.length > 0)), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
});
