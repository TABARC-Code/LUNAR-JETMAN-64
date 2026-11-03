#!/bin/sh
# Opens the game in your default browser (Linux).
dir="$(cd "$(dirname "$0")" && pwd)"
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$dir/index.html"
else
  echo "Couldn't find xdg-open. Open this file in your browser yourself:"
  echo "$dir/index.html"
fi
