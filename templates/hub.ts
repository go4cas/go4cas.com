// World hub (/work, /life): positioning text → featured → recent writing →
// section links → cross-link to the other world → footer.

import { layout } from "./layout.ts";
import { siteHeader, footer, articleCard } from "./partials.ts";
import { esc } from "../lib/html.ts";
import {
  WORLD_SECTIONS,
  SECTION_LABELS,
  WORLD_LABELS,
  type World,
} from "../lib/paths.ts";
import type { ContentItem } from "../lib/content.ts";

const RECENT_WRITING_COUNT = 5;

export function hub(hubItem: ContentItem, worldItems: ContentItem[]): string {
  const world = hubItem.world;
  const other: World = world === "work" ? "life" : "work";
  const { frontmatter, routePath, html } = hubItem;

  const featured = worldItems.filter((i) => i.frontmatter.featured);
  const writing = worldItems
    .filter((i) => i.section === "writing")
    .sort(sortByDateDesc)
    .slice(0, RECENT_WRITING_COUNT);

  const featuredBlock = featured.length
    ? `        <section class="hub-section">
          <h2 class="section-eyebrow">Featured</h2>
          <ul class="card-list">
${featured.map(articleCard).join("\n")}
          </ul>
        </section>`
    : "";

  const writingBlock = writing.length
    ? `        <section class="hub-section">
          <h2 class="section-eyebrow">Recent writing</h2>
          <ul class="card-list">
${writing.map(articleCard).join("\n")}
          </ul>
          <a class="more-link" href="/${world}/writing">All writing →</a>
        </section>`
    : "";

  const sectionLinks = WORLD_SECTIONS[world]
    .map(
      (s) =>
        `            <a class="section-link" href="/${world}/${s}">${esc(SECTION_LABELS[s])}</a>`,
    )
    .join("\n");

  const main = `${siteHeader(world)}
      <article class="hub">
        <header class="hub-head">
          <p class="eyebrow">${esc(WORLD_LABELS[world])}</p>
          <h1 class="hub-title">${esc(frontmatter.title)}</h1>
          <div class="prose hub-intro">
${html}
          </div>
          <nav class="section-nav" aria-label="${esc(WORLD_LABELS[world])} sections">
${sectionLinks}
          </nav>
        </header>
${featuredBlock}
${writingBlock}
        <a class="cross-link" href="/${other}">↔ the other world — ${esc(WORLD_LABELS[other])}</a>
      </article>
${footer()}`;

  return layout({
    title: frontmatter.title,
    description: frontmatter.summary,
    canonicalPath: routePath,
    world,
    ogType: "website",
    main,
  });
}

function sortByDateDesc(a: ContentItem, b: ContentItem): number {
  return (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0);
}
