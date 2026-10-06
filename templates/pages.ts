// Page templates: world hub, section list, article, and the shared item card.
// Items arrive pre-sorted (newest first, then by title) from loadContent().

import { layout, ICONS } from "./layout.ts";
import { esc, label, formatDate, WORLD_SECTIONS, type World, type Section } from "../lib/site.ts";
import type { ContentItem } from "../lib/content.ts";

const RECENT_WRITING_COUNT = 5;
const KIND_LABELS: Record<Section, string> = { projects: "Project", writing: "Writing", pursuits: "Pursuit" };

const time = (cls: string, date?: string) =>
  date ? `<time class="${cls}" datetime="${esc(date)}">${esc(formatDate(date))}</time>` : "";

/** Linked card. The title is a stretched link covering the card; the repo link
   in the footer sits above the overlay so it stays independently clickable. */
function card(item: ContentItem): string {
  const section = item.section!;
  const flag = item.featured ? `<span class="card__flag">Featured</span>` : "";
  const repo = item.repo
    ? `<a class="card__repo" href="${esc(item.repo)}" target="_blank" rel="noopener" aria-label="${esc(item.title)} on GitHub">${ICONS.github}</a>`
    : "";
  const date = time("card__date", item.date);
  const foot = date || repo ? `\n            <div class="card__foot">${date}${repo}</div>` : "";
  return `        <li class="card card--${section}">
            <div class="card__top"><span class="card__kind">${ICONS[section]}${KIND_LABELS[section]}</span>${flag}</div>
            <h3 class="card__title"><a class="card__link" href="${item.route}">${esc(item.title)}</a></h3>
            <p class="card__summary">${esc(item.summary)}</p>${foot}
        </li>`;
}

const cardList = (items: ContentItem[]) => `<ul class="card-list">\n${items.map(card).join("\n")}\n          </ul>`;

/** World hub: intro → section links → featured → recent writing → cross-link. */
export function hub(hubItem: ContentItem, articles: ContentItem[]): string {
  const { world } = hubItem;
  const other: World = world === "work" ? "life" : "work";
  const featured = articles.filter((i) => i.featured);
  const writing = articles.filter((i) => i.section === "writing").slice(0, RECENT_WRITING_COUNT);
  const block = (heading: string, items: ContentItem[], more = "") =>
    items.length
      ? `        <section class="hub-section">
          <h2 class="section-eyebrow">${heading}</h2>
          ${cardList(items)}${more}
        </section>`
      : "";

  const main = `      <article class="hub">
        <header class="hub-head">
          <h1 class="hub-title">${esc(hubItem.title)}</h1>
          <div class="prose hub-intro">
${hubItem.html}
          </div>
          <nav class="section-nav" aria-label="${label(world)} sections">
${WORLD_SECTIONS[world].map((s) => `            <a class="section-link" href="/${world}/${s}">${label(s)}</a>`).join("\n")}
          </nav>
        </header>
${block("Featured", featured)}
${block("Recent writing", writing, `\n          <a class="more-link" href="/${world}/writing">All writing →</a>`)}
        <a class="cross-link" href="/${other}">↔ the other world — ${label(other)}</a>
      </article>`;

  return layout({ world, title: hubItem.title, description: hubItem.summary, route: hubItem.route, shell: true, main });
}

/** Section list: every published item in one section of a world. */
export function list(world: World, section: Section, items: ContentItem[]): string {
  const main = `      <div class="list">
        <header class="list-head">
          <h1 class="list-title">${label(section)}</h1>
        </header>
        ${cardList(items)}
      </div>`;

  return layout({
    world,
    title: `${label(section)} — ${label(world)}`,
    description: `${label(section)} from the ${world} world of go4cas.`,
    route: `/${world}/${section}`,
    shell: true,
    main,
  });
}

/** Article page: rendered Markdown with title, summary, date and back-links. */
export function article(item: ContentItem): string {
  const { world, section } = item;
  const backLink = `      <a class="backlink" href="/${world}/${section}">← ${label(section!)}</a>`;
  const main = `      <article class="article">
        <header class="article-head">
${backLink}
          <p class="eyebrow">${label(section!)}</p>
          <h1 class="article__title">${esc(item.title)}</h1>
          <p class="article__summary">${esc(item.summary)}</p>
          ${time("article__date", item.date)}
        </header>
        <div class="prose">
${item.html}
        </div>
${backLink}
      </article>`;

  return layout({ world, title: item.title, description: item.summary, route: item.route, article: true, main });
}
