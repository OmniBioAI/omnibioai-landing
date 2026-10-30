# Responsive validation

Status: PASS.

| Viewport | Automated overflow | Navigation/layout | Evidence |
| ---: | --- | --- | --- |
| 375px | Pass | Mobile menu and stacked form/cards | Playwright |
| 390px | Pass | Mobile menu; visual screenshot reviewed | Playwright + visual |
| 768px | Pass | Tablet menu and two-column content where appropriate | Playwright + visual |
| 1280px | Pass | Desktop navigation and About layout | Playwright + visual |
| 1440px | Pass | Wide desktop hero/QR and navigation | Playwright + visual |

The page has no horizontal document overflow. Catalog category controls intentionally scroll inside their own width-constrained filter row. Images preserve aspect ratio, forms collapse to one column, legal side navigation becomes inline, the QR card is removed at compact widths, and footer/card grids stack progressively.
