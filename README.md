# Handoff: go4cas — Personal Landing Page

## Overview
A single-screen, full-viewport personal landing page for **go4cas** (personal brand of one
person who is both a product owner/builder and an off-the-clock sports/outdoors/tattoos/tinkerer).
The page splits the viewport into two vertical half-portraits — a **professional** half and a
**personal** half — flanking a centered brand lockup. The key gesture: a CTA that slides the two
halves across the screen so they **cross and fuse into one complete face** in the center.

Tagline / concept: **"One human · Two worlds."**

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype that
demonstrates the intended look, motion, and behavior. They are **not** production code to copy
verbatim. The task is to **recreate this design in the target codebase's environment** (React,
Vue, Svelte, Astro, plain HTML/CSS, etc.) using that project's established patterns, component
conventions, and asset pipeline. If no codebase exists yet, this is a tiny static site — plain
HTML/CSS + a small amount of vanilla JS (or a React component) is the most appropriate choice.

> Note on the prototype's structure: the HTML was authored as a "Design Component" with a small
> custom runtime (`support.js`) and `ref="{{ }}"` / `onClick="{{ }}"` template bindings. **Ignore
> that runtime.** It is a prototyping harness, not part of the design. All logic you need is plain
> DOM/JS and is described in full below — reimplement it natively.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, motion curves, and interactions are
all specified. Recreate the UI pixel-accurately. Exact values are in **Design Tokens** below.

## Layout

Root is a fixed, non-scrolling stage: `position: relative; width: 100vw; height: 100vh; overflow: hidden`.
Background is a radial gradient (see tokens). Default font family `'Space Grotesk', sans-serif`.

Three stacked layers inside the stage:

1. **Left panel** (professional) — `position:absolute; top:0; bottom:0; left:0;`
   `width: clamp(240px, 31vw, 540px); overflow:hidden`. Holds the professional half-portrait.
2. **Right panel** (personal) — same but `right:0`.
3. **Center column** (`z-index:5`) — absolutely centered (`left:50%; top:50%; translate(-50%,-50%)`),
   `width: clamp(280px, 36vw, 460px)`, vertical flex, center-aligned. Holds the brand lockup + CTA + socials.
4. **Contact overlay** (`z-index:12`) — absolutely centered, hidden by default (currently dormant;
   see Interactions note). Reveals an email address + "back" button.

