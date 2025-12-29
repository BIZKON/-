## 2024-05-23 - [Selectable Cards Accessibility]
**Learning:** Applying `aria-label` to a container card that already has visible text (Title, Description) overrides that content for screen readers, hiding important context.
**Action:** For interactive cards with text content, avoid `aria-label` on the container and rely on natural reading order or `aria-labelledby`.

## 2024-05-23 - [Decorative Checkboxes in Cards]
**Learning:** When making a whole card interactive (e.g., `role="checkbox"`), having a nested interactive Checkbox component creates confusion and double tab stops.
**Action:** Make the inner Checkbox purely decorative by setting `tabIndex={-1}`, `aria-hidden="true"`, and `pointer-events-none`.
