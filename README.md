# Far Shore Notes

A static personal blog built with Astro, ready for Cloudflare Pages.

## Start locally

```bash
npm install
npm run dev
```

## Personalize

1. Edit site name, author, intro, email, and GitHub URL in `src/config.ts`.
2. Replace the sample Markdown files in `src/content/posts/`.
3. Edit the introduction in `src/pages/about.astro`.
4. Set `PUBLIC_SITE_URL` to your final domain during deployment.

## Write a post

Create a Markdown file in `src/content/posts/`:

```md
---
title: My new post
description: A concise summary for search engines and article lists.
published: 2026-08-09
tags: [Notes]
draft: false
---

Start writing here.
```

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `PUBLIC_SITE_URL=https://yourdomain.com`
- Node.js version: 22
