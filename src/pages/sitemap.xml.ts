import { getCollection } from 'astro:content';
import { tagSlug } from '../lib/tags';

export async function GET({ site }: { site: URL }) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const tags = [...new Set(posts.flatMap((post) => post.data.tags.map(tagSlug)))];
  const base = site || new URL('https://learning-in-loops.pages.dev');

  const entries: { path: string; priority: string; lastmod?: string }[] = [
    { path: '/', priority: '1.0' },
    { path: '/posts/', priority: '0.9' },
    { path: '/tags/', priority: '0.6' },
    { path: '/about/', priority: '0.5' },
    ...posts.map((post) => ({
      path: `/posts/${post.id}/`,
      priority: '0.8',
      lastmod: (post.data.updated || post.data.published).toISOString(),
    })),
    ...tags.map((tag) => ({ path: `/tags/${tag}/`, priority: '0.5' })),
  ];

  const urls = entries.map(({ path, priority, lastmod }) => `  <url>
    <loc>${new URL(path, base).href}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>\n    ` : ''}<changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