### Panels & portraits
Each panel contains:
- An `<img>` of a **half-face portrait** filling the panel: `position:absolute; inset:0;`
  `width:100%; height:100%; object-fit:cover; transform:scale(1.06)`.
  - **Left / professional** image `object-position: 0% center` (anchored to its LEFT edge; the
    portrait is the *right* half of the face, facial midline at the image's left edge).
  - **Right / personal** image `object-position: 100% center` (anchored to its RIGHT edge; the
    portrait is the *left* half of the face, facial midline at the image's right edge).
  - Filters: left `contrast(1.06) saturate(1.05) brightness(.98)`; right `contrast(1.04) saturate(1.05)`.
  - Transition: `transform .7s cubic-bezier(.22,1,.36,1), filter .6s ease`.
- A **bottom gradient scrim** (`position:absolute; inset:0; pointer-events:none`):
  `linear-gradient(0deg, rgba(8,8,10,.82) 0%, rgba(8,8,10,0) 40%)` plus an inner edge shadow toward
  the center: left panel `box-shadow: inset -28px 0 36px -26px rgba(0,0,0,.7)`, right panel mirrors
  it with `inset 28px 0 ...`.
- A **veil** div (`position:absolute; inset:0; background:#08080a; opacity:0;`
  `transition:opacity .5s ease`) — darkens the *opposite* panel on hover (see Interactions).
- A **caption block** near the bottom (`bottom: clamp(128px,19vh,168px)`, max-width `17ch`):
  - Eyebrow: `'Space Mono'`, 11px, `letter-spacing:.34em`, uppercase. Left eyebrow color
    `oklch(.78 .07 235)` (cool/blue), text **"Professional"**; right eyebrow color
    `oklch(.8 .09 72)` (warm/amber), text **"Personal"**, right-aligned.
    *(A small status dot used to sit beside each label; it is currently `display:none` — keep it removed.)*
  - Headline: `font-size: clamp(26px,3vw,40px); font-weight:600; line-height:1; color:#f2f2f4;`
    `letter-spacing:-.02em; white-space:nowrap`. Left = **"The work."**, right = **"The life."**
- A **descriptor paragraph** at `bottom: clamp(30px,7vh,70px)`, max-width `19ch`,
  `font-size: clamp(13px,1.05vw,15px); font-weight:300; line-height:1.5; color:#b6b6bd`:
  - Left: **"Product owner and builder — turning hard problems into solutions that quietly ship."**
  - Right (right-aligned): **"Sports, outdoors, tattoos and tinkerer behind the pixels."**

### Center column (top → bottom)
1. Thin vertical divider line, `height: clamp(40px,12vh,120px); width:1px`,
   `background: linear-gradient(#08080a, rgba(255,255,255,.16))`, draws in via `scaleY` animation.
2. Small label: `'Space Mono'`, 11px, `letter-spacing:.3em`, uppercase, color `#6f6f78` — **"go4cas.com"**.
3. **Brand lockup**: `'Audiowide'`, `font-size: clamp(38px,6.2vw,78px); line-height:1`. Three spans,
   each `display:inline-block` with a hover lift (`transform: translateY(-5px)`,
   `transition: transform .3s cubic-bezier(.22,1,.36,1)`):
   - **"go"** → `#e8e8ec`
   - **"4"** → `#6b6b73`
   - **"cas"** → `oklch(.52 .17 27)` (the brand red)
4. Sub-label: `'Space Mono'`, `clamp(10px,.95vw,12px)`, `letter-spacing:.42em`, uppercase, `#84848d` —
   **"One human · Two worlds"** (use non-breaking spaces around the middot so it never wraps).
5. **CTA** (the primary interaction trigger). An `<a href="mailto:hello@go4cas.com">` styled as a pill:
   `display:inline-flex; align-items:center; gap:10px; font-size:14px; font-weight:500;`
   `letter-spacing:.02em; color:#e8e8ea; padding:13px 26px; border:1px solid rgba(255,255,255,.14);`
   `border-radius:100px; background:rgba(255,255,255,.02); backdrop-filter:blur(6px)`.
   Transition `border-color .35s, background .35s, transform .35s cubic-bezier(.22,1,.36,1)`.
   Hover: `border-color:rgba(255,255,255,.4); background:rgba(255,255,255,.06); transform:translateY(-2px)`.
   Label text **"enter my universe"** followed by a `→` arrow span in `'Space Mono'`, color `oklch(.55 .17 27)`.
   The mailto href is a graceful fallback; JS intercepts the click (see Interactions).
6. **Social row**: horizontal flex, `gap:14px; margin-top:26px`. Three circular icon links
   (GitHub, X, Instagram), each: `40×40px; border-radius:50%; border:1px solid rgba(255,255,255,.12);`
   `color:#9a9aa2; background:rgba(255,255,255,.02);` centered SVG icon.
   Hover: `color:#f2f2f4; border-color:rgba(255,255,255,.4); transform:translateY(-2px)`.
   - GitHub → `https://github.com/go4cas` (18px filled mark)
   - X → `https://x.com/go4cas` (16px filled mark)
   - Instagram → `https://instagram.com/go4cas` (17px outline mark, `stroke-width:2`)
   All `target="_blank" rel="noopener"` with descriptive `aria-label`s.
7. Bottom mirror divider line (gradient reversed).

## Interactions & Behavior

### A. Entrance animations (on load)
Elements fade/slide in via staggered CSS keyframes (all `both` fill):
- `go4-fadeUp`: opacity 0→1, `translateY(20px)`→0. Used by captions, labels, lockup, CTA, socials.
- `go4-drawY`: `scaleY(0)`→1, `transform-origin:top`. Used by the two divider lines.
- Stagger (delays, seconds): top divider .25 → "go4cas.com" .35 → lockup .45 → left caption .55 →
  left descriptor .6 → "One human" .6 → right caption .7 → CTA .75 → right descriptor .75 →
  socials .85 → bottom divider .9.
- (`go4-inLeft`/`go4-inRight`/`go4-blink` keyframes are defined but currently unused — optional.)

### B. Pointer parallax (whole stage)
On `mousemove` over the stage, compute normalized cursor offset from center
`mx = clientX/​width - 0.5`, `my = clientY/height - 0.5` (range ≈ −0.5…0.5). Apply opposing
translates to the two portraits so they drift subtly:
- Left img: `transform: scale(<ls>) translate(${mx*12}px, ${my*12}px)`
- Right img: `transform: scale(<rs>) translate(${mx*-12}px, ${my*-12}px)`
where base scale is `1.06`, rising to `1.12` for the hovered side. On `mouseleave` reset `mx=my=0`.

### C. Panel hover (only when NOT assembled)
Hovering a panel: bump that portrait's scale to 1.12 and brighten its filter
(`brightness(1.06)`, slightly higher saturation), and fade the **opposite** panel's veil to
`opacity:0.55` (dimming the other side to focus the hovered one). On mouseleave, restore base
scale, base filter, and veil `opacity:0`. Skip all of this while `assembled === true`.

### D. The CTA gesture — "enter my universe" (the centerpiece)
Clicking the CTA (`preventDefault`) toggles an **assembled** boolean and animates the two panels
**across** the viewport so they cross sides and meet at center, fusing the two half-portraits into
one complete face (personal half lands on the left, professional half on the right):
- Distance each panel travels: `cross = window.innerWidth / 2`.
- Left panel → `translateX(+cross)`; right panel → `translateX(−cross)`. (Toggle back → `translateX(0)`.)
- Duration **1050ms**, custom cubic ease implemented in JS:
  `t < .5 ? 4t³ : 1 − (−2t+2)³/2` (an ease-in-out-cubic). The prototype animates via
  `requestAnimationFrame` reading the current `m41` of the transform matrix so repeated toggles
  interpolate from the live position; **a CSS transition `transform 1.05s cubic-bezier(.65,0,.35,1)`
  achieves the same result far more simply — prefer that** in a real implementation.
- While assembled, raise panel `z-index` (left 8, right 9) so they overlap the center column, and
  suppress panel hover effects.
- Clicking again toggles back to the resting split.

> Implementation note: the prototype also contains a dormant **contact overlay** (email +
> "back" button) and veil-darkening built for an earlier "two worlds collide → reveal contact"
> concept. In the current design the CTA simply performs the cross-and-fuse toggle; the overlay is
> not shown. You may omit the overlay entirely, or wire it up if the product wants a contact reveal.

### Resting geometry (reference, at 924px-wide viewport)
- At rest: professional panel occupies left `[0–286]`, personal panel right `[638–924]`.
- Assembled: they cross to meet exactly at center (462px) — personal `[176–462]`, professional `[462–748]`.

## State Management
Minimal. A single boolean **`assembled`** (false at rest, true when fused). Plus transient pointer
state (`mx`, `my`) and a `hovered` side flag (`'left' | 'right' | null`) for parallax/hover. No data
fetching, no routing, no persistence required.

## Responsive Behavior
- Panel width and all type sizes use `clamp()` (see values inline above) — they scale fluidly with
  viewport width. No discrete breakpoints in the prototype.
- The portraits' `sizes` attribute is `(max-width: 900px) 50vw, 31vw`.
- Page never scrolls (`overflow:hidden` on html/body and stage). On very small/portrait screens the
  centered text can crowd the portraits; consider a stacked/mobile treatment if mobile matters
  (not designed in the prototype — flag to product).

## Design Tokens

### Colors
| Token | Value | Use |
|---|---|---|
| Stage base | `#08080a` | page background base |
| Stage gradient | `radial-gradient(120% 120% at 50% 40%, #101013 0%, #08080a 60%, #050506 100%)` | stage bg |
| Brand red | `oklch(.52 .17 27)` (≈ `#b23a2b`) | "cas" in lockup, CTA arrow (`oklch(.55 .17 27)`), contact hover |
| Text high | `#f2f2f4` / `#e8e8ec` / `#e8e8ea` | headlines, lockup "go", CTA text |
| Text mid | `#b6b6bd` | descriptor paragraphs |
| Text low | `#9a9aa2` / `#84848d` / `#6f6f78` / `#6b6b73` | socials idle, sub-labels, "4" in lockup |
| Eyebrow cool | `oklch(.78 .07 235)` | "Professional" label |
| Eyebrow warm | `oklch(.8 .09 72)` | "Personal" label |
| Hairline | `rgba(255,255,255,.12–.16)` | borders, dividers |
| Hairline hover | `rgba(255,255,255,.4)` | border on hover |
| Surface | `rgba(255,255,255,.02)` → `.06` hover | CTA / social pill fills |

### Typography
| Family | Source | Weights | Use |
|---|---|---|---|
| **Audiowide** | Google Fonts | 400 | brand lockup, contact email |
| **Space Grotesk** | Google Fonts | 300,400,500,600,700 | body, headlines, CTA |
| **Space Mono** | Google Fonts | 400,700 | eyebrows, labels, arrows, mono accents |

Google Fonts link:
`https://fonts.googleapis.com/css2?family=Audiowide&family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap`

Notable type specs: headlines `clamp(26px,3vw,40px)/600`, lockup `clamp(38px,6.2vw,78px)`,
descriptors `clamp(13px,1.05vw,15px)/300`, eyebrows 11px `letter-spacing:.34em` uppercase,
sub-label `letter-spacing:.42em` uppercase.

### Radius / spacing / motion
- Radius: `100px` (pills), `50%` (social circles).
- Pill padding: CTA `13px 26px`; social icons `40×40` fixed.
- Easing: UI micro-interactions `cubic-bezier(.22,1,.36,1)`; panel cross `ease-in-out-cubic`
  (`cubic-bezier(.65,0,.35,1)` equivalent), 1050ms.
- `backdrop-filter: blur(6px)` on the CTA pill.

## Assets
Half-face portraits live in `uploads/` and are referenced responsively via `srcset`
(400w / 600w / full ~1000w):
- **Professional half** (left panel): `me-professional.avif` (+ `-400`, `-600` variants) —
  right half of the face, anchored to image left edge.
- **Personal half** (right panel): `me-personal.avif` (+ `-400`, `-600` variants) —
  left half of the face, anchored to image right edge.
- The two halves are cut so their facial midlines align when the panels meet at center, forming one
  continuous face. Preserve this alignment if assets are re-exported.
- Social icons are inline SVG (GitHub, X, Instagram) — no external icon library.

Replace these AVIFs with the production person's portraits as needed; keep the same crop/anchor
relationship so the fuse gesture lands.

## Files in this bundle
- `go4cas.dc.html` — the prototype source (template markup + the vanilla-JS logic class). Read this
  for exact markup/values; **reimplement, don't ship.**
- `go4cas.html` — a self-contained, fully-inlined standalone build (fonts/images embedded). Open it
  in a browser to see and interact with the finished design exactly as intended.
- `uploads/` — the portrait AVIFs (all responsive sizes).
