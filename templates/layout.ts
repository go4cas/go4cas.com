// Shared document shell: <head> builder (tokens/fonts/meta/OG) + full page wrapper.

import { esc } from "../lib/html.ts";
import { SITE, absoluteUrl, defaultOgImage, type World } from "../lib/paths.ts";

export interface HeadParams {
  title: string; // page title; rendered as "<title> — go4cas"
  description: string; // also og/twitter description
  canonicalPath: string; // leading slash, no trailing slash (except "/")
  world?: World; // sets --accent (via body class) + default og:image
  ogType?: "website" | "article";
  ogImage?: string; // absolute; defaults from world when omitted
}

const FAVICONS = `
    <link rel="icon" href="/assets/favicon/favicon.ico" sizes="32x32" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon/favicon-48.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon/favicon-192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/assets/favicon/favicon-512.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/favicon-180.png" />
    <link rel="manifest" href="/site.webmanifest" />`;

const FONTS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />`;

export function head(p: HeadParams): string {
  const fullTitle = `${p.title} — ${SITE.name}`;
  const url = absoluteUrl(p.canonicalPath);
  const image = p.ogImage ?? defaultOgImage(p.world);
  const ogType = p.ogType ?? "website";

  return `    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(fullTitle)}</title>
    <meta name="description" content="${esc(p.description)}" />
    <meta name="theme-color" content="#08080a" />
    <link rel="canonical" href="${esc(url)}" />

    <meta property="og:type" content="${esc(ogType)}" />
    <meta property="og:site_name" content="${esc(SITE.name)}" />
    <meta property="og:title" content="${esc(fullTitle)}" />
    <meta property="og:description" content="${esc(p.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(fullTitle)}" />
    <meta name="twitter:description" content="${esc(p.description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
${FAVICONS}
${FONTS}

    <link rel="stylesheet" href="/assets/css/tokens.css" />
    <link rel="stylesheet" href="/assets/css/site.css" />`;
}

export interface LayoutParams extends HeadParams {
  header?: string; // chrome rendered above the scroll region
  main: string; // inner HTML for <main> (the scroll region)
  footer?: string; // chrome rendered below the scroll region
  shell?: boolean; // fix header + footer, scroll only the content area
}

export function layout(p: LayoutParams): string {
  const bodyClass = [p.world ? `world-${p.world}` : "", p.shell ? "app-shell" : ""]
    .filter(Boolean)
    .join(" ");
  return `<!doctype html>
<html lang="en">
  <head>
${head(p)}
  </head>
  <body class="${bodyClass}">
${p.header ?? ""}
    <main class="page">
${p.main}
    </main>
${p.footer ?? ""}
  </body>
</html>
`;
}
