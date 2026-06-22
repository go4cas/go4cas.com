// Reusable page fragments: site header, footer (socials + contact), item cards.

import { esc } from "../lib/html.ts";
import { SECTION_LABELS, WORLD_LABELS, type World } from "../lib/paths.ts";
import type { ContentItem } from "../lib/content.ts";

/** Top bar: wordmark home link + the current world label. */
export function siteHeader(world: World): string {
  return `      <header class="site-head">
        <a class="wordmark" href="/">go4cas<span class="wordmark__dot">.com</span></a>
        <a class="world-tag" href="/${world}">${esc(WORLD_LABELS[world])}</a>
      </header>`;
}

/** A "← back to <section>" link. */
export function backLink(world: World, section: keyof typeof SECTION_LABELS): string {
  return `      <a class="backlink" href="/${world}/${section}">← ${esc(SECTION_LABELS[section])}</a>`;
}

/** Format a YYYY-MM-DD string as a readable date (UTC, locale-stable). */
export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** A linked card for an article in a listing or hub. */
export function articleCard(item: ContentItem): string {
  const { frontmatter, routePath } = item;
  const dateHtml = frontmatter.date
    ? `<time class="card__date" datetime="${esc(frontmatter.date)}">${esc(formatDate(frontmatter.date))}</time>`
    : "";
  const featured = frontmatter.featured ? `<span class="card__flag">Featured</span>` : "";
  return `        <li class="card">
          <a class="card__link" href="${esc(routePath)}">
            <h3 class="card__title">${esc(frontmatter.title)}${featured}</h3>
            <p class="card__summary">${esc(frontmatter.summary)}</p>
            ${dateHtml}
          </a>
        </li>`;
}

/** Site footer: social row (mirrors the landing) + contact. */
export function footer(): string {
  return `      <footer class="site-foot">
        <nav class="socials" aria-label="Social links">
          <a class="social" href="https://github.com/go4cas" target="_blank" rel="noopener" aria-label="GitHub — go4cas">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.78.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" /></svg>
          </a>
          <a class="social" href="https://x.com/go4cas" target="_blank" rel="noopener" aria-label="X — @go4cas">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>
          </a>
          <a class="social" href="https://instagram.com/go4cas" target="_blank" rel="noopener" aria-label="Instagram — @go4cas">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
          </a>
          <a class="social" href="mailto:hello@go4cas.com" aria-label="Email — hello@go4cas.com">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2.5" /><path d="M3 6.5l9 6 9-6" /></svg>
          </a>
        </nav>
        <p class="foot-note">© go4cas — one human, two worlds.</p>
      </footer>`;
}
