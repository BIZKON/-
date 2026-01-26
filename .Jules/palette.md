## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-23 - Semantic Button Links
**Learning:** Shadcn UI `Button` components used as links should implement the `asChild` prop wrapping a Next.js `Link` component, rather than nesting the `Button` inside the `Link`. This ensures valid HTML and correct accessibility semantics.
**Action:** When implementing button-styled links, always use `<Button asChild><Link ...>...</Link></Button>`.

## 2024-05-23 - Decorative Icons
**Learning:** Purely decorative icons adjacent to text should be hidden from screen readers using `aria-hidden="true"`.
**Action:** Always add `aria-hidden="true"` to decorative icons.
