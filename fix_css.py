import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Remove GHS Image Specificity Bug
css = re.sub(r'\.ghs-grid label img\s*\{[^}]*\}', '', css)
css = re.sub(r'\.ghs-grid label:hover img\s*\{[^}]*\}', '', css)

# 2. Fix transition missing semicolons
css = re.sub(r'(\s+transition:[^\n;]+)(?<!;)(\n)', r'\1;\2', css, flags=re.IGNORECASE)

# 3. Fix transition !important syntax
def fix_transition(match):
    full_line = match.group(0)
    cleaned = full_line.replace('!important', '').replace(' !important', '')
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = cleaned.replace(' ,', ',')
    if '!important' in full_line:
        cleaned = cleaned.replace(';', ' !important;')
    return cleaned
css = re.sub(r'^[ \t]*transition:[^\n]+!important[^\n]+;', fix_transition, css, flags=re.MULTILINE)

# 4. Insert Table Filter Bar Desktop Styles before the first @media (max-width: 640px)
desktop_rules = """
.table-filter-bar .search-scan-group {
  display: flex;
  gap: 16px;
  flex: 1 1 300px;
  min-width: 300px;
}

.table-filter-bar .search-box-container {
  flex: 1 1 200px;
  position: relative;
  min-width: 0;
}

.table-filter-bar .scan-box-container {
  flex: 0 0 150px;
  width: 150px;
  position: relative;
}

.table-filter-bar .filter-select {
  flex: 0 0 150px;
  width: 150px;
}

.table-filter-bar .filter-buttons-group {
  display: flex;
  gap: 16px;
  flex: 1 1 100%;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.table-filter-bar .filter-buttons-group .btn {
  flex: 0 0 150px;
  width: 150px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}
"""
css = css.replace('.table-filter-bar select,\n.table-filter-bar input,\n.table-filter-bar .btn {', desktop_rules + '\n.table-filter-bar select,\n.table-filter-bar input,\n.table-filter-bar .btn {')

# 5 & 6. Insert Mobile Styles into @media (max-width: 640px)
mobile_rules = """
@media (max-width: 640px) {
  .booking-grid-layout {
    display: flex !important;
    flex-direction: column-reverse;
  }

  .table-filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .table-filter-bar .search-scan-group {
    flex-direction: row;
    min-width: 0;
    gap: 8px;
    width: 100%;
  }

  .table-filter-bar .search-box-container {
    flex: 1;
    min-width: 0;
  }
  
  .table-filter-bar .scan-box-container {
    flex: 0 0 46px;
    width: 46px;
    height: 46px;
    background-color: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
  }

  .table-filter-bar .scan-box-container input {
    display: none !important;
  }
  
  .table-filter-bar #btnTriggerCameraScan {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    transform: none !important;
    width: 100% !important;
    height: 100% !important;
  }

  .table-filter-bar .filter-select {
    width: 100%;
    flex: 1 1 100%;
    max-width: 100%;
  }
"""
css = css.replace('@media (max-width: 640px) {', mobile_rules, 1)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("All CSS fixes applied successfully!")
