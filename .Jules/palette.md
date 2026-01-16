## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2025-05-20 - Accessible Lists and Decorative Elements
**Learning:** Manually rendered list numbers (in spans) or bullets inside `<li>` elements cause duplicate announcements for screen readers (e.g., "List item 1... 1... Content").
**Action:** Always add `aria-hidden="true"` to purely decorative or redundant visual elements (custom bullets, numbers, status icons) when the semantic structure or adjacent text already conveys the meaning.
