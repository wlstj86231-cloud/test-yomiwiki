import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/sitemap.xml.js';

const root = path.resolve(import.meta.dirname, '..', 'public', 'mn');
const pages = [
  ['index.html', 'https://yomiwiki.com/mn/', null],
  ['storage-glossary.html', 'https://yomiwiki.com/mn/storage-glossary', 'https://boribay.com/mn/knowledge/nogoonii-zoor-tohiruulah'],
  ['seed-labels.html', 'https://yomiwiki.com/mn/seed-labels', 'https://boribay.com/mn/knowledge/ur-songoh'],
];
const sitemap = await (await onRequestGet()).text();
for (const [file, url, destination] of pages) {
  const html = await fs.readFile(path.join(root, file), 'utf8');
  assert.match(html, /<html lang="mn">/);
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`), `canonical missing: ${url}`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `one heading expected: ${file}`);
  assert.ok(!html.includes('нэг эзэмшигчийн сайтууд'), `owner statement present: ${file}`);
  const boribayLinks = [...html.matchAll(/<a\b[^>]*href="(https:\/\/boribay\.com\/mn\/knowledge\/[^\"]+)"/g)].map(match => match[1]);
  assert.deepEqual(boribayLinks, destination ? [destination] : [], `unexpected Boribay link: ${file}`);
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap missing: ${url}`);
  if (destination) assert.ok(sitemap.includes(`<loc>${url}</loc><lastmod>2026-09-25</lastmod>`), `sitemap date missing: ${url}`);
  const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];
  assert.equal(JSON.parse(json).inLanguage, 'mn-MN');
  if (destination) assert.equal(JSON.parse(json).dateModified, '2026-09-25');
  if (file !== 'index.html') assert.ok((html.match(/class="sources"/g) ?? []).length === 1 && (html.match(/rel="noopener noreferrer"/g) ?? []).length >= 2, `official sources missing: ${file}`);
}
assert.ok((await fs.readFile(path.resolve(root, '..', 'index.html'), 'utf8')).includes('href="/mn/"'), 'Korean homepage must link to Mongolian hub');
console.log('PASS: YomiWiki /mn/ hub, 2 sourced resources, canonical, sitemap, and home link');
