## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-05-23 - Accessible Link Buttons
**Learning:** Nesting <Button> inside <Link> creates invalid HTML (<a><button>...</button></a>), which confuses screen readers and is technically invalid.
**Action:** Use the `asChild` prop on the Button component to merge styles onto the underlying Link element, rendering a valid semantic <a> tag.
