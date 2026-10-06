// Page templates: landing, world hub, section list, entry page, 404, and the
// shared entry card. Entries arrive pre-sorted from loadContent().

import { layout, socialLinks } from "./layout.ts";
import { COLLECTIONS, LINK_KINDS, WORLDS, WORLD_KEYS, type LinkKind, type Section, type World } from "../lib/schema.ts";
import { esc, formatDate } from "../lib/site.ts";
import type { Entry, Hub, SectionIntro } from "../lib/content.ts";

const RECENT_WRITING_COUNT = 5;

const time = (cls: string, date: string, prefix = "") =>
  `<time class="${cls}" datetime="${esc(date)}">${prefix}${esc(formatDate(date))}</time>`;
const capitalise = (s: string) => s[0].toUpperCase() + s.slice(1);
const signOff = (hub: Hub) => `<p class="sign-off">${esc(hub.creed)}</p>`;

/** Short facts for a card or entry header: date, status, year, since. */
function facts(entry: Entry): string[] {
  const out: string[] = [];
  if (entry.date) out.push(time("meta__date", entry.date));
  if (entry.status) out.push(`<span class="status status--${entry.status}">${capitalise(entry.status)}</span>`);
  if (entry.year) out.push(`<span>${entry.year}</span>`);
  if (entry.since) out.push(`<span>Since ${entry.since}</span>`);
  return out;
}

const tagList = (entry: Entry, cls: string) =>
  entry.tags.length
    ? `<ul class="tags ${cls}" aria-label="Tags">${entry.tags.map((t) => `<li class="tag">#${esc(t)}</li>`).join("")}</ul>`
    : "";

const linkEntries = (entry: Entry) =>
  (Object.keys(LINK_KINDS) as LinkKind[]).filter((k) => entry.links[k]).map((k) => [k, entry.links[k]!] as const);

/** Linked card. The title is a stretched link covering the card; the outbound
   links in the footer sit above the overlay so they stay independently clickable. */
function card(entry: Entry): string {
  const collection = COLLECTIONS[entry.section];
  const flag = entry.featured ? `<span class="card__flag">Featured</span>` : "";
  const links = linkEntries(entry)
    .map(
      ([kind, url]) =>
        `<a class="card__out" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(entry.title)} — ${LINK_KINDS[kind].label}">${LINK_KINDS[kind].icon(url)}</a>`,
    )
    .join("");
  const meta = facts(entry);
  const metaHtml = meta.length ? `<p class="card__meta">${meta.join('<span aria-hidden="true">·</span>')}</p>` : "";
  const foot = metaHtml || links ? `\n            <div class="card__foot">${metaHtml}${links}</div>` : "";
  return `        <li class="card card--${entry.section}">
            <div class="card__top"><span class="card__kind">${collection.icon}${collection.kind}</span>${flag}</div>
            <h3 class="card__title"><a class="card__link" href="${entry.route}">${esc(entry.title)}</a></h3>
            <p class="card__summary">${esc(entry.summary)}</p>${tagList(entry, "card__tags")}${foot}
        </li>`;
}

const cardList = (entries: Entry[]) => `<ul class="card-list">\n${entries.map(card).join("\n")}\n          </ul>`;

/** Landing page: the hand-crafted templates/landing.html, with its few pieces of
   shared copy ({{work.summary}}, {{life.creed}}, {{socials}} …) filled in. */
export function landing(template: string, hubs: Partial<Record<World, Hub>>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    if (key === "socials") return socialLinks("          ").trimStart();
    const [world, field] = key.split(".") as [World, "summary" | "creed"];
    const value = hubs[world]?.[field];
    if (value === undefined) throw new Error(`templates/landing.html: unknown placeholder {{${key}}}`);
    return esc(value);
  });
}

