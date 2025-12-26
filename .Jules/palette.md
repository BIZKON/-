## 2025-05-18 - [Icon Button Accessibility]
**Learning:** Text characters like '×' for delete actions are accessible nightmares; they lack semantic meaning and can be confusing for screen readers. Using icon components (like `Trash2`) with explicit `aria-label` provides a much clearer and more professional experience.
**Action:** Always replace character-based icon-substitutes with real SVG icons and descriptive ARIA labels, ensuring `type="button"` is present to prevent form submission issues.
