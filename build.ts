// go4cas.com static build. Run with: bun run build.ts
//
//   clean dist/ → copy static passthrough → load+validate content →
//   render hubs/lists/articles → write RSS feeds → log summary.
//
// The shipped output is plain HTML/CSS/JS with zero runtime dependencies.

import { rm, mkdir, cp } from "node:fs/promises";
import { dirname } from "node:path";
import { loadContent, listRoute, type ContentItem } from "./lib/content.ts";
import { buildFeed } from "./lib/rss.ts";
import { WORLD_SECTIONS, type World, type Section } from "./lib/paths.ts";
import { hub } from "./templates/hub.ts";
import { list } from "./templates/list.ts";
import { article } from "./templates/article.ts";

const DIST = "dist";

// Explicit allowlist of static passthrough — never a blanket copy of the repo,
// so design/, build.ts, lib/, templates/, content/, README.md can never leak.
const STATIC_PASSTHROUGH: Array<{ from: string; to: string }> = [
  { from: "index.html", to: `${DIST}/index.html` },
  { from: "assets", to: `${DIST}/assets` },
  { from: "site.webmanifest", to: `${DIST}/site.webmanifest` },
];

async function writePage(outputPath: string, html: string): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await Bun.write(outputPath, html);
}

async function main() {
  const start = performance.now();
  const buildDate = new Date();

  // 1. Clean.
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // 2. Static passthrough.
  for (const { from, to } of STATIC_PASSTHROUGH) {
    await cp(from, to, { recursive: true });
  }

  // 3. Load + validate content.
  const { items, draftsSkipped, errors } = await loadContent();
  if (errors.length) {
    console.error("\nBuild failed — content validation errors:\n");
    errors.forEach((e) => console.error("  " + e));
    console.error("");
    process.exit(1);
  }

  const counts = { hubs: 0, lists: 0, articles: 0, feeds: 0 };
  const worlds: World[] = ["work", "life"];

  // 4. Render hubs + articles, synthesize section lists.
  for (const world of worlds) {
    const worldItems = items.filter((i) => i.world === world);
    const articles = worldItems.filter((i) => i.kind === "article");

    // Hub.
    const hubItem = worldItems.find((i) => i.kind === "hub");
    if (hubItem) {
      await writePage(hubItem.outputPath, hub(hubItem, articles));
      counts.hubs++;
    } else {
      console.warn(`  ⚠ no content/${world}/index.md — hub /${world} not generated`);
    }

    // Section lists + their articles.
    for (const section of WORLD_SECTIONS[world]) {
      const sectionItems = articles.filter((i) => i.section === section);
      if (sectionItems.length) {
        const { outputPath } = listRoute(world, section);
        await writePage(outputPath, list(world, section, sectionItems));
        counts.lists++;
      }
      for (const item of sectionItems) {
        await writePage(item.outputPath, article(item));
        counts.articles++;
      }
    }

    // 5. RSS — always emit a valid feed per world (stable URL even if empty).
    const writing = articles.filter((i) => i.section === "writing");
    await writePage(`${DIST}/${world}/writing/rss.xml`, buildFeed(world, writing, buildDate));
    counts.feeds++;
  }

  // 6. Summary.
  const ms = Math.round(performance.now() - start);
  console.log(`\n✓ Built go4cas.com in ${ms}ms`);
  console.log(`  ${counts.hubs} hubs, ${counts.lists} section lists, ${counts.articles} articles`);
  console.log(`  ${counts.feeds} RSS feeds`);
  console.log(`  ${draftsSkipped} draft${draftsSkipped === 1 ? "" : "s"} skipped`);
  console.log(`  → ${DIST}/\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
