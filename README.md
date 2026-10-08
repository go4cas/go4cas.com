# go4cas.com

My personal site — one human, two worlds. A landing page that fuses a **Work** half and a
**Life** half into one face, with a small two-world content site behind it.

Zero-dependency static site: Markdown content + TypeScript templates compiled by a
[Bun](https://bun.sh) build into `dist/`, served by Cloudflare Workers. `main` auto-deploys.

## Writing content

Everything lives under `content/`, and the path decides the URL:

```
content/<world>/index.md                    /work, /life (world hub)
content/<world>/<section>/index.md          optional intro for /work/projects etc.
content/<world>/<section>/<slug>.md         an entry, e.g. /work/writing/<slug>
content/<world>/<section>/<slug>/index.md   an entry with its own files (images…)
```

Worlds, sections and every frontmatter field are declared once in `lib/schema.ts`.
The build fails with a list of every problem if a file doesn't match it.

| Where | Required | Optional |
| --- | --- | --- |
| World hub | `title`, `summary`, `creed`, `feed` | |
| Section intro | `title`, `summary` | |
| Writing | `title`, `summary`, `date` | `updated`, `tags`, `featured`, `image`, `draft` |
| Projects | `title`, `summary`, `status` (`active`/`shipped`/`archived`) | `year`, `stack`, `links` (`repo`, `site`), `order`, `featured`, `image`, `draft` |
| Pursuits | `title`, `summary` | `since`, `order`, `featured`, `image`, `draft` |

- Writing sorts newest first; projects and pursuits by `order` (lowest first), then title.
- The hub's `summary` and `creed` also fill the landing page (`templates/landing.html`),
  and the creed signs off the hub and every entry, so don't repeat it in Markdown.
- In a folder entry, `![](photo.jpg)` and `image: photo.jpg` (its social card) refer to
  files next to its `index.md`.
