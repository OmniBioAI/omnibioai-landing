# Accessibility review

Target: WCAG 2.2 AA where applicable. Status: PASS for tested acceptance, not a legal conformance certification.

## Automated coverage

- Axe ran against `/`, `/about`, and `/privacy` in the production build: zero serious or critical violations.
- Lighthouse Accessibility: 100 on mobile and desktop.
- Component tests cover navigation state/focus and catalog announcements.

## Manual/browser checks

- Skip link, `main`, header/nav/footer landmarks, semantic headings, field labels, fieldset/legend, native validation, and status live regions were verified.
- Mobile menu opens with keyboard activation, closes with Escape, updates `aria-expanded`, and restores focus.
- External links use `noopener noreferrer`.
- Admin details use modal dialog semantics and focus moves to its close control.
- Visible focus is high contrast and touch controls target at least 40–48px.
- Reduced-motion preference disables smooth scrolling and transitions/animations.

## Fixes during acceptance

The brand link accessible name was aligned with its visible “OmniBioAI beta” content. A desktop CTA contrast issue found by visual review was fixed. Horizontal page overflow was eliminated while keeping large filter sets scrollable inside their labeled container.

Remaining limitation: a full assistive-technology session with VoiceOver/NVDA was not available. Full WCAG conformance is therefore not claimed solely from automation.
