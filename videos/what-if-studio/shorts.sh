#!/bin/bash
# Render Shorts/Reels (9:16 only), master to -14 LUFS, and copy to youtube/<slug>-9x16.mp4.
# Usage (from anywhere): bash videos/what-if-studio/shorts.sh <slug> [<slug> ...]
set -e
ST="$(cd "$(dirname "$0")" && pwd)"; SK="$ST/../../.claude/skills/what-if-animation"; Y="$ST/../../youtube"
for slug in "$@"; do
  cd "$ST"
  python3 "$SK/scripts/master.py" "$slug" --vertical > "out/$slug/master.log" 2>&1
  ffmpeg -nostdin -y -v error -i "out/$slug/$slug-final.mp4" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$Y/$slug-9x16.mp4"
  echo "$slug done: youtube/$slug-9x16.mp4"
done
