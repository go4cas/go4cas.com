// Site-wide constants and tiny helpers shared by templates and feeds.

import { ICONS } from "./icons.ts";

export const SITE_URL = "https://go4cas.com";
export const SITE_NAME = "go4cas";

/** Social links, used by the landing page and every content page footer. */
export const SOCIALS: Array<{ icon: keyof typeof ICONS; href: string; name: string }> = [
  { icon: "github", href: "https://github.com/go4cas", name: "GitHub — go4cas" },
  { icon: "x", href: "https://x.com/go4cas", name: "X — @go4cas" },
  { icon: "instagram", href: "https://instagram.com/go4cas", name: "Instagram — @go4cas" },
  { icon: "email", href: "mailto:hello@go4cas.com", name: "Email — hello@go4cas.com" },
];

/** Escape text for safe interpolation into HTML/XML text nodes and attributes. */
export function esc(value: unknown): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, (c) => map[c]);
}

/** Format YYYY-MM-DD as e.g. "22 Jun 2026" (UTC, locale-stable). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
