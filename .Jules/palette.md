## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2026-01-30 - Contextual Labels for Rich Checkboxes
**Learning:** "Card-as-checkbox" components visually group a title and description, but `role="checkbox"` alone doesn't associate inner text. Screen readers announce "checkbox" without context.
**Action:** Use `aria-labelledby` pointing to the card title ID and `aria-describedby` pointing to the description ID to provide full context.
