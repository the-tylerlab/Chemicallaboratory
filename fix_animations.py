import re

CSS_PATH = "style.css"
JS_PATH = "app.js"

with open(CSS_PATH, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update CSS tokens
old_transitions = """  /* Transitions */
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 0.35s cubic-bezier(0.16, 1, 0.3, 1);"""

new_transitions = """  /* Transitions */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --transition-fast: 0.15s var(--ease-out);
  --transition-normal: 0.25s var(--ease-out);
  --transition-spring: 0.3s cubic-bezier(0.16, 1, 0.3, 1);"""

if old_transitions in css:
    css = css.replace(old_transitions, new_transitions)

# 2. Append reduced motion
reduced_motion = """
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
"""
if "@media (prefers-reduced-motion" not in css:
    css += reduced_motion

# 3. Replace transition: all ...
# The transition: all var(--transition-fast) mostly happens on hoverable elements (background, color, border, shadow, transform).
# We'll use regex to replace transition: all [time/ease/var] with a set of commonly used properties.
def replace_all(match):
    val = match.group(1)
    # usually we transition these properties
    props = f"background-color {val}, color {val}, border-color {val}, box-shadow {val}, opacity {val}, transform {val}"
    return f"transition: {props}"

css = re.sub(r'transition:\s*all\s+(.*?);', replace_all, css)

# Fix specific animation durations
css = css.replace('animation: fadeIn 0.4s', 'animation: fadeIn 0.3s')
css = css.replace('animation: scaleInModal 0.4s', 'animation: scaleInModal 0.3s')
css = css.replace('animation: slideInToast 0.4s', 'animation: slideInToast 0.3s')
css = css.replace('animation: fadeInModal 0.25s ease', 'animation: fadeInModal 0.2s var(--ease-out)')
css = css.replace('transition: all 0.2s ease !important;', 'transition: background-color 0.2s var(--ease-out) !important;')

with open(CSS_PATH, 'w', encoding='utf-8') as f:
    f.write(css)

# Update app.js
with open(JS_PATH, 'r', encoding='utf-8') as f:
    js = f.read()

# Inline transition: all
js = re.sub(r'transition:\s*all\s+(var\(--transition-fast\));', r'transition: background-color \1, border-color \1, transform \1;', js)

# Inline transition: background 0.2s
js = js.replace('transition: background 0.2s', 'transition: background-color var(--transition-fast)')

with open(JS_PATH, 'w', encoding='utf-8') as f:
    f.write(js)

print("Updates completed successfully.")
