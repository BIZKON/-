## 2024-05-22 - Accessible Selectable Cards
**Learning:** Avoid nesting interactive elements like <Checkbox> inside clickable cards. It creates invalid HTML (button in button) and confuses screen readers.
**Action:** Use role='checkbox' on the container and implement the visual checkbox using a div and icon.

## 2024-10-18 - Active Navigation State
**Learning:** Next.js App Router links don't automatically know they are active. We must use `usePathname` and apply `aria-current='page'` manually for accessibility.
**Action:** Always implement a `usePathname` check in navigation components to provide visual feedback and accessible context.
