## 2024-05-23 - Accessible Selectable Cards
**Learning:** Nesting a `<Checkbox />` component (which renders as a `<button>`) inside a clickable card (`<div onClick />`) creates invalid HTML (nested interactive elements) and accessibility issues (tab stop confusion).
**Action:** When creating selectable cards, apply `role="checkbox"` and `tabIndex={0}` to the card container, handle `onKeyDown` for Space/Enter, and use a purely visual representation (e.g., stylized div + icon) for the inner checkbox.
