// Shared document shell: <head> (meta/OG/fonts/tokens), site header and footer.

import { esc, label, SITE_NAME, SITE_URL, type World } from "../lib/site.ts";

const svg = (attrs: string, body: string) => `<svg viewBox="0 0 24 24" ${attrs} aria-hidden="true">${body}</svg>`;
const stroke = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const ICONS = {
  github: svg('width="18" height="18" fill="currentColor"', `<path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.78.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />`),
  x: svg('width="16" height="16" fill="currentColor"', `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />`),
  instagram: svg(`width="17" height="17" ${stroke}`, `<rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />`),
  email: svg(`width="18" height="18" ${stroke}`, `<rect x="2" y="4" width="20" height="16" rx="2.5" /><path d="M3 6.5l9 6 9-6" />`),
  projects: svg(stroke, `<rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />`),
  writing: svg(stroke, `<path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />`),
  pursuits: svg(stroke, `<circle cx="12" cy="12" r="9" /><path d="m15 9-2 6-4 2 2-6 4-2z" />`),
};

const SOCIALS: Array<[keyof typeof ICONS, string, string]> = [
  ["github", "https://github.com/go4cas", "GitHub — go4cas"],
  ["x", "https://x.com/go4cas", "X — @go4cas"],
  ["instagram", "https://instagram.com/go4cas", "Instagram — @go4cas"],
  ["email", "mailto:hello@go4cas.com", "Email — hello@go4cas.com"],
];

const FAVICON_SIZES = [16, 32, 48, 192, 512];

export interface PageParams {
  world: World; // sets --accent (via body class) + og:image
  title: string; // rendered as "<title> — go4cas"
  description: string;
  route: string; // leading slash, no trailing slash
  main: string; // inner HTML for <main>
  article?: boolean; // og:type article instead of website
  shell?: boolean; // fix header + footer, scroll only the content area
}

export function layout(p: PageParams): string {
  const title = esc(`${p.title} — ${SITE_NAME}`);
  const description = esc(p.description);
  const url = esc(SITE_URL + p.route);
  // Pre-generated 1200×630 JPG cards (scripts/make-og-cards.sh): JPG so
  // scrapers that don't decode AVIF still show a preview.
  const image = `${SITE_URL}/assets/img/og-${p.world}.jpg`;
  const socials = SOCIALS.map(([icon, href, name]) => {
    const external = href.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
    return `          <a class="social" href="${href}"${external} aria-label="${name}">${ICONS[icon]}</a>`;
  }).join("\n");
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
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />

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
  <body class="world-${p.world}${p.shell ? " app-shell" : ""}">
    <header class="site-head">
      <div class="bar">
        <a class="wordmark" href="/">go4cas<span class="wordmark__dot">.com</span></a>
        <a class="world-tag" href="/${p.world}">${label(p.world)}</a>
      </div>
    </header>
    <main class="page">
${p.main}
    </main>
    <footer class="site-foot">
      <div class="bar">
        <nav class="socials" aria-label="Social links">
${socials}
        </nav>
        <p class="foot-note">© go4cas — one human, two worlds.</p>
      </div>
    </footer>
  </body>
</html>
`;
}
