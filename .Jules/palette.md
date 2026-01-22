## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-23 - Button as Link Pattern
**Learning:** Nesting a `<Button>` inside a `<Link>` creates invalid HTML (`<a>` > `<button>`) and confuses screen readers.
**Action:** Use the `asChild` prop on Shadcn `Button` and nest the `Link` inside it to render a single, semantically correct `<a>` tag with button styling.
