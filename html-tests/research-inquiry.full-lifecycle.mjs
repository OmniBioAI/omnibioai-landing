// Genuine local lifecycle test. It refuses to run without explicit disposable URLs.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer, request as httpRequest } from 'node:http';
import { createRequire } from 'node:module';
import test, { before, after } from 'node:test';
import { renderResearchPage } from '../html-tools/render-research-page.mjs';

assert.equal(process.env.RESEARCH_E2E_DISPOSABLE, 'true');
const gateway = new URL(process.env.RESEARCH_E2E_GATEWAY_URL);
const auth = new URL(process.env.RESEARCH_E2E_AUTH_URL);
for (const url of [gateway, auth]) {
  assert.equal(url.protocol, 'http:');
  assert.match(url.hostname, /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/);
}
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.RESEARCH_PLAYWRIGHT_MODULE || 'playwright');
const origin = 'http://127.0.0.1:18763';
const endpoint = 'http://127.0.0.1:18764/api/v1/research-inquiries';
const html = renderResearchPage(await readFile(new URL('../research-collaborations.html', import.meta.url), 'utf8'), endpoint);
const runMarker = randomUUID();
const expected = {
  full_name: 'Local Lifecycle Researcher',
  institutional_email: 'lifecycle-researcher@example.edu',
  institution: 'Synthetic University',
  department: 'Synthetic Systems Biology',
  country: 'United States',
  research_interest: 'multi_omics',
  proposed_collaboration: 'Local-only lifecycle verification ' + runMarker,
  potential_datasets: 'Synthetic public benchmark resources only.',
  institutional_website: 'https://example.edu/research',
  additional_information: 'No patient, medical, confidential, or restricted data.',
};
let pageServer, proxyServer, browser, receipt, submittedPayload, adminToken;
const evidence = { browser_statuses: {}, gateway_trace_present: false };

const listen = (server, port) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, '127.0.0.1', resolve);
});

before(async () => {
  pageServer = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
    res.end(html);
  });
  proxyServer = createServer((req, res) => {
    const upstream = httpRequest(new URL(req.url, gateway), { method: req.method, headers: req.headers }, response => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    });
    upstream.on('error', () => { res.writeHead(503); res.end(); });
    req.pipe(upstream);
  });
  await listen(pageServer, 18763);
  await listen(proxyServer, 18764);
  browser = await chromium.launch({ executablePath: process.env.RESEARCH_CHROMIUM_PATH });
});

after(async () => {
  await browser?.close();
  for (const server of [pageServer, proxyServer]) {
    server?.closeAllConnections();
    await new Promise(resolve => server?.close(resolve) || resolve());
  }
  console.log('LIFECYCLE_EVIDENCE=' + JSON.stringify({ ...evidence, inquiry_id: receipt?.inquiry_id }));
});

async function openPage() {
  const page = await browser.newPage();
  await page.route('**/*', route => {
    const hostname = new URL(route.request().url()).hostname;
    return hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
  await page.goto(origin + '/research-collaborations');
  return page;
}

async function fill(page, changes = {}) {
  const values = { ...expected, ...changes };
  for (const [id, value] of Object.entries({
    'full-name': values.full_name, email: values.institutional_email,
    institution: values.institution, department: values.department, country: values.country,
    'proposed-collaboration': values.proposed_collaboration, datasets: values.potential_datasets,
    website: values.institutional_website, additional: values.additional_information,
  })) await page.locator('#' + id).fill(value);
  await page.locator('#research-interest').selectOption(values.research_interest);
}

async function waitState(page, state) {
  await page.waitForFunction(value => document.getElementById('form-status').dataset.state === value, state);
}

async function publicPost(body, headers = {}) {
  return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...headers }, body });
}

async function admin(path, options = {}) {
  return fetch(new URL('/api/v1/admin/research-inquiries' + path, auth), {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken, ...options.headers },
  });
}

test('service readiness and real Gateway preflight', async () => {
  assert.equal((await fetch(new URL('/health', auth))).status, 200);
  assert.equal((await fetch(new URL('/health', gateway))).status, 200);
  const preflight = await fetch(endpoint, { method: 'OPTIONS', headers: {
    Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type',
  }});
  assert.equal(preflight.status, 200);
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
  evidence.browser_statuses.preflight = 200;
});

test('browser required-field and consent validation prevent requests', async () => {
  const page = await openPage();
  let posts = 0;
  page.on('request', request => { if (request.url() === endpoint && request.method() === 'POST') posts++; });
  try {
    await page.locator('#submit-button').click();
    assert.equal(await page.locator('#full-name').getAttribute('aria-invalid'), 'true');
    await fill(page);
    await page.locator('#submit-button').click();
    assert.equal(await page.locator('#consent').getAttribute('aria-invalid'), 'true');
    assert.equal(posts, 0);
  } finally { await page.close(); }
});

test('browser institutional email validation reaches Auth and creates no receipt', async () => {
  const page = await openPage();
  try {
    await fill(page, { institutional_email: 'synthetic-user@gmail.com' });
    await page.locator('#consent').check();
    const responsePromise = page.waitForResponse(r => r.url() === endpoint && r.request().method() === 'POST');
    await page.locator('#submit-button').click();
    const response = await responsePromise;
    evidence.browser_statuses.invalid_email = response.status();
    assert.equal(response.status(), 422);
    await waitState(page, 'error');
    assert.match(await page.locator('#email-error').textContent(), /valid/i);
    assert.equal(await page.locator('#inquiry-reference').isVisible(), false);
  } finally { await page.close(); }
});

