// Optional deployment-time rendering for this standalone HTML page.
// No browser framework, package installation, or runtime environment is needed.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function renderResearchPage(html, endpoint = '') {
  if (endpoint) {
    const parsed = new URL(endpoint);
    const local = ['localhost', '127.0.0.1'].includes(parsed.hostname);
    if ((parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && local)) ||
        parsed.username || parsed.password || parsed.search || parsed.hash ||
        parsed.pathname !== '/api/v1/research-inquiries') {
      throw new Error('Use an HTTPS inquiry endpoint without credentials, query, or fragment; HTTP is allowed only on loopback.');
    }
  }
  const escaped = endpoint.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return html.replace('%VITE_RESEARCH_INQUIRY_URL%', escaped);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (!target) throw new Error('Usage: node html-tools/render-research-page.mjs <new-output-file>');
  const source = await readFile(new URL('../research-collaborations.html', import.meta.url), 'utf8');
  // Never overwrite the maintained source or an existing deployment artifact.
  await writeFile(target, renderResearchPage(source, process.env.VITE_RESEARCH_INQUIRY_URL || ''), { flag: 'wx' });
}
