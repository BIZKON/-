## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2025-02-19 - Accessible Password Toggle
**Learning:** Absolute positioned interactive elements (like password toggles) over inputs must have explicit focus states (focus-visible) as `outline-none` removes default browser focus rings.
**Action:** Always add `focus-visible:ring-2` to custom buttons inside inputs to ensure keyboard navigation remains visible.
