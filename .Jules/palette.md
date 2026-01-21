## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-23 - Semantic Link Buttons
**Learning:** Nesting <Button> inside <Link> creates invalid HTML (button inside anchor). Shadcn UI's Button supports `asChild` to properly render as the anchor tag while keeping button styles.
**Action:** Use <Button asChild><Link ...>...</Link></Button> instead of wrapping Button in Link.
