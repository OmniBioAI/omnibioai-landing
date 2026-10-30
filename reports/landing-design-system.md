# Landing design system

The migration preserves the established dark OmniBioAI visual identity: deep blue-green surfaces, cyan/green accents, editorial serif headlines, technical mono labels, and the canonical DNA mark/logo.

## Tokens

- Background/surfaces: `#071316`, `#0c1d20`, `#10262a`.
- Text: `#f2f7f5`; supporting text `#9eb4b0`.
- Primary accent: `#00e5a0`; focus uses the same high-visibility accent.
- Feedback tokens: danger, warning, and success are separately defined.
- Typography: Space Grotesk for interface/body, Playfair Display for editorial headings, JetBrains Mono for data and labels.
- Container max: 1180px; shared spacing uses fluid `clamp()` values.

## Components

Buttons, cards, catalog cards, filters, fields, status messages, navigation, legal layouts, team cards, publication rows, tags, tables, dialogs, and footers share centralized styling. The system avoids fabricated logos, generic product imagery, heavy animation, and unnecessary gradients.

Visual inspection covered homepage at 390, 768, and 1440 pixels and About at 1280 pixels. It identified and corrected a desktop navigation CTA contrast inheritance issue that automated tests did not expose.
