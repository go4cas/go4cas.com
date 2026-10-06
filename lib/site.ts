// Site-wide constants and tiny helpers shared by templates and the RSS feed.

export const SITE_URL = "https://go4cas.com";
export const SITE_NAME = "go4cas";

export const WORLDS = ["work", "life"] as const;
export type World = (typeof WORLDS)[number];
export type Section = "projects" | "writing" | "pursuits";

/** Sections allowed within each world (also fixes their display order on hubs). */
export const WORLD_SECTIONS: Record<World, Section[]> = {
  work: ["projects", "writing"],
  life: ["pursuits", "writing"],
};

/** RSS channel description per world. */
export const FEED_DESCRIPTIONS: Record<World, string> = {
  work: "Writing from the work world: product, building, AI and open source.",
  life: "Writing from the life world: sport, outdoors, and life off the clock.",
};

/** "writing" → "Writing". Worlds and sections are labelled by their key. */
export const label = (key: string) => key[0].toUpperCase() + key.slice(1);

/** Escape text for safe interpolation into HTML/XML text nodes and attributes. */
export function esc(value: unknown): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, (c) => map[c]);
}

/** Format YYYY-MM-DD as e.g. "22 Jun 2026" (UTC, locale-stable). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
