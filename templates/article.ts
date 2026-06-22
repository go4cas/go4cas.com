// Article page (<slug>): rendered Markdown body with title, date, summary,
// world accent, a back-link to its section, and the footer.

import { layout } from "./layout.ts";
import { siteHeader, footer, backLink, formatDate } from "./partials.ts";
import { esc } from "../lib/html.ts";
import { SECTION_LABELS } from "../lib/paths.ts";
import type { ContentItem } from "../lib/content.ts";

export function article(item: ContentItem): string {
  const { world, section, frontmatter, routePath, html } = item;
  if (!section) throw new Error(`article() requires a section: ${item.sourcePath}`);

  const dateHtml = frontmatter.date
    ? `<time class="article__date" datetime="${esc(frontmatter.date)}">${esc(formatDate(frontmatter.date))}</time>`
    : "";

  const main = `${siteHeader(world)}
      <article class="article">
        <header class="article-head">
${backLink(world, section)}
          <p class="eyebrow">${esc(SECTION_LABELS[section])}</p>
          <h1 class="article__title">${esc(frontmatter.title)}</h1>
          <p class="article__summary">${esc(frontmatter.summary)}</p>
          ${dateHtml}
        </header>
        <div class="prose">
${html}
        </div>
${backLink(world, section)}
      </article>
${footer()}`;

  return layout({
    title: frontmatter.title,
    description: frontmatter.summary,
    canonicalPath: routePath,
    world,
    ogType: "article",
    main,
  });
}
