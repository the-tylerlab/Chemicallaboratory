#!/bin/bash
# Download Noto Sans Thai + Inter font files for self-hosting
# Only download the subsets we actually need:
#   - Inter: latin + latin-ext  (English numbers, symbols)
#   - Noto Sans Thai: thai subset  (Thai characters)

set -e

FONTS_DIR="$(dirname "$0")/../fonts"
mkdir -p "$FONTS_DIR"

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

download() {
  local url="$1"
  local out="$2"
  if [ -f "$out" ]; then
    echo "  ✅ Already exists: $(basename $out)"
  else
    curl -s -L -A "$UA" "$url" -o "$out"
    echo "  ⬇️  Downloaded: $(basename $out)"
  fi
}

echo "▶ Downloading Inter (latin)..."
download "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2"          "$FONTS_DIR/inter-300-latin.woff2"
download "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_fVMrMxCp50SjIa1ZL7W0Q5nw.woff2"          "$FONTS_DIR/inter-400-latin.woff2"
download "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_fVMrMxCp50SjIa0pL7W0Q5nw.woff2"          "$FONTS_DIR/inter-500-latin.woff2"
download "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_fVMrMxCp50SjIa3aL7W0Q5nw.woff2"          "$FONTS_DIR/inter-600-latin.woff2"
download "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_fVMrMxCp50SjIa2-L7W0Q5nw.woff2"          "$FONTS_DIR/inter-700-latin.woff2"

echo "▶ Downloading Noto Sans Thai (thai subset)..."
# Fetch the full CSS and extract woff2 URLs for Noto Sans Thai thai subset
CSS=$(curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap")
# Extract lines between /* thai */ comment blocks
echo "$CSS" | python3 - <<'PYEOF'
import sys, re, subprocess, os

content = sys.stdin.read()
# Wait - we need to read it differently
PYEOF

# Use python to parse and download properly
python3 << 'PYEOF'
import re, subprocess, os, sys

fonts_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts')
ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

import urllib.request
req = urllib.request.Request(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap",
    headers={"User-Agent": ua}
)
with urllib.request.urlopen(req) as resp:
    css = resp.read().decode("utf-8")

# Find all thai-subset blocks
blocks = re.split(r'/\*\s*(\S+)\s*\*/', css)
i = 0
while i < len(blocks):
    block = blocks[i]
    if block.strip() == 'thai' and i + 1 < len(blocks):
        thai_block = blocks[i+1]
        urls = re.findall(r'url\((https://[^)]+\.woff2)\)', thai_block)
        weights = re.findall(r'font-weight:\s*(\d+)', thai_block)
        for j, url in enumerate(urls):
            w = weights[j] if j < len(weights) else '400'
            fname = f"noto-sans-thai-{w}-thai.woff2"
            fpath = os.path.join(fonts_dir, fname)
            if os.path.exists(fpath):
                print(f"  ✅ Already exists: {fname}")
            else:
                req2 = urllib.request.Request(url, headers={"User-Agent": ua})
                with urllib.request.urlopen(req2) as r2:
                    data = r2.read()
                with open(fpath, 'wb') as f:
                    f.write(data)
                print(f"  ⬇️  Downloaded: {fname} ({len(data)//1024}KB)")
    i += 1
print("✅ All Noto Sans Thai (thai subset) downloaded!")
PYEOF
