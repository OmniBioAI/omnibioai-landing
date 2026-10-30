import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

function decode(value) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&rarr;|&rightarrow;/g, '→')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .trim();
}

function section(id, nextId) {
  const start = html.indexOf(`<section id="${id}"`);
  const end = html.indexOf(`<section id="${nextId}"`, start + 1);
  if (start < 0 || end < 0) throw new Error(`Unable to locate ${id}`);
  return html.slice(start, end);
}

function groups(source) {
  const blocks = source.split(/<div class="int-group" data-group="/).slice(1);
  return blocks.map((block) => {
    const key = block.match(/^([^"]+)/)?.[1] ?? 'unknown';
    const title = decode(block.match(/class="int-group-title">([\s\S]*?)<\/h3>/)?.[1] ?? key);
    const description = decode(block.match(/class="int-group-sub">([\s\S]*?)<\/p>/)?.[1] ?? '');
    const items = [...block.matchAll(/<a class="int-card" href="([^"]+)"[^>]*>[\s\S]*?<span class="int-name">([\s\S]*?)<\/span>[\s\S]*?<span class="int-desc">([\s\S]*?)<\/span>/g)]
      .map((match) => ({ href: decode(match[1]), name: decode(match[2]), description: decode(match[3]) }));
    return { key, title, description, items };
  });
}

const output = {
  generatedFrom: 'index.html@c171824a51ce565454872c771647b0c755fce80d',
  integrations: groups(section('enterprise-integrations', 'reference-databases')),
  referenceDatabases: groups(section('reference-databases', 'omics')),
};

mkdirSync(resolve(root, 'src/data'), { recursive: true });
writeFileSync(resolve(root, 'src/data/catalogs.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Extracted ${output.integrations.reduce((n, group) => n + group.items.length, 0)} integrations and ${output.referenceDatabases.reduce((n, group) => n + group.items.length, 0)} reference databases.`);
