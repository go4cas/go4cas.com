// Content pipeline: walk content/, derive {world, section, slug} from the file
// path, validate frontmatter, render Markdown, drop drafts. Problems are
// collected (not thrown one-at-a-time) so an author can fix everything in one pass.

import { Glob } from "bun";
import matter from "gray-matter";
import { marked } from "marked";
import { WORLDS, WORLD_SECTIONS, type World, type Section } from "./site.ts";

export interface ContentItem {
  world: World;
  section?: Section; // undefined for a world hub
  title: string;
  summary: string;
  date?: string; // YYYY-MM-DD
  featured: boolean;
  repo?: string; // optional source/repo URL (projects)
  html: string; // rendered Markdown body
  route: string; // e.g. /work/writing/foo
}

const CONTENT_DIR = "content";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HUB_KEYS = ["title", "summary", "draft"];
const ARTICLE_KEYS = [...HUB_KEYS, "date", "featured", "repo"];

marked.setOptions({ gfm: true });

/** Hubs + non-draft articles, newest first (undated items last, by title). */
export async function loadContent() {
  const items: ContentItem[] = [];
  const errors: string[] = [];
  let draftsSkipped = 0;

  const paths = await Array.fromAsync(new Glob("**/*.md").scan({ cwd: CONTENT_DIR }));
  for (const rel of paths.map((p) => p.replaceAll("\\", "/")).sort()) {
    const fail = (msg: string) => errors.push(`✗ ${CONTENT_DIR}/${rel}: ${msg}`);

    // <world>/index.md is a hub; <world>/<section>/<slug>.md is an article.
    const [world, section, file] = rel.split("/") as [World, Section | "index.md", string?];
    const isHub = section === "index.md" && !file;
    const slug = file?.replace(/\.md$/, "");
    if (!WORLDS.includes(world)) {
      fail(`unknown world "${world}" (expected ${WORLDS.join(" or ")})`);
      continue;
    }
    if (!isHub) {
      if (!slug || rel.split("/").length !== 3) {
        fail("unexpected path shape (expected <world>/index.md or <world>/<section>/<slug>.md)");
        continue;
      }
      if (!WORLD_SECTIONS[world].includes(section as Section)) {
        fail(`section "${section}" is not valid for world "${world}"`);
        continue;
      }
      if (slug === "index" || !SLUG_RE.test(slug)) {
        fail(`invalid slug "${slug}" (kebab-case, not "index")`);
        continue;
      }
    }

    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(await Bun.file(`${CONTENT_DIR}/${rel}`).text());
    } catch (e) {
      fail(`failed to parse frontmatter: ${(e as Error).message}`);
      continue;
    }
    const fm = parsed.data;
    // gray-matter parses an unquoted YYYY-MM-DD into a Date; normalise it back.
    const date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : fm.date || undefined;

    const problems = validate(fm, date, isHub, section === "writing");
    if (problems.length) {
      problems.forEach(fail);
      continue;
    }
    // Drafts are dropped only after validation, so malformed drafts still fail.
    if (fm.draft) {
      draftsSkipped++;
      continue;
    }

    items.push({
      world,
      section: isHub ? undefined : (section as Section),
      title: fm.title,
      summary: fm.summary,
      date,
      featured: fm.featured === true,
      repo: fm.repo || undefined,
      html: marked.parse(parsed.content) as string,
      route: isHub ? `/${world}` : `/${world}/${section}/${slug}`,
    });
  }

  items.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title));
  return { items, draftsSkipped, errors };
}

function validate(fm: Record<string, unknown>, date: unknown, isHub: boolean, isWriting: boolean): string[] {
  const errors: string[] = [];
  const allowed = isHub ? HUB_KEYS : ARTICLE_KEYS;
  const isBool = (key: string) => !(key in fm) || typeof fm[key] === "boolean";

  for (const key of Object.keys(fm)) {
    if (!allowed.includes(key)) errors.push(`unknown frontmatter key: ${key}`);
  }
  for (const key of ["title", "summary"]) {
    const v = fm[key];
    if (typeof v !== "string" || v.trim() === "") errors.push(`missing required field: ${key}`);
  }
  // A bare `draft:` parses to null, so presence alone isn't enough.
  if (!isBool("draft")) errors.push("draft must be true or false");
  if (isHub) return errors;

  if (!isBool("featured")) errors.push("featured must be true or false");
  if (fm.repo && (typeof fm.repo !== "string" || !/^https?:\/\//.test(fm.repo))) {
    errors.push("repo must be an http(s) URL");
  }
  if (date == null) {
    if (isWriting) errors.push("writing entry requires a date");
  } else if (typeof date !== "string" || !DATE_RE.test(date) || Number.isNaN(Date.parse(date))) {
    errors.push(`invalid date (expected YYYY-MM-DD): ${String(fm.date)}`);
  }
  return errors;
}