/** World hub: intro → section links → featured → recent writing → cross-link. */
export function hub(hubItem: Hub, entries: Entry[]): string {
  const { world } = hubItem;
  const other = WORLD_KEYS.find((w) => w !== world)!;
  const sections = WORLDS[world].sections as Section[];
  const featured = entries.filter((e) => e.featured);
  const writing = entries.filter((e) => e.section === "writing").slice(0, RECENT_WRITING_COUNT);
  const block = (heading: string, items: Entry[], more = "") =>
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
          ${signOff(hubItem)}
          <nav class="section-nav" aria-label="${WORLDS[world].label} sections">
${sections.map((s) => `            <a class="section-link" href="/${world}/${s}">${COLLECTIONS[s].label}</a>`).join("\n")}
          </nav>
        </header>
${block("Featured", featured)}
${block("Recent writing", writing, `\n          <a class="more-link" href="/${world}/writing">All writing →</a>`)}
        <a class="cross-link" href="/${other}">↔ the other world — ${WORLDS[other].label}</a>
      </article>`;

  return layout({ world, title: hubItem.title, description: hubItem.summary, route: hubItem.route, shell: true, main });
}

/** Section list: optional intro, then every published entry in the section. */
export function list(world: World, section: Section, entries: Entry[], intro?: SectionIntro): string {
  const heading = intro?.title ?? COLLECTIONS[section].label;
  const introHtml = intro ? `\n          <div class="prose list-intro">\n${intro.html}\n          </div>` : "";
  const main = `      <div class="list">
        <header class="list-head">
          <h1 class="list-title">${esc(heading)}</h1>${introHtml}
        </header>
        ${cardList(entries)}
      </div>`;

  return layout({
    world,
    title: `${heading} — ${WORLDS[world].label}`,
    description: intro?.summary ?? `${COLLECTIONS[section].label} from the ${world} world of go4cas.`,
    route: `/${world}/${section}`,
    shell: true,
    main,
  });
}

/** Entry page: rendered Markdown with its facts, tags, links and back-links. */
export function article(entry: Entry, hubItem: Hub): string {
  const { world, section } = entry;
  const collection = COLLECTIONS[section];
  const backLink = `      <a class="backlink" href="/${world}/${section}">← ${collection.label}</a>`;
  const meta = facts(entry);
  if (entry.updated) meta.push(time("meta__date", entry.updated, "Updated "));
  if (entry.stack.length) meta.push(`<span>${entry.stack.map(esc).join(", ")}</span>`);
  const metaHtml = meta.length ? `\n          <p class="article__meta">${meta.join('<span aria-hidden="true">·</span>')}</p>` : "";
  const links = linkEntries(entry);
  const linksHtml = links.length
    ? `\n          <p class="article__links">${links
        .map(([kind, url]) => `<a class="out-link" href="${esc(url)}" target="_blank" rel="noopener">${LINK_KINDS[kind].icon(url)}${LINK_KINDS[kind].label}</a>`)
        .join("")}</p>`
    : "";

  const main = `      <article class="article">
        <header class="article-head">
${backLink}
          <p class="eyebrow">${collection.label}</p>
          <h1 class="article__title">${esc(entry.title)}</h1>
          <p class="article__summary">${esc(entry.summary)}</p>${metaHtml}${linksHtml}
          ${tagList(entry, "article__tags")}
        </header>
        <div class="prose">
${entry.html}
        </div>
        ${signOff(hubItem)}
${backLink}
      </article>`;

  return layout({
    world,
    title: entry.title,
    description: entry.summary,
    route: entry.route,
    article: true,
    image: entry.image,
    main,
  });
}

/** 404: served by the Worker (and the dev server) for any unknown path. */
export function notFound(): string {
  const main = `      <article class="article">
        <header class="article-head">
          <p class="eyebrow">404</p>
          <h1 class="article__title">Nothing here</h1>
          <p class="article__summary">That page doesn't exist, or it moved.</p>
        </header>
        <p class="section-nav">${WORLD_KEYS.map((w) => `<a class="section-link" href="/${w}">${WORLDS[w].label}</a>`).join(" ")}<a class="section-link" href="/">Home</a></p>
      </article>`;
  return layout({ title: "Not found", description: "Page not found.", route: "/404", main });
}
