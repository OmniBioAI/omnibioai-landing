// Actual local services, not HTTP mocks. Never point this at staging/production.
// Requires disposable Auth/Gateway/Redis/MySQL and synthetic admin credentials.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer, request as httpRequest } from 'node:http';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import test, { before, after } from 'node:test';

assert.equal(process.env.RESEARCH_E2E_DISPOSABLE, 'true', 'Explicit disposable-environment acknowledgement required');
const gateway = new URL(process.env.RESEARCH_E2E_GATEWAY_URL);
const auth = new URL(process.env.RESEARCH_E2E_AUTH_URL);
for (const url of [gateway, auth]) {
  assert.equal(url.protocol, 'http:');
  assert.match(url.hostname, /^(127\.0\.0\.1|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/);
}
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.RESEARCH_PLAYWRIGHT_MODULE || 'playwright');
const origin = 'http://127.0.0.1:18763';
const endpoint = 'http://127.0.0.1:18764/api/v1/research-inquiries';
const html = await readFile(new URL('../public/research-collaborations.html', import.meta.url), 'utf8');
const siteData = JSON.stringify({ research_inquiry_url: endpoint, research_inventory: {} });
let pageServer, proxyServer, browser, receipt, payload, token;
const listen = (server, port) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, '127.0.0.1', resolve);
});

before(async () => {
  pageServer = createServer((req, res) => {
    if (req.url === '/data/site-data.json') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(siteData);
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
  // Loopback test ingress only; forwards the real body/status/headers unchanged.
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
});

async function admin(path, options = {}) {
  return fetch(new URL('/api/v1/admin/research-inquiries' + path, auth), {
    ...options, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, ...options.headers },
  });
}

test('real Chromium form posts through Gateway and returns persisted receipt', async () => {
  const page = await browser.newPage();
  try {
    await page.route('**/*', route => {
      const hostname = new URL(route.request().url()).hostname;
      return hostname === '127.0.0.1' ? route.continue() : route.abort();
    });
    await page.goto(origin + '/research-collaborations');
    for (const [id, value] of Object.entries({
      'full-name': 'OmniBioAI Research Inquiry Local Verification', email: 'researcher@example.edu',
      institution: 'Synthetic Example University', department: 'Synthetic Research', country: 'United States',
      'proposed-collaboration': 'Synthetic local cross-service verification only; run ' + randomUUID(),
    })) await page.locator('#' + id).fill(value);
    await page.locator('#research-interest').selectOption('multi_omics');
    await page.locator('#consent').check();
    const responsePromise = page.waitForResponse(response => response.url() === endpoint && response.request().method() === 'POST');
    await page.locator('#submit-button').click();
    const response = await responsePromise;
    assert.equal(response.status(), 201);
    assert.equal(response.headers()['access-control-allow-origin'], origin);
    receipt = await response.json();
    payload = response.request().postDataJSON();
    await page.waitForFunction(() => document.getElementById('form-status').dataset.state === 'success');
    assert.equal(await page.locator('#inquiry-reference').textContent(), 'Inquiry reference: ' + receipt.inquiry_id);
    assert.equal(receipt.status, 'received');
    console.log('Synthetic persisted inquiry ID: ' + receipt.inquiry_id);
  } finally { await page.close(); }
});

test('real login, authorized review, status update and notification state', async () => {
  assert.ok(receipt);
  const login = await fetch(new URL('/auth/login', auth), { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.org', password: process.env.RESEARCH_E2E_ADMIN_PASSWORD }) });
  assert.equal(login.status, 200);
  token = (await login.json()).access_token;
  assert.ok(token);
  const listing = await admin('?limit=1&status=new');
  assert.equal(listing.status, 200);
  assert.equal((await listing.json()).inquiries[0].inquiry_id, receipt.inquiry_id);
  const detail = await admin('/' + receipt.inquiry_id);
  assert.equal(detail.status, 200);
  assert.equal(detail.headers.get('cache-control'), 'no-store');
  const row = (await detail.json()).inquiry;
  assert.equal(row.notification_status, 'sent');
  assert.equal(row.processing_status, 'new');
  const update = await admin('/' + receipt.inquiry_id, { method: 'PATCH', body: JSON.stringify({ status: 'in_review' }) });
  assert.equal(update.status, 200);
  assert.equal((await update.json()).processing_status, 'in_review');
  const retry = await admin('/' + receipt.inquiry_id + '/notifications/retry', { method: 'POST' });
  assert.equal(retry.status, 409);
});

test('anonymous review and alternate public retrieval are denied', async () => {
  for (const base of [auth, gateway]) {
    const response = await fetch(new URL('/api/v1/admin/research-inquiries', base));
    assert.ok([401, 403].includes(response.status));
  }
  const response = await fetch(endpoint + '/' + receipt.inquiry_id);
  assert.ok([401, 403, 404, 405].includes(response.status));
});

test('same synthetic submission is duplicate, not another success', async () => {
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(payload) });
  assert.equal(response.status, 409);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('unapproved browser origin is denied before persistence', async () => {
  const response = await fetch(endpoint, { method: 'OPTIONS', headers: { Origin: 'https://unapproved.example', 'Access-Control-Request-Method': 'POST' } });
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('real Redis throttles this client and ignores spoofed forwarding headers', async () => {
  let limited;
  for (let i = 0; i < 12; i++) {
    const response = await fetch(endpoint, { method: 'POST', headers: {
      'Content-Type': 'application/json', Origin: origin, 'CF-Connecting-IP': '198.51.100.' + (10 + i),
    }, body: JSON.stringify(payload) });
    if (response.status === 429) { limited = response; break; }
    assert.equal(response.status, 409);
  }
  assert.ok(limited);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
});

test('real service health and inquiry outcome metrics are available internally', async () => {
  const health = await fetch(new URL('/health', auth));
  assert.equal(health.status, 200);
  const response = await fetch(new URL('/metrics', auth));
  assert.equal(response.status, 200);
  const metrics = await response.text();
  assert.match(metrics, /auth_research_inquiry_submissions_total\{outcome="persisted"\} 1\.0/);
  assert.match(metrics, /auth_research_inquiry_submissions_total\{outcome="rate_limited"\} [1-9]/);
  assert.match(metrics, /auth_research_inquiry_notifications_total\{outcome="sent"\} 1\.0/);
  assert.ok(!metrics.includes(payload.institutional_email));
});
