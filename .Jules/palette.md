## 2025-12-18 - [Replacing text characters with semantic icons]
**Learning:** Using text characters like '×' for delete actions is bad for accessibility (screen readers read "times" or "x") and usability (small hit area).
**Action:** Always replace text-based UI controls with semantic icons (like Trash2) and include explicit `aria-label` attributes to ensure screen readers announce the action correctly (e.g., "Delete ingredient").
