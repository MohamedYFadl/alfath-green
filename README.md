# Al Fath Green — trilingual export site

Static marketing + catalogue site for **Al Fath Green (الفتح جرين)**, an Egyptian
exporter of fresh fruit and vegetables.

- **Stack:** Astro 7, vanilla JS, hand-written CSS with custom properties. No UI framework.
- **Output:** fully prerendered static HTML/CSS/JS — no server runtime.
- **Languages:** Arabic (RTL, default), English, French. Every page exists at
  `/ar/…`, `/en/…`, `/fr/…`.

---

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server on <http://localhost:4321> |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run audit` | Post-build SEO / prerender audit (see below) |
| `npm run verify` | `build` + `audit` in one go — **run this before every deploy** |
| `npm run assets` | Regenerate optimised images from the source photos |

### The audit

`scripts/audit-seo.mjs` walks every generated HTML file and fails the run if any
page is missing a title, meta description, canonical, the full hreflang set, or
exactly one `<h1>`; if a title or description is duplicated anywhere on the site;
if a description runs past 165 characters; if an `<img>` has no `alt`; if
`<html lang>`/`dir` disagree with the URL's locale; or if a page has less than
250 characters of real prerendered text in `<main>` (which would mean content is
being injected client-side instead of at build time).

Current state: **49 pages, 0 problems.**

---

## Project structure

```
src/
├── assets/images/        Optimised images (processed by Astro at build)
├── components/
│   ├── home/             Homepage sections, one file per section
│   └── *.astro           Shared: Header, Footer, cards, Icon, PageHeader…
├── config/site.ts        Company details + navigation — EDIT THIS FIRST
├── content/
│   ├── products/*.json   One file per product, all 3 languages inside
│   └── blog/*.json       One file per post, all 3 languages inside
├── content.config.ts     Zod schemas — missing translations fail the build
├── i18n/
│   ├── ar|en|fr.json     All UI strings and page copy
│   └── index.ts          Locale helpers (localizePath, formatDate…)
├── layouts/BaseLayout.astro   <head>, meta, hreflang, JSON-LD, header/footer
├── pages/[locale]/       Every route; `getStaticPaths` fans out over locales
└── styles/global.css     Design tokens, reset, typography, buttons, motion
```

### Why translations fail loudly

`content.config.ts` requires `ar`, `en` **and** `fr` on every translatable field:

```ts
const localizedString = z.object({
  ar: z.string().min(1),
  en: z.string().min(1),
  fr: z.string().min(1),
});
```

Ship a product with a missing French name and the build stops with the file and
field named. This is deliberate — a half-translated page never reaches production.

---

## ⚠️ Placeholder content — what still needs the client

Everything below is **dummy data written to make the site reviewable**. Structure
is final; only the values need replacing.

### Marked as placeholder in the UI

These render with visible `[brackets]` or an italic note, so nobody mistakes them
for real data:

| Where | What |
|---|---|
| Homepage → About | 4 stat cards: `[XX+]` farms, workers, countries, `[X,XXX]` tonnes |
| Homepage → About | Both body paragraphs (prefixed `[نص مبدئي]` / `[Placeholder copy]`) |
| Homepage → Certificates | Note that the badges await official certificate files |
| Contact → map | Grey placeholder image with a bracketed caption |
| Footer | Note that contact details are provisional |
| All 4 blog posts | Body text opens with a bracketed placeholder line |

### NOT marked — reads as real, but is not

**These are the risky ones.** They look like fact and need sign-off before launch:

| Where | Value | Note |
|---|---|---|
| Homepage → hero cards | **30+** countries, **5,000+** tonnes/year, **15+** years | Unverified business claims |
| `src/config/site.ts` | `+20 100 000 0000`, `info@alfathgreen.com`, "Nile Delta" | Dummy contact details |
| `src/config/site.ts` | Facebook / Instagram / LinkedIn links | Point at the bare platform homepages |
| `astro.config.mjs` | `site: 'https://alfathgreen.com'` | Drives canonicals, hreflang, sitemap |
| All 8 products | Varieties, seasons, carton counts, packing specs | Plausible industry detail, invented |
| Certificates strip | GlobalG.A.P, ISO 22000, HACCP, Export Authority | Claimed, not evidenced |

