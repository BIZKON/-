## 2024-05-23 - [Selectable Cards Accessibility]
**Learning:** Nested interactive elements (Checkbox inside clickable Div) confuse screen readers and create double tab stops.
**Action:** Make the container the primary interactive element (`role="checkbox"`, `tabIndex={0}`) and hide the inner visual checkbox (`aria-hidden="true"`, `tabIndex={-1}`).
