---
title: "go4cas.com"
summary: "A two-world personal site built on a zero-dependency static pipeline with Bun and TypeScript."
featured: true
repo: "https://github.com/go4cas/go4cas.com"
---

## What it is

go4cas.com is a personal site split into two worlds — work and life — each with
its own projects, pursuits, and writing. The landing page is a single
cross-and-fuse portrait; everything behind it is generated.

## How it's built

The whole site is static. A small build step written in TypeScript and run with
[Bun](https://bun.sh) walks a `content/` tree of Markdown, derives routes from
the file paths, and renders plain HTML with template-literal functions — no
framework, no client-side router.

- **Two build-time dependencies only:** `marked` and `gray-matter`.
- **Zero runtime dependencies:** the shipped output is plain HTML, CSS, and a
  sprinkle of vanilla JS.
- **Clean, shareable URLs:** `/work`, `/life`, and everything below them.

Build with purpose. Ship with speed.
