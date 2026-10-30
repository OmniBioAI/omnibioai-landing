import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const serverDir = resolve(root, 'dist-ssr');
const serverEntry = resolve(serverDir, 'entry-server.js');
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const { render } = await import(`${pathToFileURL(serverEntry).href}?v=${Date.now()}`);

const pages = [
  ['/', 'index.html'],
  ['/about', 'about/index.html'],
  ['/about.html', 'about.html'],
  ['/privacy', 'privacy/index.html'],
  ['/privacy.html', 'privacy.html'],
  ['/terms', 'terms/index.html'],
  ['/terms.html', 'terms.html'],
  ['/admin', 'admin/index.html'],
  ['/admin.html', 'admin.html'],
  ['/404.html', '404.html'],
];

for (const [path, output] of pages) {
  const result = render(path);
  const document = template.replace('<!--app-head-->', result.head).replace('<!--app-html-->', result.html);
  const target = resolve(dist, output);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, document);
}

cpSync(resolve(root, 'assets'), resolve(dist, 'assets'), { recursive: true, force: true });
cpSync(resolve(root, 'data'), resolve(dist, 'data'), { recursive: true, force: true });
writeFileSync(resolve(dist, '.nojekyll'), '');
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin.html\n\nSitemap: https://omnibioai.org/sitemap.xml\n`);
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://omnibioai.org/</loc></url>\n  <url><loc>https://omnibioai.org/about</loc></url>\n  <url><loc>https://omnibioai.org/privacy</loc></url>\n  <url><loc>https://omnibioai.org/terms</loc></url>\n</urlset>\n`);

rmSync(serverDir, { recursive: true, force: true });
console.log(`Prerendered ${pages.length} route artifacts.`);
