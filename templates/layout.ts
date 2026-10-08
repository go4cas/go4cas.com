// Shared document shell: <head> (meta/OG/fonts/tokens), site header and footer.

import { ICONS } from "../lib/icons.ts";
import { WORLDS, type World } from "../lib/schema.ts";
import { esc, SITE_NAME, SITE_URL, SOCIALS } from "../lib/site.ts";

/** The social icon links, indented for the surrounding markup. */
export function socialLinks(indent: string): string {
  return SOCIALS.map(({ icon, href, name }) => {
    const external = href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
    return `${indent}<a class="social" href="${href}"${external} aria-label="${name}">${ICONS[icon]}</a>`;
  }).join("\n");
}

const FAVICON_SIZES = [16, 32, 48, 192, 512];

export interface PageParams {
  world?: World; // sets --accent (via body class) + og:image + header tag
  title: string; // rendered as "<title> — go4cas"
  description: string;
  route: string; // leading slash, no trailing slash
  main: string; // inner HTML for <main>
  article?: boolean; // og:type article instead of website
  image?: string; // root-relative social image of the page's own (default: its world's card)
  shell?: boolean; // fix header + footer, scroll only the content area
}

export function layout(p: PageParams): string {
  const title = esc(`${p.title} — ${SITE_NAME}`);
  const description = esc(p.description);
  const url = esc(SITE_URL + p.route);
  // Pre-generated 1200×630 JPG cards (scripts/make-og-cards.sh): JPG so
  // scrapers that don't decode AVIF still show a preview.
  const image = SITE_URL + (p.image ?? `/assets/img/og-${p.world ?? "home"}.jpg`);
  const imageSize = p.image ? "" : `
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />`;
  const favicons = FAVICON_SIZES.map(
    (s) => `    <link rel="icon" type="image/png" sizes="${s}x${s}" href="/assets/favicon/favicon-${s}.png" />`,
  ).join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#08080a" />
    <link rel="canonical" href="${url}" />

    <meta property="og:type" content="${p.article ? "article" : "website"}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${esc(image)}" />${imageSize}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${esc(image)}" />

    <link rel="icon" href="/assets/favicon/favicon.ico" sizes="32x32" />
${favicons}
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/favicon-180.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

    <link rel="stylesheet" href="/assets/css/tokens.css" />
    <link rel="stylesheet" href="/assets/css/site.css" />
  </head>
  <body class="${[p.world && `world-${p.world}`, p.shell && "app-shell"].filter(Boolean).join(" ")}">
    <header class="site-head">
      <div class="bar">
        <a class="wordmark" href="/">go4cas<span class="wordmark__dot">.com</span></a>
        ${p.world ? `<a class="world-tag" href="/${p.world}">${WORLDS[p.world].label}</a>` : ""}
      </div>
    </header>
    <main class="page">
${p.main}
    </main>
    <footer class="site-foot">
      <div class="bar">
        <nav class="socials" aria-label="Social links">
${socialLinks("          ")}
        </nav>
        <p class="foot-note">© go4cas — one human, two worlds.</p>
      </div>
    </footer>
  </body>
</html>
`;
}