> If any certification is not actually held, remove it before launch — a false
> certification claim is a legal problem, not a copy problem.

### Real, not placeholder

Photography and video are the client's own files. All 8 products use real
photographs; `cucumber.jpg` is prepared and unused if a ninth product is wanted.

---

## Adding content

### A product

Create `src/content/products/<name>.json`:

```json
{
  "slug": "url-slug",
  "image": "../../assets/images/products/thing.jpg",
  "gallery": ["../../assets/images/products/thing.jpg"],
  "category": "fruits",
  "order": 90,
  "name":        { "ar": "…", "en": "…", "fr": "…" },
  "description": { "ar": "…", "en": "…", "fr": "…" },
  "season":      { "ar": "…", "en": "…", "fr": "…" },
  "packaging":   { "ar": "…", "en": "…", "fr": "…" }
}
```

Image paths are relative to the JSON file. `order` sorts listings (low first).
`gallery` is optional — omit it and the detail page shows the single image.
Pages at `/{locale}/products/{slug}/` are generated automatically.

### A blog post

Same idea in `src/content/blog/`. `content` holds **Markdown** per language, and
`publishDate` must be `YYYY-MM-DD`.

### Changing UI text

All of it lives in `src/i18n/{ar,en,fr}.json` — nav labels, buttons, every
homepage section, form labels, and the per-page SEO titles and descriptions.
Keep descriptions under 165 characters or `npm run audit` will fail.

---

## Contact form (EmailJS)

1. `cp .env.example .env`
2. Fill in the three values from your EmailJS dashboard.
3. Build the EmailJS template around these variables, which match the form fields:
   `{{from_name}}`, `{{from_email}}`, `{{company}}`, `{{country}}`, `{{product}}`, `{{message}}`
4. Restrict the public key to your production domain in the EmailJS dashboard —
   that domain restriction is what actually protects the account.

Until the keys are set, the contact page shows a build-time warning banner and
submissions return a clear "not configured yet" message instead of failing silently.

The form validates in the active language, traps bots with a honeypot field, and
pre-fills the product field from `?product=` (used by the "Request a Quote" button
on every product page).

---

## Images

Source photos live **outside** this folder, in the project root above it.
`npm run assets` (`scripts/prep-assets.mjs`) crops, resizes and converts them into
`src/assets/images/` with ASCII filenames, and copies the videos into `public/videos/`.

Rerun it whenever the client supplies new photography. Astro then generates
responsive WebP at build time — nothing else to do.

**Note:** `public/videos/journey.mp4` is ~18 MB. It is behind `preload="none"` so
it does not affect page load, but the first viewer who presses play waits a while.
Worth compressing before launch:

```bash
ffmpeg -i public/videos/journey.mp4 -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart -c:a aac -b:a 96k public/videos/journey-web.mp4
```

---

## Deploying to Hostinger

1. Set the real domain in `astro.config.mjs` (`site`).
2. `npm run verify` — must report **0 problems**.
3. Upload the **contents** of `dist/` into `public_html/` (not the `dist` folder itself).
4. Confirm `.htaccess` made it across — dot-files are hidden by default in most
   FTP clients and file managers.

`public/.htaccess` handles HTTPS redirect, `/` → `/ar/`, extensionless URLs, the
custom 404, gzip, cache headers, and basic security headers.

### Post-deploy checks

- `https://yourdomain.com/` redirects to `/ar/`
- `https://yourdomain.com/robots.txt` lists the correct sitemap URL
- `https://yourdomain.com/sitemap-index.xml` resolves
- Submit the sitemap in Google Search Console
- Send one real message through the contact form
