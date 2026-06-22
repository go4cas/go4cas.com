// Frontmatter validation. Each item is checked against the allowed key set for
// its kind; problems are collected (not thrown one-at-a-time) so an author can
// fix everything in a single pass. build.ts prints them and exits non-zero.

import type { PageKind } from "./content.ts";

export interface RawFrontmatter {
  [key: string]: unknown;
}

const HUB_KEYS = new Set(["title", "summary", "draft"]);
const ARTICLE_KEYS = new Set(["title", "summary", "date", "featured", "draft"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface ValidationContext {
  kind: PageKind; // 'hub' | 'article' (lists are synthesized, never validated)
  isWriting: boolean; // article in a `writing` section → date required
  sourcePath: string;
}

/** Returns a list of human-readable error strings (empty when valid). */
export function validateFrontmatter(fm: RawFrontmatter, ctx: ValidationContext): string[] {
  const errors: string[] = [];
  const allowed = ctx.kind === "hub" ? HUB_KEYS : ARTICLE_KEYS;

  // Unknown keys.
  for (const key of Object.keys(fm)) {
    if (!allowed.has(key)) errors.push(`unknown frontmatter key: ${key}`);
  }

  // Required strings.
  for (const key of ["title", "summary"] as const) {
    const v = fm[key];
    if (typeof v !== "string" || v.trim() === "") {
      errors.push(`missing required field: ${key}`);
    }
  }

  // draft: when present, must be a real boolean. A bare `draft:` parses to null.
  if ("draft" in fm && typeof fm.draft !== "boolean") {
    errors.push("draft must be true or false");
  }

  if (ctx.kind === "article") {
    // featured: optional, boolean when present.
    if ("featured" in fm && typeof fm.featured !== "boolean") {
      errors.push("featured must be true or false");
    }

    const hasDate = "date" in fm && fm.date != null && fm.date !== "";
    if (ctx.isWriting && !hasDate) {
      errors.push("writing entry requires a date");
    }
    if (hasDate) {
      const raw = fm.date;
      // gray-matter may parse an unquoted YYYY-MM-DD into a Date object.
      const str = raw instanceof Date ? toIsoDate(raw) : String(raw);
      if (!DATE_RE.test(str) || Number.isNaN(new Date(str).getTime())) {
        errors.push(`invalid date (expected YYYY-MM-DD): ${String(raw)}`);
      }
    }
  }

  return errors;
}

/** Normalise a Date (from YAML auto-parsing) back to a YYYY-MM-DD string. */
export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
