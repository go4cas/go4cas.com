// Section list (/work/projects, /work/writing, /life/pursuits, /life/writing):
// all non-draft items in the section. Writing is reverse-chronological.

import { layout } from "./layout.ts";
import { siteHeader, footer, articleCard } from "./partials.ts";
import { esc } from "../lib/html.ts";
import {
  SECTION_LABELS,
  WORLD_LABELS,
  type World,
  type Section,
} from "../lib/paths.ts";
import { listRoute, type ContentItem } from "../lib/content.ts";

export function list(world: World, section: Section, items: ContentItem[]): string {
  const { routePath } = listRoute(world, section);
  const label = SECTION_LABELS[section];

  const ordered =
    section === "writing"
      ? [...items].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      : [...items].sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));

  const cards = ordered.map(articleCard).join("\n");

  const main = `${siteHeader(world)}
      <div class="list">
        <header class="list-head">
          <p class="eyebrow">${esc(WORLD_LABELS[world])}</p>
          <h1 class="list-title">${esc(label)}</h1>
        </header>
        <ul class="card-list">
${cards}
        </ul>
      </div>
${footer()}`;

  return layout({
    title: `${label} — ${WORLD_LABELS[world]}`,
    description: `${label} from the ${world} world of go4cas.`,
    canonicalPath: routePath,
    world,
    ogType: "website",
    main,
  });
}
