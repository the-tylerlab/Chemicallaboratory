---
name: deslop
description: Audits, strips, and refactors AI-generated slop, robotic prose tropes, bloated boilerplate, defensive over-engineering, and visual fluff from code and documentation.
---

# Deslop (Anti-AI-Slop Skill)

This skill detects and eliminates **AI slop** from codebases, styles, and written documentation. It replaces robotic formulas, redundant abstractions, performative comments, and visual clutter with clean, lean, idiomatic, human-crafted work.

---

## 1. Core Principles

1. **Delete relentlessly**: The fastest, most maintainable code or prose is the part you didn't need.
2. **Zero fluff, maximum signal**: Every line of code, CSS property, and sentence must earn its place.
3. **Respect working code**: Deslopping is not mindless minification. It preserves working behavior, security boundaries, and accessibility while cutting unnecessary overhead.

---

## 2. Code Deslopping

When reviewing or writing code, audit against these common AI-generated antipatterns:

### A. Performative & Redundant Comments
AI assistants routinely emit play-by-play comments that merely narrate what the code already says.
- **Delete**:
  ```javascript
  // Bad: Narrating the syntax
  // Get the element by ID
  const btn = document.getElementById("submit");
  // Check if button exists
  if (btn) {
    // Add click event listener
    btn.addEventListener("click", handleClick);
  }
  ```
- **Keep only**:
  - Non-obvious domain rules or algorithmic invariants.
  - Explanations for workarounds necessitated by external bugs or browser quirks.
  - Security constraints and compliance notes.

### B. Defensive Over-Engineering & Wrapper Clutter
AI models tend to wrap every trivial line in unnecessary try/catch blocks, redundant nullish coalescing, or single-use helper functions.
- **Eliminate**:
  - `try / catch` blocks on synchronous, deterministic operations that never throw.
  - Unnecessary fallbacks like `(user?.name ?? "") || ""` when data types are guaranteed.
  - Single-use pass-through wrapper functions that add no encapsulation or abstraction value.
  - Redundant parameter validation on internal, private methods where caller constraints are already checked.

### C. Dead Code & Speculative Boilerplate ("YAGNI")
- Remove commented-out obsolete code blocks.
- Remove "just-in-case" configuration flags, unused imports, and unreferenced helper utilities.
- Remove speculative type castings (`as any` chains) or complex generics where a simple concrete interface suffices.

### D. CSS & UI Slop
AI-generated frontends frequently suffer from visual cliché and over-styling:
- **Neon / Cyberpunk Glows**: Strip excessive `box-shadow: 0 0 30px rgba(...)` and harsh saturation unless explicitly requested as a brand identity.
- **Gratuitous Gradients**: Replace multi-stop linear gradients on basic cards/buttons with solid, accessible design tokens.
- **Div Soups**: Remove nested wrapper `<div>`s that only contain a single flex child with no distinct styling role.
- **`!important` Piling**: Refactor cascading specificity rather than slapping `!important` to patch style collisions.
- **Duplicate Media Queries**: Group responsive styles cleanly under unified breakpoints.

---

## 3. Prose & Documentation Deslopping

When reviewing technical documentation, PR descriptions, test reports, or commit messages:

### A. The "Connector Parade"
Cut mechanical, transitional sentence openers that AI leans on to mimic formality:
- **Cut or replace**: *Furthermore*, *Moreover*, *Additionally*, *In conclusion*, *To summarize*, *It is worth noting that*, *Needless to say*.

### B. Robot Vocabulary & Cliches
Strip AI buzzwords that signal machine-generated filler:
| AI Slop Trope | Human Alternative |
| --- | --- |
| *"Delve into / Dive deep into"* | Examine, analyze, review, inspect |
| *"A testament to..."* | Demonstrates, shows, proves |
| *"In today's fast-paced landscape..."* | Cut entirely |
| *"Harnessing the power of..."* | Using, applying |
| *"Seamlessly integrates..."* | Works with, connects to |
| *"Plethora / Tapestry / Beacon"* | Many, range, example |
| *"Crucial / Vital / Pivotal"* (overused) | Key, required, important |

### C. Binary Contrast Tropes
Eliminate the clichéd:
- *"It’s not just about X; it’s about Y."*
- *"It’s more than a feature—it’s an experience."*
State the practical fact directly.

### D. Throat-Clearing & Sycophancy
- Eliminate rhetorical self-answering questions (*"Why is this important? Because..."*).
- Remove preambles, apologies, and flattery (*"Certainly! Here is a detailed breakdown..."*).
- State the finding, the status, and the immediate action directly.

---

## 4. Execution Workflow

When invoked with `/deslop` or when requested to deslop a target:

1. **Identify the Target**:
   - If specific files or git diffs are specified, focus on those.
   - If uncommitted git changes exist, inspect `git diff`.
   - If a documentation file or report is open, audit its text structure.

2. **Run the Deslop Checklist**:
   - [ ] Code: Are there narrating comments? -> Delete.
   - [ ] Code: Are there redundant defensive wrappers or empty abstractions? -> Flatten.
   - [ ] Code: Is there dead code, unused CSS, or gratuitous visual noise? -> Purge.
   - [ ] Prose: Does it contain AI cliché markers ("delve", "testament", connector parade)? -> Rewrite directly.
   - [ ] Prose: Are sentence lengths monotonous? -> Vary pacing and sentence lengths.

3. **Verify Functionality**:
   - Run tests, builds, or linting (`npm test`, syntax validation) to confirm no functional regressions occurred.
   - Keep git diff focused and legible.
