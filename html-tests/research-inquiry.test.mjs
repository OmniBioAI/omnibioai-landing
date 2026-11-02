import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { renderResearchPage } from '../html-tools/render-research-page.mjs';

const html = await readFile(new URL('../research-collaborations.html', import.meta.url), 'utf8');

test('keeps the research inquiry integration framework-free', () => {
  assert.match(html, /%VITE_RESEARCH_INQUIRY_URL%/);
  assert.doesNotMatch(html, /\bReact(?:DOM)?\b|createRoot\s*\(/);
  assert.match(html, /fetch\(endpoint,/);
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

test('renders only an environment-specific public URL and leaves content intact', () => {
  const endpoint = 'https://api.example.test/api/v1/research-inquiries';
  const result = renderResearchPage(html, endpoint);
  assert.equal(result.replace(endpoint, '%VITE_RESEARCH_INQUIRY_URL%'), html);
  assert.ok(!renderResearchPage(html).includes('%VITE_RESEARCH_INQUIRY_URL%'));
});

for (const endpoint of [
  'http://api.example.test/api/v1/research-inquiries',
  'https://token:secret@api.example.test/api/v1/research-inquiries',
  'https://api.example.test/api/v1/research-inquiries?token=secret',
  'https://api.example.test/api/v1/research-inquiries#token',
  'https://api.example.test/admin',
]) {
  test('rejects unsafe endpoint ' + endpoint, () => {
    assert.throws(() => renderResearchPage(html, endpoint));
  });
}
