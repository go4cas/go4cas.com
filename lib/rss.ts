// RSS 2.0 feed generation for a world's writing, reverse-chronological.

import { esc } from "./html.ts";
import { SITE, RSS_CHANNEL, absoluteUrl, type World } from "./paths.ts";
import type { ContentItem } from "./content.ts";

/** Build a valid RSS 2.0 feed string for a world's writing items. */
export function buildFeed(world: World, writing: ContentItem[], buildDate: Date): string {
  const channel = RSS_CHANNEL[world];
  const selfLink = absoluteUrl(`/${world}/writing/rss.xml`);
  const channelLink = absoluteUrl(`/${world}/writing`);

  const ordered = [...writing].sort(
    (a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0),
  );

  const items = ordered
    .map((item) => {
      const link = absoluteUrl(item.routePath);
      const pubDate = item.date ? item.date.toUTCString() : buildDate.toUTCString();
      return `    <item>
      <title>${esc(item.frontmatter.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <description>${esc(item.frontmatter.summary)}</description>
      <pubDate>${esc(pubDate)}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(channel.title)}</title>
    <link>${esc(channelLink)}</link>
    <description>${esc(channel.description)}</description>
    <language>en</language>
    <atom:link href="${esc(selfLink)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${esc(buildDate.toUTCString())}</lastBuildDate>
    <generator>${esc(SITE.name)} static build</generator>
${items}
  </channel>
</rss>
`;
}
