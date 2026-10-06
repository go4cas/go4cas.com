// Content pipeline: walk content/, classify each file by its path, validate
// frontmatter against lib/schema.ts, render Markdown, drop drafts. Problems are
// collected (not thrown one-at-a-time) so an author can fix everything in one pass.
//
//   <world>/index.md                    world hub
//   <world>/<section>/index.md          optional section intro
//   <world>/<section>/<slug>.md         entry
//   <world>/<section>/<slug>/index.md   entry with its own files (images etc.)
//   <world>/<section>/<slug>/<file>     a file served next to that entry

import { Glob } from "bun";
import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import {
  COLLECTIONS,
  HUB_FIELDS,
  SECTION_FIELDS,
  SLUG_RE,
  WORLDS,
  WORLD_KEYS,
  validate,
  type Field,
  type LinkKind,
  type Section,
  type World,
} from "./schema.ts";

export const CONTENT_DIR = "content";

export interface Hub {
  world: World;
  title: string;
  summary: string;
  creed: string;
  feed: string;
  html: string;
  route: string;
}

export interface SectionIntro {
  title: string;
  summary: string;
  html: string;
}

export interface Entry {
  world: World;
  section: Section;
  slug: string;
  route: string; // e.g. /work/writing/foo
  title: string;
  summary: string;
  html: string;
  featured: boolean;
  image?: string; // absolute path of the entry's own social image
  files: string[]; // source paths copied next to the page
  // writing
  date?: string; // YYYY-MM-DD
  updated?: string;
  tags: string[];
  // projects
  status?: string;
  year?: number;
  stack: string[];
  links: Partial<Record<LinkKind, string>>;
  // projects + pursuits
  since?: number;
  order?: number;
}

export interface Content {
  hubs: Partial<Record<World, Hub>>;
  intros: Map<string, SectionIntro>; // keyed "<world>/<section>"
  entries: Entry[]; // sorted: by world, section, then the collection's own order
  draftsSkipped: number;
  errors: string[];
}

export async function loadContent(): Promise<Content> {
  const content: Content = { hubs: {}, intros: new Map(), entries: [], draftsSkipped: 0, errors: [] };
  const paths = (await Array.fromAsync(new Glob("**/*").scan({ cwd: CONTENT_DIR })))
    .map((p) => p.replaceAll("\\", "/"))
    .sort();

  // Files inside entry folders, keyed by the folder ("<world>/<section>/<slug>").
  const folderFiles = new Map<string, string[]>();
  for (const rel of paths) {
    const parts = rel.split("/");
    if (parts.length === 4 && parts[3] !== "index.md" && !rel.endsWith(".md")) {
      const folder = parts.slice(0, 3).join("/");
      folderFiles.set(folder, [...(folderFiles.get(folder) ?? []), parts[3]]);
    }
  }
  const usedFolders = new Set<string>();

  for (const rel of paths) {
    const fail = (msg: string) => content.errors.push(`✗ ${CONTENT_DIR}/${rel}: ${msg}`);
    const parts = rel.split("/");
    const [world, section, name, file] = parts as [World, Section, string?, string?];

    if (!(world in WORLDS)) {
      fail(`unknown world "${world}" (expected ${WORLD_KEYS.join(" or ")})`);
      continue;
    }
    if (parts.length === 2) {
      if (section !== ("index.md" as string)) fail("unexpected file (a world folder holds index.md and section folders)");
      else {
        const doc = await read(rel, HUB_FIELDS, fail);
        if (doc) content.hubs[world] = { world, ...(doc.fm as Omit<Hub, "world">), html: doc.html, route: `/${world}` };
      }
      continue;
    }
    if (!(WORLDS[world].sections as Section[]).includes(section)) {
      fail(`section "${section}" is not valid for world "${world}" (expected ${WORLDS[world].sections.join(" or ")})`);
      continue;
    }
    if (parts.length === 3 && name === "index.md") {
      const doc = await read(rel, SECTION_FIELDS, fail);
      if (doc) content.intros.set(`${world}/${section}`, { ...(doc.fm as Omit<SectionIntro, "html">), html: doc.html });
      continue;
    }

    const isFolder = parts.length === 4;
    if (isFolder && file !== "index.md") {
      if (file!.endsWith(".md")) fail('an entry folder holds one Markdown file, named "index.md"');
      continue; // other files are attached to their entry below
    }
    if (parts.length > 4 || (!isFolder && !name!.endsWith(".md"))) {
      fail(`unexpected path (see the layout at the top of lib/content.ts)`);
      continue;
    }
    const slug = isFolder ? name! : name!.replace(/\.md$/, "");
    if (!SLUG_RE.test(slug)) {
      fail(`invalid slug "${slug}" (use kebab-case)`);
      continue;
    }

    const folder = `${world}/${section}/${slug}`;
    if (isFolder) usedFolders.add(folder);
    const route = `/${folder}`;
    const files = isFolder ? (folderFiles.get(folder) ?? []) : [];
    const doc = await read(rel, COLLECTIONS[section].fields, fail, { route, files });
    if (!doc) continue;
    const fm = doc.fm;
    if (fm.image && !files.includes(fm.image as string)) {
      fail(`image "${fm.image}" not found${isFolder ? " in the entry's folder" : " (move the entry into a folder to add files)"}`);
      continue;
    }
    // Drafts are dropped only after validation, so malformed drafts still fail.
    if (fm.draft) {
      content.draftsSkipped++;
      continue;
    }

    content.entries.push({
      world,
      section,
      slug,
      route,
      title: fm.title as string,
      summary: fm.summary as string,
      html: doc.html,
      featured: fm.featured === true,
      image: fm.image ? `${route}/${fm.image}` : undefined,
      files: files.map((f) => `${CONTENT_DIR}/${folder}/${f}`),
      date: fm.date as string | undefined,
      updated: fm.updated as string | undefined,
      tags: (fm.tags as string[]) ?? [],
      status: fm.status as string | undefined,
      year: fm.year as number | undefined,
      stack: (fm.stack as string[]) ?? [],
      links: (fm.links as Entry["links"]) ?? {},
      since: fm.since as number | undefined,
      order: fm.order as number | undefined,
    });
  }

  for (const folder of folderFiles.keys()) {
    if (!usedFolders.has(folder)) content.errors.push(`✗ ${CONTENT_DIR}/${folder}/: files without an index.md`);
  }

  content.entries.sort(compareEntries);
  return content;
}

