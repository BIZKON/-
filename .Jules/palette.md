## 2025-05-18 - [Icon Button Accessibility]
**Learning:** Text characters like '×' for delete actions are poor for accessibility and touch targets. Replacing them with semantic icons (Trash2) + ARIA labels significantly improves the experience.
**Action:** Always check icon-only buttons for `aria-label` and `type="button"`. Use `lucide-react` icons instead of text characters.
