## 2024-05-23 - [Icon Button Accessibility]
**Learning:** Icon-only buttons (like delete 'x' or trash cans) are invisible to screen readers without explicit `aria-label`s. Text characters like '×' are often read as "multiplication sign" or ignored, which is confusing.
**Action:** Always wrap icon-only buttons in `<button aria-label="Action Name">` and use semantic SVG icons instead of text characters. Ensure `focus-visible` styles are present since `outline-none` removes default browser focus rings.