/** By world and section (schema order), then newest first or by `order`, then title. */
function compareEntries(a: Entry, b: Entry): number {
  const worldOrder = WORLD_KEYS.indexOf(a.world) - WORLD_KEYS.indexOf(b.world);
  const sections = WORLDS[a.world].sections as Section[];
  const sectionOrder = sections.indexOf(a.section) - sections.indexOf(b.section);
  if (worldOrder || sectionOrder) return worldOrder || sectionOrder;
  const own =
    COLLECTIONS[a.section].sort === "date"
      ? (b.date ?? "").localeCompare(a.date ?? "")
      : (a.order ?? Infinity) - (b.order ?? Infinity) || 0;
  return own || a.title.localeCompare(b.title);
}

/** Parse, normalise and validate one Markdown file; undefined if it has problems. */
async function read(
  rel: string,
  fields: Record<string, Field>,
  fail: (msg: string) => void,
  entry?: { route: string; files: string[] },
) {
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(await Bun.file(`${CONTENT_DIR}/${rel}`).text());
  } catch (e) {
    fail(`failed to parse frontmatter: ${(e as Error).message}`);
    return;
  }
  // gray-matter parses an unquoted YYYY-MM-DD into a Date; normalise it back.
  const fm = Object.fromEntries(
    Object.entries(parsed.data).map(([k, v]) => [k, v instanceof Date ? v.toISOString().slice(0, 10) : v]),
  );
  const problems = validate(fm, fields);
  const html = render(parsed.content, entry, problems);
  if (problems.length) {
    problems.forEach(fail);
    return;
  }
  return { fm, html };
}

/** Markdown → HTML. Relative links and images that name one of the entry's own
   files are rewritten to absolute paths (pages are served without a trailing
   slash, so a bare "photo.jpg" would otherwise resolve one level up). */
function render(markdown: string, entry: { route: string; files: string[] } | undefined, problems: string[]): string {
  const marked = new Marked({
    gfm: true,
    walkTokens(token) {
      if (token.type !== "link" && token.type !== "image") return;
      const t = token as Tokens.Link | Tokens.Image;
      if (/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(t.href)) return; // absolute, root-relative or fragment
      const file = decodeURIComponent(t.href.split(/[?#]/)[0]);
      if (entry?.files.includes(file)) t.href = `${entry.route}/${t.href}`;
      else if (t.type === "image") problems.push(`image "${t.href}" not found${entry ? " in the entry's folder" : ""}`);
    },
  });
  return marked.parse(markdown) as string;
}
