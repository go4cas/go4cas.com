// go4cas.com static build. Run with: bun run build.ts
//
//   clean dist/ → copy static passthrough → load+validate content →
//   render hubs/lists/articles → write RSS feeds → log summary.
//
// The shipped output is plain HTML/CSS/JS with zero runtime dependencies.

import { rm, cp } from "node:fs/promises";
import { loadContent } from "./lib/content.ts";
import { buildFeed } from "./lib/rss.ts";
import { WORLDS, WORLD_SECTIONS } from "./lib/site.ts";
import { hub, list, article } from "./templates/pages.ts";

const DIST = "dist";

// Explicit allowlist of static passthrough — never a blanket copy of the repo,
// so design/, build.ts, lib/, templates/, content/, README.md can never leak.
const STATIC_PASSTHROUGH = ["index.html", "assets", "site.webmanifest"];

const start = performance.now();
const pages: Array<[route: string, html: string]> = [];

const { items, draftsSkipped, errors } = await loadContent();
if (errors.length) {
  console.error(`\nBuild failed — content validation errors:\n\n  ${errors.join("\n  ")}\n`);
  process.exit(1);
}

for (const world of WORLDS) {
  const worldItems = items.filter((i) => i.world === world);
  const articles = worldItems.filter((i) => i.section);

  const hubItem = worldItems.find((i) => !i.section);
  if (hubItem) pages.push([hubItem.route, hub(hubItem, articles)]);
  else console.warn(`  ⚠ no content/${world}/index.md — hub /${world} not generated`);

  for (const section of WORLD_SECTIONS[world]) {
    const sectionItems = articles.filter((i) => i.section === section);
    if (sectionItems.length) pages.push([`/${world}/${section}`, list(world, section, sectionItems)]);
    for (const item of sectionItems) pages.push([item.route, article(item)]);
  }
}

await rm(DIST, { recursive: true, force: true });
await Promise.all(STATIC_PASSTHROUGH.map((path) => cp(path, `${DIST}/${path}`, { recursive: true })));
// Bun.write creates parent directories as needed.
await Promise.all(pages.map(([route, html]) => Bun.write(`${DIST}${route}/index.html`, html)));

// RSS — always emit a valid feed per world (stable URL even if empty).
const buildDate = new Date();
for (const world of WORLDS) {
  const writing = items.filter((i) => i.world === world && i.section === "writing");
  await Bun.write(`${DIST}/${world}/writing/rss.xml`, buildFeed(world, writing, buildDate));
}

console.log(`\n✓ Built go4cas.com in ${Math.round(performance.now() - start)}ms`);
console.log(`  ${pages.length} pages, ${WORLDS.length} RSS feeds`);
console.log(`  ${draftsSkipped} draft${draftsSkipped === 1 ? "" : "s"} skipped`);
console.log(`  → ${DIST}/\n`);
