## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-23 - Shadcn UI Button as Link
**Learning:** Nesting a <Button> inside a Next.js <Link> creates invalid HTML (<a> containing <button>).
**Action:** Use the asChild prop on the Button component and nest the Link inside it to render a semantic <a> tag with button styling.
