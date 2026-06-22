#!/usr/bin/env bash
#
# Generate 1200x630 social-share cards (og:image) from the AVIF portraits.
#
# These are PRE-GENERATED and committed to assets/img/ — the Cloudflare build
# does not run this (no ImageMagick there). Re-run locally after changing the
# portraits or branding:  bash scripts/make-og-cards.sh
#
# Requires: ImageMagick (`magick`) and macOS `sips` (to decode AVIF → PNG).
# Fonts (Audiowide, Space Mono) are fetched once into a local cache.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC=assets/img
OUT=assets/img
CACHE=".cache/og"
mkdir -p "$CACHE"

# --- Brand tokens (sRGB approximations of the oklch tokens) ---
BG_C="#101013"; BG_E="#050506"; SCRIM="#08080a"
GO="#e8e8ec"; FOUR="#6b6b73"; CAS="#b63430"
COOL="#8cbfde"; WARM="#e5b57c"; MUTED="#84848d"

# --- Fonts (cached) ---
fetch_font() { # name url
  if [ ! -f "$CACHE/$1" ]; then
    echo "  fetching $1"
    bun -e "const r=await fetch(process.argv[1]); await Bun.write(process.argv[2], await r.arrayBuffer())" "$2" "$CACHE/$1"
  fi
}
fetch_font Audiowide-Regular.ttf "https://github.com/google/fonts/raw/main/ofl/audiowide/Audiowide-Regular.ttf"
fetch_font SpaceMono-Regular.ttf  "https://github.com/google/fonts/raw/main/ofl/spacemono/SpaceMono-Regular.ttf"
FA="$CACHE/Audiowide-Regular.ttf"
FM="$CACHE/SpaceMono-Regular.ttf"

# --- Decode AVIF portraits to PNG ---
sips -s format png "$SRC/me-professional.avif" --out "$CACHE/pro.png" >/dev/null
sips -s format png "$SRC/me-personal.avif"     --out "$CACHE/per.png" >/dev/null

# --- Shared pieces ---
magick -size 1200x630 radial-gradient:$BG_C-$BG_E "$CACHE/bg.png"
# left-opaque → right-transparent scrim, 430 wide, to melt the portrait panel into the bg
magick -size 630x430 gradient:"$SCRIM"-"${SCRIM}00" -rotate -90 "$CACHE/scrim.png"

# wordmark: go(light) 4(grey) cas(red), in Audiowide
magick -background none -font "$FA" -pointsize 82 -fill "$GO"   label:'go'  "$CACHE/w_go.png"
magick -background none -font "$FA" -pointsize 82 -fill "$FOUR" label:'4'   "$CACHE/w_4.png"
magick -background none -font "$FA" -pointsize 82 -fill "$CAS"  label:'cas' "$CACHE/w_cas.png"
magick "$CACHE/w_go.png" "$CACHE/w_4.png" "$CACHE/w_cas.png" +append -background none "$CACHE/wordmark.png"

# tagline (shared)
magick -background none -font "$FM" -pointsize 22 -kerning 4 -fill "$MUTED" label:'One human · Two worlds' "$CACHE/tag.png"

# --- World card: eyebrow → wordmark → rule → tagline, portrait panel flush right ---
world_card() { # portrait_png  crop_offset  accent  label  outfile
  local por="$1" off="$2" accent="$3" label="$4" out="$5"
  magick "$por" -crop 430x630+0+"$off" +repage "$CACHE/por.png"
  magick -background none -font "$FM" -pointsize 26 -kerning 8 -fill "$accent" label:"$label" "$CACHE/lbl.png"
  magick "$CACHE/bg.png" \
    \( "$CACHE/por.png" \) -gravity East -geometry +0+0 -composite \
    \( "$CACHE/scrim.png" \) -gravity East -geometry +358+0 -composite \
    \( "$CACHE/lbl.png" \) -gravity NorthWest -geometry +92+212 -composite \
    \( "$CACHE/wordmark.png" \) -gravity NorthWest -geometry +88+244 -composite \
    -fill "$accent" -draw "rectangle 92,356 172,359" \
    \( "$CACHE/tag.png" \) -gravity NorthWest -geometry +92+384 -composite \
    -quality 88 "$out"
  echo "  wrote $out"
}

world_card "$CACHE/pro.png" 300 "$COOL" "WORK" "$OUT/og-work.jpg"
world_card "$CACHE/per.png" 250 "$WARM" "LIFE" "$OUT/og-life.jpg"

# --- Landing card: split face (human left | machine right), centred lockup over a scrim ---
# personal fills the left half, professional the right half; a centre scrim carries the type.
magick "$CACHE/per.png" -resize 600x -gravity North -crop 600x630+0+560 +repage "$CACHE/home-l.png"
magick "$CACHE/pro.png" -resize 600x -gravity North -crop 600x630+0+700 +repage "$CACHE/home-r.png"
magick -size 860x630 radial-gradient:"${SCRIM}f2"-"${SCRIM}00" "$CACHE/home-scrim.png"
magick -background none -font "$FM" -pointsize 22 -kerning 6 -fill "$MUTED" label:'One human · Two worlds' "$CACHE/tag-c.png"
magick -size 1200x630 xc:"$BG_E" \
  \( "$CACHE/home-l.png" \) -gravity West -geometry +0+0 -composite \
  \( "$CACHE/home-r.png" \) -gravity East -geometry +0+0 -composite \
  \( "$CACHE/home-scrim.png" \) -gravity Center -geometry +0+0 -composite \
  \( "$CACHE/wordmark.png" \) -gravity Center -geometry +0-26 -composite \
  \( "$CACHE/tag-c.png" \) -gravity Center -geometry +0+66 -composite \
  -quality 88 "$OUT/og-home.jpg"
echo "  wrote $OUT/og-home.jpg"

echo "done."
