import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://learning-in-loops.pages.dev',
  output: 'static',
  redirects: {
    // Starter-template posts, now drafts.
    '/posts/welcome-aboard': '/posts/',
    '/posts/a-small-web-is-still-a-wide-world': '/posts/',
    // Tag URLs from before tags were slugified and consolidated.
    '/tags/science fiction': '/tags/science-fiction/',
    '/tags/quiet zone': '/tags/quiet-zone/',
    '/tags/research': '/tags/world-models/',
    '/tags/openai': '/tags/economics/',
    '/tags/business': '/tags/economics/',
    '/tags/work': '/tags/economics/',
    '/tags/society': '/tags/economics/',
    '/tags/ownership': '/tags/agents/',
    '/tags/ai': '/tags/',
    '/tags/technology': '/tags/',
    '/tags/web': '/tags/',
    '/tags/notes': '/tags/',
    '/tags/life': '/tags/',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true,
    },
  },
});
