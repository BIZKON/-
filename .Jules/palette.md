## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-24 - Semantic Links with Shadcn Button
**Learning:** Wrapping a Shadcn `Button` inside a Next.js `Link` creates invalid HTML (`<a href...><button>...`).
**Action:** Use `<Button asChild><Link href...>` to render a valid semantic anchor tag with button styling.
