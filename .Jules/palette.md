## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2026-01-24 - Button Links and Validity
**Learning:** Wrapping a Shadcn UI `Button` inside a Next.js `Link` creates invalid HTML (`<a>` > `<button>`), violating interactive nesting rules.
**Action:** Use the `asChild` prop on `Button` and place `Link` as its child to ensure the rendered element is a single `<a>` tag with button styles.
