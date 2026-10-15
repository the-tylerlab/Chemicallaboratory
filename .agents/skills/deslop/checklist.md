# Deslop Quick Audit Checklist

Use this checklist during code reviews, PR audits, and documentation passes.

## Code Audit Checklist
- [ ] **Narrating Comments**: Remove comments explaining self-evident code (e.g. `// set id`, `// fetch user`).
- [ ] **Defensive Clutter**: Flatten single-line `try/catch` wrappers around deterministic, non-throwing operations.
- [ ] **Nullish Chains**: Remove repetitive `(a?.b ?? "") || ""` when types/schema ensure values are defined.
- [ ] **Pass-Through Wrappers**: Inline functions that do nothing except pass arguments unchanged to another single function.
- [ ] **Unused Boilerplate**: Delete commented-out blocks, dead branches, and speculative parameters.
- [ ] **CSS Cleanliness**:
  - Replace random `!important` tags with proper selector scoping.
  - Remove excessive `box-shadow` glows and unneeded multi-stop gradients.
  - Flatten redundant nested containers.

## Documentation & Prose Checklist
- [ ] **Delete Throat-Clearing**: Remove "Certainly!", "Let's dive in", "In this section, we will...".
- [ ] **Cut Connectors**: Remove *Furthermore*, *Moreover*, *Additionally*, *In conclusion*.
- [ ] **Replace Buzzwords**:
  - "Delve into" -> "Inspect", "examine", "review"
  - "Testament to" -> "Shows", "demonstrates"
  - "Crucial / vital" -> "Key", "necessary"
- [ ] **Cut Binary Contrasts**: Remove "It's not just X, it's Y" constructions.
- [ ] **Vary Sentence Rhythm**: Mix short, punchy statements with descriptive explanations.
