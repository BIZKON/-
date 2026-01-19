## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-24 - Semantic Links with Button Styles
**Learning:** Wrapping a Shadcn UI `Button` inside a Next.js `Link` creates invalid HTML (`<a href...><button>...</button></a>`) and nested interactive controls.
**Action:** Use the `asChild` prop on the `Button` component to merge styles onto the underlying `Link` component, ensuring valid semantic HTML (`<a class="...button-styles..." href...>...</a>`).
