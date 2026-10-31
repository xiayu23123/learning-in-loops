#!/usr/bin/env node
// Check that every internal href/src in the built site resolves to a file in
// dist/, and that #fragments point at an id on the target page.
// No dependencies. Usage: node scripts/check-links.mjs [distDir]
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve(process.argv[2] ?? 'dist');
const siteOrigin = new URL(process.env.PUBLIC_SITE_URL || 'https://learning-in-loops.pages.dev').origin;

const ATTR = /\s(href|src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const ID = /\s(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const SKIP_SCHEME = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const isFile = async (file) => {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
};

/** Map a site path ("/posts/x/") to the file Cloudflare Pages would serve, or null. */
async function resolveFile(sitePath) {
  const rel = sitePath.replace(/^\/+/, '');
  const base = path.join(distDir, rel);
  if (!base.startsWith(distDir)) return null;
  const candidates = sitePath.endsWith('/')
    ? [path.join(base, 'index.html')]
    : [base, `${base}.html`, path.join(base, 'index.html')];
  for (const candidate of candidates) if (await isFile(candidate)) return candidate;
  return null;
}

/** Page URL path for an HTML file in dist ("dist/posts/x/index.html" -> "/posts/x/"). */
const pageURL = (file) => {
  const rel = path.relative(distDir, file).split(path.sep).join('/');
  return '/' + (rel.endsWith('index.html') ? rel.slice(0, -'index.html'.length) : rel);
};

const idCache = new Map();
async function idsIn(file) {
  if (!idCache.has(file)) {
    const html = await readFile(file, 'utf8');
    const ids = new Set();
    for (const m of html.matchAll(ID)) ids.add(decodeEntities(m[1] ?? m[2] ?? m[3]));
    idCache.set(file, ids);
  }
  return idCache.get(file);
}

const broken = [];
let checked = 0;
let pages = 0;

for await (const file of walk(distDir)) {
  if (!file.endsWith('.html')) continue;
  pages++;
  const html = (await readFile(file, 'utf8'))
    // Ignore anything inside scripts (JSON-LD, inline code).
    .replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const from = pageURL(file);

  for (const m of html.matchAll(ATTR)) {
    const attr = m[1].toLowerCase();
    const raw = decodeEntities((m[2] ?? m[3] ?? m[4]).trim());
    const values = attr === 'srcset' ? raw.split(',').map((part) => part.trim().split(/\s+/)[0]) : [raw];

    for (let value of values) {
      if (!value) continue;
      if (value.startsWith(siteOrigin + '/') || value === siteOrigin) value = value.slice(siteOrigin.length) || '/';
      else if (SKIP_SCHEME.test(value)) continue;

      checked++;
      const url = new URL(value, `http://site${from}`);
      let sitePath;
      try {
        sitePath = decodeURIComponent(url.pathname);
      } catch {
        broken.push({ from, link: value, reason: 'malformed URL encoding' });
        continue;
      }

      const target = await resolveFile(sitePath);
      if (!target) {
        broken.push({ from, link: value, reason: 'no such file' });
        continue;
      }

      const fragment = url.hash ? decodeURIComponent(url.hash.slice(1)) : '';
      if (fragment && target.endsWith('.html') && !(await idsIn(target)).has(fragment)) {
        broken.push({ from, link: value, reason: `no element with id "${fragment}"` });
      }
    }
  }
}

if (pages === 0) {
  console.error(`No HTML files found in ${distDir}. Run the build first.`);
  process.exit(1);
}

if (broken.length) {
  console.error(`✗ ${broken.length} broken internal link(s) in ${pages} pages:\n`);
  for (const { from, link, reason } of broken) console.error(`  ${from}  →  ${link}  (${reason})`);
  process.exit(1);
}

console.log(`✓ ${checked} internal links in ${pages} pages all resolve.`);
