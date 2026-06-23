// Content pipeline: walk content/, parse frontmatter + Markdown, derive
// {world, section, slug} from the file path, validate, render, drop drafts.

import { Glob } from "bun";
import matter from "gray-matter";
import { marked } from "marked";
import { basename } from "node:path";
import { validateFrontmatter, toIsoDate, type RawFrontmatter } from "./validate.ts";
import {
  WORLD_SECTIONS,
  type World,
  type Section,
} from "./paths.ts";

export type PageKind = "hub" | "list" | "article";

export interface Frontmatter {
  title: string;
  summary: string;
  date?: string; // normalised YYYY-MM-DD
  featured: boolean;
  draft: boolean;
  repo?: string; // optional source/repo URL (projects)
}

export interface ContentItem {
  world: World;
  section?: Section; // undefined for a world hub
  slug?: string; // undefined for hubs and (synthesized) list pages
  kind: PageKind;
  frontmatter: Frontmatter;
  html: string; // rendered Markdown body
  sourcePath: string; // e.g. content/work/writing/foo.md
  routePath: string; // e.g. /work/writing/foo
  outputPath: string; // e.g. dist/work/writing/foo/index.html
  date?: Date; // parsed from frontmatter.date when present
}

export interface LoadResult {
  items: ContentItem[]; // hubs + articles (no drafts); lists are synthesized later
  draftsSkipped: number;
  errors: string[]; // prefixed `✗ <sourcePath>: <message>`
}

const CONTENT_DIR = "content";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

marked.setOptions({ gfm: true });

export async function loadContent(): Promise<LoadResult> {
  const errors: string[] = [];
  const items: ContentItem[] = [];
  let draftsSkipped = 0;

  const glob = new Glob("**/*.md");
  const relPaths: string[] = [];
  for await (const rel of glob.scan({ cwd: CONTENT_DIR })) {
    relPaths.push(rel.split("\\").join("/")); // normalise Windows separators
  }
  relPaths.sort(); // deterministic build order

  for (const rel of relPaths) {
    const sourcePath = `${CONTENT_DIR}/${rel}`;
    const fail = (msg: string) => errors.push(`✗ ${sourcePath}: ${msg}`);

    // Derive world/section/slug + kind from the path shape.
    const parts = rel.split("/");
    const world = parts[0] as World;
    if (world !== "work" && world !== "life") {
      fail(`unknown world "${parts[0]}" (expected work or life)`);
      continue;
    }

    let kind: PageKind;
    let section: Section | undefined;
    let slug: string | undefined;

    if (parts.length === 2 && parts[1] === "index.md") {
      kind = "hub";
    } else if (parts.length === 3) {
      kind = "article";
      section = parts[1] as Section;
      slug = basename(parts[2], ".md");
      if (!WORLD_SECTIONS[world].includes(section)) {
        fail(`section "${section}" is not valid for world "${world}"`);
        continue;
      }
      if (slug === "index" || !SLUG_RE.test(slug)) {
        fail(`invalid slug "${slug}" (kebab-case, not "index")`);
        continue;
      }
    } else {
      fail("unexpected path shape (expected <world>/index.md or <world>/<section>/<slug>.md)");
      continue;
    }

    // Parse frontmatter + body.
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(await Bun.file(sourcePath).text());
    } catch (e) {
      fail(`failed to parse frontmatter: ${(e as Error).message}`);
      continue;
    }
    const raw = parsed.data as RawFrontmatter;

    // Validate.
    const isWriting = section === "writing";
    const vErrors = validateFrontmatter(raw, { kind, isWriting, sourcePath });
    if (vErrors.length) {
      vErrors.forEach(fail);
      continue;
    }

    // Normalise frontmatter (date may have been YAML-parsed into a Date).
    const dateStr = normaliseDate(raw.date);
    const frontmatter: Frontmatter = {
      title: String(raw.title),
      summary: String(raw.summary),
      date: dateStr,
      featured: raw.featured === true,
      draft: raw.draft === true,
      repo: typeof raw.repo === "string" && raw.repo !== "" ? raw.repo : undefined,
    };

    // Drop drafts (already validated, so malformed drafts are still caught above).
    if (frontmatter.draft) {
      draftsSkipped++;
      continue;
    }

    const { routePath, outputPath } = routeFor(world, section, slug);
    items.push({
      world,
      section,
      slug,
      kind,
      frontmatter,
      html: kind === "article" || kind === "hub" ? (marked.parse(parsed.content) as string) : "",
      sourcePath,
      routePath,
      outputPath,
      date: dateStr ? new Date(dateStr) : undefined,
    });
  }

  return { items, draftsSkipped, errors };
}

function normaliseDate(raw: unknown): string | undefined {
  if (raw == null || raw === "") return undefined;
  if (raw instanceof Date) return toIsoDate(raw);
  return String(raw);
}

function routeFor(
  world: World,
  section: Section | undefined,
  slug: string | undefined,
): { routePath: string; outputPath: string } {
  if (!section) {
    // hub
    return { routePath: `/${world}`, outputPath: `dist/${world}/index.html` };
  }
  // article
  return {
    routePath: `/${world}/${section}/${slug}`,
    outputPath: `dist/${world}/${section}/${slug}/index.html`,
  };
}

/** Route + output path for a synthesized section list page. */
export function listRoute(world: World, section: Section): { routePath: string; outputPath: string } {
  return {
    routePath: `/${world}/${section}`,
    outputPath: `dist/${world}/${section}/index.html`,
  };
}
