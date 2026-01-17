## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2026-01-17 - Button asChild Link
**Learning:** Nesting <Button> inside <Link> creates invalid HTML (<a><button>).
**Action:** Use <Button asChild><Link ...>...</Link></Button> to render a semantically correct <a> tag with button styling.
