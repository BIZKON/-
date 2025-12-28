## 2024-05-23 - [Icon Button Accessibility & Ambiguity]
**Learning:** Icon-only buttons (like "×") are ambiguous and inaccessible without ARIA labels. Users might confuse them for "close" or "clear" rather than "delete".
**Action:** Always use semantic icons (like `Trash2`) and include `aria-label` describing the specific action (e.g., "Delete [Item Name]").
