// RSS 2.0 feed for a world's writing (items arrive newest first).

import { esc, label, SITE_NAME, SITE_URL, FEED_DESCRIPTIONS, type World } from "./site.ts";
import type { ContentItem } from "./content.ts";

export function buildFeed(world: World, writing: ContentItem[], buildDate: Date): string {
  const items = writing
    .map((item) => {
      const link = esc(SITE_URL + item.route);
      const pubDate = (item.date ? new Date(item.date) : buildDate).toUTCString();
      return `    <item>
      <title>${esc(item.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${esc(item.summary)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} · ${label(world)} — Writing</title>
    <link>${SITE_URL}/${world}/writing</link>
    <description>${esc(FEED_DESCRIPTIONS[world])}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/${world}/writing/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>
    <generator>${SITE_NAME} static build</generator>
${items}
  </channel>
</rss>
`;
}
