// The content model, declared once. Each collection (a section like "writing")
// lists its frontmatter fields, how its entries sort, and how it's labelled.
// Each world lists the collections it uses, in display order. Adding a section
// is one entry here plus a folder under content/<world>/.

import { ICONS } from "./icons.ts";

/** Returns an error message, or undefined when the value is valid. */
export type Check = (value: unknown) => string | undefined;
export interface Field {
  check: Check;
  required?: boolean;
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isUrl = (v: unknown) => typeof v === "string" && /^(https?:\/\/|mailto:)/.test(v);

const text: Check = (v) => (typeof v === "string" && v.trim() ? undefined : "must be non-empty text");
const bool: Check = (v) => (typeof v === "boolean" ? undefined : "must be true or false");
const date: Check = (v) =>
  typeof v === "string" && DATE_RE.test(v) && !Number.isNaN(Date.parse(v)) ? undefined : "must be a date (YYYY-MM-DD)";
const year: Check = (v) => (Number.isInteger(v) && (v as number) >= 1900 && (v as number) <= 2100 ? undefined : "must be a year, e.g. 2024");
const whole: Check = (v) => (Number.isInteger(v) ? undefined : "must be a whole number");
const oneOf =
  (...options: string[]): Check =>
  (v) =>
    options.includes(v as string) ? undefined : `must be one of: ${options.join(", ")}`;
const textList: Check = (v) =>
  Array.isArray(v) && v.length && v.every((s) => typeof s === "string" && s.trim()) ? undefined : "must be a list of text";
const tagList: Check = (v) =>
  Array.isArray(v) && v.length && v.every((s) => typeof s === "string" && SLUG_RE.test(s))
    ? undefined
    : "must be a list of kebab-case tags";
// A file next to the entry (folder entries only); the loader checks it exists.
const localFile: Check = (v) =>
  typeof v === "string" && /^[\w.-]+$/.test(v) && !v.startsWith(".") ? undefined : "must be a file name in the entry's folder";

/** Outbound links a project can carry, in display order. */
export const LINK_KINDS = {
  repo: { label: "Source", icon: (url: string) => (new URL(url).hostname === "github.com" ? ICONS.github : ICONS.code) },
  site: { label: "Live site", icon: () => ICONS.globe },
};
export type LinkKind = keyof typeof LINK_KINDS;
const links: Check = (v) => {
  if (!v || typeof v !== "object" || Array.isArray(v)) return `must be a map of ${Object.keys(LINK_KINDS).join("/")} → URL`;
  for (const [kind, url] of Object.entries(v)) {
    if (!(kind in LINK_KINDS)) return `unknown link "${kind}" (expected ${Object.keys(LINK_KINDS).join(" or ")})`;
    if (!isUrl(url)) return `link "${kind}" must be an http(s) URL`;
  }
};

export const PROJECT_STATUSES = ["active", "shipped", "archived"] as const;

/** Fields every entry accepts, whatever its collection. */
const ENTRY_FIELDS: Record<string, Field> = {
  title: { check: text, required: true },
  summary: { check: text, required: true },
  featured: { check: bool },
  draft: { check: bool },
  image: { check: localFile },
};

export interface Collection {
  label: string; // section heading, e.g. "Writing"
  kind: string; // badge on a single entry, e.g. "Project"
  icon: string;
  sort: "date" | "order"; // newest first, or by `order` then title
  fields: Record<string, Field>;
}

export const COLLECTIONS = {
  writing: {
    label: "Writing",
    kind: "Writing",
    icon: ICONS.pen,
    sort: "date",
    fields: {
      ...ENTRY_FIELDS,
      date: { check: date, required: true },
      updated: { check: date },
      tags: { check: tagList },
    },
  },
  projects: {
    label: "Projects",
    kind: "Project",
    icon: ICONS.grid,
    sort: "order",
    fields: {
      ...ENTRY_FIELDS,
      status: { check: oneOf(...PROJECT_STATUSES), required: true },
      year: { check: year },
      stack: { check: textList },
      links: { check: links },
      order: { check: whole },
    },
  },
  pursuits: {
    label: "Pursuits",
    kind: "Pursuit",
    icon: ICONS.compass,
    sort: "order",
    fields: {
      ...ENTRY_FIELDS,
      since: { check: year },
      order: { check: whole },
    },
  },
} satisfies Record<string, Collection>;
export type Section = keyof typeof COLLECTIONS;

/** Worlds and their sections, in display order. */
export const WORLDS = {
  work: { label: "Work", sections: ["projects", "writing"] },
  life: { label: "Life", sections: ["pursuits", "writing"] },
} satisfies Record<string, { label: string; sections: Section[] }>;
export type World = keyof typeof WORLDS;
export const WORLD_KEYS = Object.keys(WORLDS) as World[];

/** content/<world>/index.md — the hub page, plus copy reused across the site. */
export const HUB_FIELDS: Record<string, Field> = {
  title: { check: text, required: true },
  summary: { check: text, required: true }, // hub meta + the landing page descriptor
  creed: { check: text, required: true }, // sign-off on the hub, articles and landing
  feed: { check: text, required: true }, // RSS channel description
};

/** content/<world>/<section>/index.md — optional intro for a section page. */
export const SECTION_FIELDS: Record<string, Field> = {
  title: { check: text, required: true },
  summary: { check: text, required: true },
};

/** Every problem with a frontmatter block: unknown keys, missing or invalid fields. */
export function validate(fm: Record<string, unknown>, fields: Record<string, Field>): string[] {
  const errors: string[] = [];
  for (const key of Object.keys(fm)) {
    if (!(key in fields)) errors.push(`unknown frontmatter key: ${key}`);
  }
  for (const [key, field] of Object.entries(fields)) {
    // A bare `key:` parses to null; treat it like a missing value.
    const value = fm[key];
    if (value == null) {
      if (field.required) errors.push(`missing required field: ${key}`);
      continue;
    }
    const problem = field.check(value);
    if (problem) errors.push(`${key} ${problem}`);
  }
  return errors;
}
