// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// NOTE: replace `site` with the real production domain before deploying.
// It is used for canonical URLs, hreflang alternates and sitemap.xml.
const SITE = 'https://alfathgreen.com';

export default defineConfig({
  site: SITE,

  // Pure static output — no server runtime. Suitable for Hostinger shared hosting.
  output: 'static',

  i18n: {
    defaultLocale: 'ar',
    locales: ['ar', 'en', 'fr'],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  // `/` has no content of its own — every page lives under a locale prefix.
  // In a static build this emits a meta-refresh page; public/.htaccess turns it
  // into a proper 301 on Apache hosting (Hostinger).
  redirects: {
    '/': '/ar/',
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ar',
        locales: {
          ar: 'ar-EG',
          en: 'en',
          fr: 'fr',
        },
      },
      filter: (page) => !page.includes('/404'),
    }),
  ],

  build: {
    // Emit `/ar/products/index.html` instead of `/ar/products.html` so the
    // site works on shared hosting without rewrite rules.
    format: 'directory',
  },

  image: {
    // Sharp is bundled; images in src/assets are optimised at build time.
    responsiveStyles: true,
  },
});
