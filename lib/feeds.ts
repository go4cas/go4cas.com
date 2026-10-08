// Machine-readable outputs: an RSS 2.0 feed per world's writing, and the sitemap.

import { esc, SITE_NAME, SITE_URL } from "./site.ts";
import { WORLDS } from "./schema.ts";
import type { Entry, Hub } from "./content.ts";

/** RSS for a world's writing (entries arrive newest first). */
export function buildFeed(hub: Hub, writing: Entry[], buildDate: Date): string {
  const items = writing
    .map((entry) => {
      const link = esc(SITE_URL + entry.route);
      const categories = entry.tags.map((tag) => `\n      <category>${esc(tag)}</category>`).join("");
      return `    <item>
      <title>${esc(entry.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(entry.summary)}</description>
      <pubDate>${new Date(entry.date!).toUTCString()}</pubDate>${categories}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} · ${WORLDS[hub.world].label} — Writing</title>
    <link>${SITE_URL}${hub.route}/writing</link>
    <description>${esc(hub.feed)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}${hub.route}/writing/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>
    <generator>${SITE_NAME} static build</generator>
${items}
  </channel>
</rss>
`;
}

/** sitemap.xml for every generated page; entries carry their last-changed date. */
export function buildSitemap(pages: Array<{ route: string; lastmod?: string }>): string {
  const urls = pages
    .map(({ route, lastmod }) => {
      const mod = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
      return `  <url><loc>${esc(SITE_URL + (route || "/"))}</loc>${mod}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
