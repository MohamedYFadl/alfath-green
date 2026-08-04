import type { APIRoute } from 'astro';

/**
 * Generated rather than kept in public/ so the sitemap URL always tracks
 * `site` in astro.config.mjs instead of drifting when the domain changes.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site ?? 'https://alfathgreen.com');

  const body = `User-agent: *
Allow: /

# Keep robots.txt pure ASCII - some crawlers choke on multibyte comments.
Disallow: /404.html

Sitemap: ${sitemap.href}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
