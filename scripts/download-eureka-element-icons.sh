#!/bin/bash
# One-time download of Eureka element icons from consolegameswiki.
# Source: rendered colorful 96×96 PNGs uploaded by the FFXIV community wiki
# (xivapi has no individual icon IDs for these — the in-game art is in a
# UI texture atlas with runtime colorization).
# Run: bash scripts/download-eureka-element-icons.sh
set -euo pipefail

cd "$(dirname "$0")/.."

ICON_DIR="src/assets/eureka-element-icons"
mkdir -p "$ICON_DIR"

ELEMENTS=(Fire Ice Wind Earth Lightning Water)

for el in "${ELEMENTS[@]}"; do
  out="$ICON_DIR/$el.png"
  if [[ -f "$out" ]]; then
    echo "exists: $out"
    continue
  fi
  url="https://ffxiv.consolegameswiki.com/mediawiki/index.php?title=Special:FilePath&file=Eureka${el}.png"
  echo "downloading: $el ← $url"
  curl -L -A "ffxiv-baldesion-tool/1.0" --fail-with-body -o "$out" "$url"
done

echo "done. icons in $ICON_DIR/"
ls -la "$ICON_DIR/"
