## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-24 - Semantic Links as Buttons
**Learning:** Nesting a `Button` component inside a `Link` creates invalid HTML (`<a><button>`), causing accessibility issues and hydration warnings.
**Action:** Use the `asChild` prop on Shadcn UI `Button` to merge props with the child `Link`, resulting in a valid semantic `<a>` tag with button styling.
