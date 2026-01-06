## 2024-05-23 - Selectable Card Pattern
**Learning:** Nested interactive controls (Checkbox inside clickable Card) cause accessibility issues for screen readers (double focus, confusing announcement) and click conflicts.
**Action:** Implement "Selectable Card" pattern: apply `role="checkbox"` and `aria-checked` to the container, handle keyboard `Enter/Space` on the container, and make the inner Checkbox purely decorative (`aria-hidden="true"`, `pointer-events-none`).
