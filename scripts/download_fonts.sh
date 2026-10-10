#!/bin/bash
# Download IBM Plex Sans Thai, Noto Sans Thai + Inter font files for self-hosting

set -e

FONTS_DIR="$(cd "$(dirname "$0")/../fonts" && pwd)"
mkdir -p "$FONTS_DIR"

echo "▶ Downloading IBM Plex Sans Thai (thai, latin, latin-ext)..."
python3 - "$FONTS_DIR" << 'PYEOF'
import urllib.request, re, os, sys

fonts_dir = sys.argv[1]
ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
url = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap'

req = urllib.request.Request(url, headers={'User-Agent': ua})
with urllib.request.urlopen(req) as resp:
    css = resp.read().decode('utf-8')

blocks = css.split('@font-face')
for b in blocks[1:]:
    w_match = re.search(r'font-weight:\s*(\d+);', b)
    w = w_match.group(1) if w_match else '400'
    u_match = re.search(r'src:\s*url\((https://[^\)]+\.woff2)\)', b)
    if not u_match: continue
    font_url = u_match.group(1)
    range_match = re.search(r'unicode-range:\s*([^;]+);', b)
    urange = range_match.group(1).strip() if range_match else ''
    
    subset = 'other'
    if '0E01' in urange or '0E00' in urange:
        subset = 'thai'
    elif '0000-00FF' in urange:
        subset = 'latin'
    elif '0100-02BA' in urange or '0100-02AF' in urange or '0100' in urange:
        subset = 'latin-ext'
    
    if subset in ['thai', 'latin', 'latin-ext']:
        fname = f'ibm-plex-sans-thai-{w}-{subset}.woff2'
        fpath = os.path.join(fonts_dir, fname)
        if os.path.exists(fpath):
            print(f'  ✅ Already exists: {fname}')
        else:
            r2 = urllib.request.Request(font_url, headers={'User-Agent': ua})
            with urllib.request.urlopen(r2) as f_in:
                data = f_in.read()
            with open(fpath, 'wb') as f_out:
                f_out.write(data)
            print(f'  ⬇️ Downloaded: {fname} ({len(data)} bytes)')
print("✅ All IBM Plex Sans Thai fonts ready!")
PYEOF
