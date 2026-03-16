#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but not installed." >&2
  exit 1
fi

WIDTHS=(480 720 960 1280 1600 1920)

find "$ROOT_DIR/images" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 | while IFS= read -r -d '' file; do
  base="${file%.*}"
  ext="${file##*.}"
  ext="$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')"
  pix_fmt="yuv420p10le"
  if [[ "$ext" == "png" ]]; then
    pix_fmt="yuva420p10le"
  fi
  for width in "${WIDTHS[@]}"; do
    output="${base}-w${width}.avif"
    ffmpeg -nostdin -y -loglevel error -i "$file" \
      -vf "scale=w=${width}:h=-2:flags=lanczos" \
      -frames:v 1 -c:v libsvtav1 -crf 30 -preset 6 -pix_fmt "${pix_fmt}" \
      "$output"
  done
  echo "AVIF variants created for ${file}"
  done