test('browser honeypot is discarded and never shows success', async () => {
  const page = await openPage();
  try {
    await fill(page);
    await page.locator('#consent').check();
    await page.locator('#company-fax').evaluate(node => { node.value = 'synthetic-bot-value'; });
    const responsePromise = page.waitForResponse(r => r.url() === endpoint && r.request().method() === 'POST');
    await page.locator('#submit-button').click();
    const response = await responsePromise;
    evidence.browser_statuses.honeypot = response.status();
    assert.equal(response.status(), 204);
    await waitState(page, 'error');
    assert.equal(await page.locator('#inquiry-reference').isVisible(), false);
  } finally { await page.close(); }
});

test('actual browser form receives genuine persisted receipt', async () => {
  const page = await openPage();
  try {
    await fill(page);
    await page.locator('#consent').check();
    const responsePromise = page.waitForResponse(r => r.url() === endpoint && r.request().method() === 'POST');
    await page.locator('#submit-button').click();
    const response = await responsePromise;
    evidence.browser_statuses.valid = response.status();
    evidence.gateway_trace_present = Boolean(response.headers()['x-trace-id']);
    assert.equal(response.status(), 201);
    receipt = await response.json();
    submittedPayload = response.request().postDataJSON();
    assert.equal(receipt.status, 'received');
    assert.match(receipt.inquiry_id, /^[0-9a-f-]{36}$/i);
    assert.ok(!Number.isNaN(Date.parse(receipt.submitted_at)));
    await waitState(page, 'success');
    assert.equal(await page.locator('#inquiry-reference').textContent(), 'Inquiry reference: ' + receipt.inquiry_id);
  } finally { await page.close(); }
});

test('authorized administration reviews exact details and updates status', async () => {
  const login = await fetch(new URL('/auth/login', auth), { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin-local-test@example.org', password: process.env.RESEARCH_E2E_ADMIN_PASSWORD }) });
  assert.equal(login.status, 200);
  adminToken = (await login.json()).access_token;
  assert.ok(adminToken);
  const list = await admin('?limit=10&status=new');
  assert.equal(list.status, 200);
  const listed = (await list.json()).inquiries;
  assert.equal(listed.length, 1);
  assert.equal(listed[0].inquiry_id, receipt.inquiry_id);
  const detail = await admin('/' + receipt.inquiry_id);
  assert.equal(detail.status, 200);
  assert.equal(detail.headers.get('cache-control'), 'no-store');
  const row = (await detail.json()).inquiry;
  for (const [key, value] of Object.entries(expected)) assert.equal(row[key], value);
  assert.equal(row.notification_status, 'sent');
  assert.equal(row.notification_attempts, 1);
  assert.equal(row.processing_status, 'new');
  assert.ok(!('duplicate_fingerprint' in row));
  const invalid = await admin('/' + receipt.inquiry_id, { method: 'PATCH', body: JSON.stringify({ status: 'unsupported' }) });
  assert.equal(invalid.status, 422);
  const update = await admin('/' + receipt.inquiry_id, { method: 'PATCH', body: JSON.stringify({ status: 'in_review' }) });
  assert.equal(update.status, 200);
  assert.equal((await update.json()).processing_status, 'in_review');
  const retry = await admin('/' + receipt.inquiry_id + '/notifications/retry', { method: 'POST' });
  assert.equal(retry.status, 409);
  evidence.browser_statuses.admin_update = 200;
});

test('administrative and record data are not public', async () => {
  const anonymous = await fetch(new URL('/api/v1/admin/research-inquiries', auth));
  assert.ok([401, 403].includes(anonymous.status));
  const gatewayAdmin = await fetch(new URL('/api/v1/admin/research-inquiries', gateway));
  assert.ok([401, 403].includes(gatewayAdmin.status));
  const lookup = await fetch(endpoint + '/' + receipt.inquiry_id);
  assert.ok([401, 403, 404, 405].includes(lookup.status));
  evidence.browser_statuses.unauthorized_admin = anonymous.status;
});

test('negative wire cases and duplicate never create false success', async () => {
  const duplicate = await publicPost(JSON.stringify(submittedPayload));
  assert.equal(duplicate.status, 409);
  const oversized = await publicPost(JSON.stringify({ data: 'x'.repeat(17_000) }));
  assert.equal(oversized.status, 413);
  const malformed = await publicPost('{');
  assert.equal(malformed.status, 400);
  const unsafe = await publicPost(JSON.stringify({ ...submittedPayload, full_name: 'Unsafe\u0001Name' }));
  assert.equal(unsafe.status, 422);
  evidence.browser_statuses.duplicate = 409;
  evidence.browser_statuses.oversized = 413;
  evidence.browser_statuses.malformed = 400;
  evidence.browser_statuses.control_character = 422;
});

test('real Redis rate limit rejects spoofed-IP attempts', async () => {
  let limited;
  for (let i = 0; i < 12; i++) {
    const response = await publicPost(JSON.stringify(submittedPayload), { 'CF-Connecting-IP': '198.51.100.' + (20 + i) });
    if (response.status === 429) { limited = response; break; }
    assert.equal(response.status, 409);
  }
  assert.ok(limited);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
  evidence.browser_statuses.rate_limited = 429;
});
