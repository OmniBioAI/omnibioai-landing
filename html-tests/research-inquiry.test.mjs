import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../research-collaborations.html', import.meta.url), 'utf8');

test('keeps the research inquiry integration framework-free', () => {
  assert.match(html, /fetch\('data\/site-data\.json'/);
  assert.match(html, /data\.research_inquiry_url/);
  assert.doesNotMatch(html, /%VITE_|research-inquiry-endpoint/);
  assert.doesNotMatch(html, /\bReact(?:DOM)?\b|createRoot\s*\(/);
  assert.match(html, /fetch\(endpoint,/);
});

test('published site data ships with intake disabled and every inventory value', async () => {
  const data = JSON.parse(await readFile(new URL('../data/site-data.json', import.meta.url), 'utf8'));
  assert.equal(typeof data.research_inquiry_url, 'string');
  for (const key of html.matchAll(/data-inventory="([a-z_]+)"/g)) {
    assert.equal(typeof data.research_inventory[key[1]], 'string', `missing research_inventory.${key[1]}`);
  }
});

test('only confirms a genuinely persisted submission', () => {
  assert.match(html, /response\.status===201&&body\.status==='received'/);
  assert.match(html, /typeof body\.inquiry_id==='string'/);
  assert.match(html, /Date.parse\(body.submitted_at\)/);
  assert.match(html, /catch\(error\)/);
  assert.match(html, /No confirmation has been issued/);
});

test('preserves privacy, consent, honeypot, and failure handling', () => {
  for (const expected of [
    'patient-identifiable information',
    'medical records',
    'credentials',
    'company_fax',
    'response.status===409',
    'response.status===413',
    'response.status===429',
  ]) {
    assert.ok(html.includes(expected), `missing ${expected}`);
  }
  assert.match(html, /id="consent"[^>]+required/);
});
