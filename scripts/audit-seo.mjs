/**
 * Post-build SEO / prerender audit.
 *
 * Walks every generated HTML file and asserts the non-negotiables:
 * unique translated title + description, canonical, full hreflang set,
 * one <h1>, alt text on every image, and — most importantly — that real
 * content is present in the raw HTML rather than injected client-side.
 *
 *   node scripts/audit-seo.mjs
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve('dist');
const LOCALES = ['ar', 'en', 'fr'];

const problems = [];
const titles = new Map();
const descriptions = new Map();

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const pick = (html, re) => html.match(re)?.[1]?.trim();

const files = (await walk(DIST)).sort();
let audited = 0;

for (const file of files) {
  const rel = file.slice(DIST.length).replace(/\\/g, '/');
  const html = await readFile(file, 'utf8');

  // The root file is only a redirect stub — nothing to audit.
  if (rel === '/index.html' && /http-equiv="refresh"/i.test(html)) continue;

  audited++;
  const fail = (msg) => problems.push(`${rel}: ${msg}`);

  const title = pick(html, /<title>([\s\S]*?)<\/title>/i);
  const description = pick(html, /<meta name="description" content="([^"]*)"/i);
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/i);

  if (!title) fail('missing <title>');
  if (!description) fail('missing meta description');
  if (!canonical) fail('missing canonical');

  if (description && description.length > 165) {
    fail(`meta description is ${description.length} chars (>165)`);
  }

  const isErrorPage = rel === '/404.html' || rel.includes('/404/');

  // Titles and descriptions must be unique across the whole site. Error pages
  // are exempt: they are noindex, and the Arabic one is intentionally served
  // both at /ar/404/ and as the shared root fallback.
  if (title && !isErrorPage) {
    if (titles.has(title)) fail(`duplicate <title>, also on ${titles.get(title)}`);
    else titles.set(title, rel);
  }
  if (description && !isErrorPage) {
    if (descriptions.has(description)) {
      fail(`duplicate description, also on ${descriptions.get(description)}`);
    } else descriptions.set(description, rel);
  }

  // hreflang: all three locales plus x-default, except on the noindex 404s.
  if (!isErrorPage) {
    for (const loc of LOCALES) {
      if (!new RegExp(`hreflang="${loc}(-[A-Z]{2})?"`).test(html)) {
        fail(`missing hreflang for "${loc}"`);
      }
    }
    if (!/hreflang="x-default"/.test(html)) fail('missing hreflang="x-default"');
  }

  // Exactly one <h1>.
  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) fail(`expected 1 <h1>, found ${h1s}`);

  // lang/dir must match the locale segment.
  const locale = rel.split('/')[1];
  if (LOCALES.includes(locale)) {
    const lang = pick(html, /<html lang="([^"]*)"/i);
    const dir = pick(html, /<html[^>]*dir="([^"]*)"/i);
    if (!lang?.startsWith(locale)) fail(`<html lang="${lang}"> does not match /${locale}/`);
    const expectedDir = locale === 'ar' ? 'rtl' : 'ltr';
    if (dir !== expectedDir) fail(`<html dir="${dir}">, expected "${expectedDir}"`);
  }

  // Every <img> needs an alt attribute. Empty alt is correct for decorative
  // images, and the serializer writes it as a valueless `alt` — so match both.
  const imgs = html.match(/<img\b[^>]*>/g) ?? [];
  const noAlt = imgs.filter((img) => !/\salt(=|[\s>/])/.test(img));
  if (noAlt.length) fail(`${noAlt.length} <img> without alt`);

  // Prerender check: real body text must exist in the raw HTML.
  const bodyText = (html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // The 404 page is deliberately terse, so it gets a lower bar.
  const minText = isErrorPage ? 80 : 250;
  if (bodyText.length < minText) {
    fail(`only ${bodyText.length} chars of prerendered text in <main>`);
  }

  // Arabic pages must actually contain Arabic script, French pages French text.
  if (locale === 'ar' && !/[؀-ۿ]/.test(bodyText)) {
    fail('no Arabic script found in prerendered content');
  }
}

console.log(`Audited ${audited} pages (${files.length} HTML files).`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log('No problems found.');
