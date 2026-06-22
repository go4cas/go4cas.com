// Site-wide constants and route/world configuration.

export type World = "work" | "life";
export type Section = "projects" | "writing" | "pursuits";

export const SITE = {
  baseUrl: "https://go4cas.com",
  name: "go4cas",
} as const;

/** Sections allowed within each world (also fixes their display order on hubs). */
export const WORLD_SECTIONS: Record<World, Section[]> = {
  work: ["projects", "writing"],
  life: ["pursuits", "writing"],
};

/** Human-facing labels for sections. */
export const SECTION_LABELS: Record<Section, string> = {
  projects: "Projects",
  writing: "Writing",
  pursuits: "Pursuits",
};

export const WORLD_LABELS: Record<World, string> = {
  work: "Work",
  life: "Life",
};

/** Default OG/Twitter image per world (absolute URL).
   Pre-generated 1200×630 JPG cards (see scripts/make-og-cards.sh) — JPG so
   social scrapers that don't decode AVIF still show a preview. */
export function defaultOgImage(world: World | undefined): string {
  const file = world === "life" ? "og-life.jpg" : "og-work.jpg";
  return `${SITE.baseUrl}/assets/img/${file}`;
}

/** RSS channel metadata per world. */
export const RSS_CHANNEL: Record<World, { title: string; description: string }> = {
  work: {
    title: "go4cas · Work — Writing",
    description: "Writing from the work world: product, building, AI and open source.",
  },
  life: {
    title: "go4cas · Life — Writing",
    description: "Writing from the life world: sport, outdoors, and life off the clock.",
  },
};

/** Absolute URL for a route path (which always begins with a leading slash). */
export function absoluteUrl(routePath: string): string {
  return `${SITE.baseUrl}${routePath}`;
}
