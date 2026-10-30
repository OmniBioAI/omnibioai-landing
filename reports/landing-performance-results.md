# Performance results

Audit date: 2026-10-30. Lighthouse 13.6.0, Chrome for Testing 156.0.8078.4 ARM64, Vite production preview on localhost. Scores are laboratory measurements, not field data.

| Profile | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile default | 99 | 100 | 100 | 100 | 1.4s | 1.4s | 40ms | 0.057 | 1.4s |
| Desktop preset | 99 | 100 | 100 | 100 | 0.4s | 0.4s | 0ms | 0.074 | 0.4s |

Raw results: `reports/lighthouse-home-mobile.json` and `reports/lighthouse-home-desktop.json`.

Production browser payload at final build:

- App JavaScript: 87.86 kB raw / 23.06 kB gzip.
- React vendor JavaScript: 141.61 kB raw / 45.44 kB gzip.
- CSS: 13.33 kB raw / 3.77 kB gzip.
- Prerendered homepage HTML is approximately 75 kB raw and contains complete content.
- Source maps are disabled in production artifacts.

The legacy homepage was 171,819 raw bytes / 34,748 gzip with no application bundle. The migration adds hydration JavaScript but cuts document duplication and achieves the measured performance target. Third-party font CSS remains render-blocking; it is retained for brand consistency. No analytics or advertising scripts were added.
