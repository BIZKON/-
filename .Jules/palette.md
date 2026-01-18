## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-24 - Semantic Buttons in Links
**Learning:** Using <Button> inside <Link> creates invalid HTML (button inside anchor) and hydration errors. Shadcn UI/Radix Button supports `asChild` to solve this.
**Action:** Use <Button asChild><Link ...>...</Link></Button> when a link needs button styling.
