// go4cas.com static build. Run with: bun run build.ts
//
//   load+validate content → clean dist/ → copy static passthrough →
//   render landing/hubs/lists/entries/404 → copy entry files →
//   write RSS feeds + sitemap → log summary.
//
// The shipped output is plain HTML/CSS/JS with zero runtime dependencies.

import { rm, cp } from "node:fs/promises";
import { loadContent } from "./lib/content.ts";
import { buildFeed, buildSitemap } from "./lib/feeds.ts";
import { WORLDS, WORLD_KEYS, type Section } from "./lib/schema.ts";
import { landing, hub, list, article, notFound } from "./templates/pages.ts";

const DIST = "dist";

// Explicit allowlist of static passthrough — never a blanket copy of the repo,
// so design/, build.ts, lib/, templates/, content/, README.md can never leak.
const STATIC_PASSTHROUGH = ["assets", "site.webmanifest"];

const start = performance.now();
const { hubs, intros, entries, draftsSkipped, errors } = await loadContent();
for (const world of WORLD_KEYS) {
  if (!hubs[world]) errors.push(`✗ content/${world}/index.md is missing (it holds the world's title, creed and feed copy)`);
}
if (errors.length) {
  console.error(`\nBuild failed — content validation errors:\n\n  ${errors.join("\n  ")}\n`);
  process.exit(1);
}

// Pages as [route, html, lastmod?]; "" is the site root.
const pages: Array<{ route: string; html: string; lastmod?: string }> = [
  { route: "", html: landing(await Bun.file("templates/landing.html").text(), hubs) },
];
for (const world of WORLD_KEYS) {
  const hubItem = hubs[world]!;
  const worldEntries = entries.filter((e) => e.world === world);
  pages.push({ route: hubItem.route, html: hub(hubItem, worldEntries) });

  for (const section of WORLDS[world].sections as Section[]) {
    const sectionEntries = worldEntries.filter((e) => e.section === section);
    const intro = intros.get(`${world}/${section}`);
    if (sectionEntries.length || intro) {
      pages.push({ route: `/${world}/${section}`, html: list(world, section, sectionEntries, intro) });
    }
    for (const entry of sectionEntries) {
      pages.push({ route: entry.route, html: article(entry, hubItem), lastmod: entry.updated ?? entry.date });
    }
  }
}

await rm(DIST, { recursive: true, force: true });
await Promise.all(STATIC_PASSTHROUGH.map((path) => cp(path, `${DIST}/${path}`, { recursive: true })));
// Bun.write creates parent directories as needed.
await Promise.all(pages.map(({ route, html }) => Bun.write(`${DIST}${route}/index.html`, html)));
await Bun.write(`${DIST}/404.html`, notFound());
const files = entries.flatMap((e) => e.files.map((src) => [src, `${DIST}${e.route}/${src.split("/").pop()}`]));
await Promise.all(files.map(([src, dest]) => cp(src, dest)));

// RSS — always emit a valid feed per world (stable URL even if empty).
const buildDate = new Date();
for (const world of WORLD_KEYS) {
  const writing = entries.filter((e) => e.world === world && e.section === "writing");
  await Bun.write(`${DIST}/${world}/writing/rss.xml`, buildFeed(hubs[world]!, writing, buildDate));
}
await Bun.write(`${DIST}/sitemap.xml`, buildSitemap(pages));

console.log(`\n✓ Built go4cas.com in ${Math.round(performance.now() - start)}ms`);
console.log(`  ${pages.length} pages + 404, ${WORLD_KEYS.length} RSS feeds, sitemap, ${files.length} entry files`);
console.log(`  ${draftsSkipped} draft${draftsSkipped === 1 ? "" : "s"} skipped`);
console.log(`  → ${DIST}/\n`);
