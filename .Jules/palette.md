## 2024-05-23 - Icon-only Buttons Accessibility
**Learning:** Many icon-only buttons (like delete actions or mobile toggles) were missing accessible names, making them invisible or confusing to screen reader users.
**Action:** Always add `aria-label` to buttons that use `size="icon"` or contain only an icon. Use dynamic labels for stateful buttons (e.g., "Open sidebar" / "Close sidebar").
