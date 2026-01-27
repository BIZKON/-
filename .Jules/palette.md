## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2026-01-27 - Semantic Buttons with Links
**Learning:** Shadcn UI `Button` components used as links should implement the `asChild` prop wrapping a Next.js `Link` component, rather than nesting the `Button` inside the `Link`. This ensures valid HTML (`<a>` instead of `<a><button>`) and proper accessibility.
**Action:** When creating button-styled links, use `<Button asChild><Link ...>...</Link></Button>`.
