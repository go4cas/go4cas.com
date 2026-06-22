// Dev server: build once, then serve dist/ with clean-URL resolution.
// Run with: bun run dev.ts  →  http://localhost:8000

import { $ } from "bun";

const DIST = "dist";
const PORT = 8000;

// Build first.
await $`bun run build.ts`;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);

    // Block path traversal.
    if (pathname.includes("..")) {
      return new Response("Bad request", { status: 400 });
    }

    // Candidate file paths, in resolution order:
    //   /                     → dist/index.html
    //   /work                 → dist/work/index.html
    //   /assets/css/site.css  → dist/assets/css/site.css
    //   /work/writing/foo     → dist/work/writing/foo/index.html
    const base = `${DIST}${pathname}`;
    const candidates = pathname.endsWith("/")
      ? [`${base}index.html`]
      : [base, `${base}/index.html`];

    for (const candidate of candidates) {
      const file = Bun.file(candidate);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    const notFound = Bun.file(`${DIST}/404.html`);
    if (await notFound.exists()) {
      return new Response(notFound, { status: 404 });
    }
    return new Response("Not found", { status: 404 });
  },
});

console.log(`\n  Serving ${DIST}/ → http://localhost:${server.port}\n`);
