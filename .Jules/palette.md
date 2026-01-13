## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-23 - Semantic Button Links
**Learning:** Found multiple instances of `Button` components nested inside `Link` components (`<a><button>...`), which is invalid HTML and affects accessibility.
**Action:** Use the `asChild` prop on `Button` to merge props with the child `Link`, resulting in a single valid `<a>` element with button styles.
