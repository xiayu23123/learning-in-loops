# Learning in Loops

Source for [learning-in-loops.pages.dev](https://learning-in-loops.pages.dev), my
personal blog: small world models (mostly negative results), essays, and
speculative fiction.

It is a static [Astro](https://astro.build) site. Posts are Markdown files in
`src/content/posts/`.

## Run it locally

Requires Node.js 22.12 or newer and pnpm 10 (`corepack enable` picks up the
version pinned in `package.json`).

```bash
pnpm install
pnpm dev
```

Other scripts:

- `pnpm build` builds the site into `dist/`
- `pnpm check` runs `astro check` (types and templates)
- `pnpm check:links` checks that every internal link in `dist/` resolves (run after a build)
- `pnpm preview` serves the built site
- `node scripts/build-social-card.mjs` re-renders `public/social-card.png` (the link-preview image) after you edit `public/social-card.svg`

## Write a post

Create a Markdown file in `src/content/posts/`. The file name becomes the URL
(`/posts/<file-name>/`).

```md
---
title: My new post
description: One or two sentences for the archive, search results and link previews.
published: 2026-11-01
updated: 2026-11-03     # optional
tags: [World Models]
featured: false         # optional, see below
draft: false            # true hides the post everywhere
---

Start writing here.
```

Tags in use: World Models, Agents, RAG, Evaluation, Economics, Policy,
Science Fiction, Quiet Zone. Reusing them keeps the tag pages useful; a new tag gets its own page
automatically.

The home page shows featured World Models posts under "Research", featured
Science Fiction posts under "Fiction", and the four newest of everything else
under "Latest essays".

## Add a project

Add one entry to `src/data/projects.ts`. `repo` links the code, `post` (a
post's file name) links the write-up; an entry without `repo` is shown as
"In progress".

## Deploy (Cloudflare Pages)

The Cloudflare Pages GitHub integration builds every push. `main` is
production; every other branch gets a preview URL (kept out of search engines
by `public/_headers`).

- Framework preset: Astro
- Build command: `pnpm build`
- Build output directory: `dist`
- Node.js version: 22 (from `.node-version`)
- Optional environment variable: `PUBLIC_SITE_URL` (defaults to `https://learning-in-loops.pages.dev`)

CI (`.github/workflows/ci.yml`) runs `astro check`, the build, the link
checker and Lighthouse on every push and pull request.
