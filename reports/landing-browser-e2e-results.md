# Browser E2E results

Status: PASS. Command: `npm run test:e2e` against `dist/` served by Vite preview. Browser: Chrome for Testing 156.0.8078.4 ARM64 via Playwright 1.64.1.

Final result: 24/24 tests passed in 6.2 seconds after a clean `npm ci`, final build, and metadata/console cleanup.

Coverage includes:

1. Homepage render and desktop navigation.
2. Direct load and refresh for ten existing clean/legacy document URLs.
3. Explicit 404 fallback.
4. Mobile keyboard navigation and Escape closure.
5. Contact validation, approved Worker URL, payload, real success boundary, and deterministic failure boundary.
6. No horizontal overflow at 375, 390, 768, 1280, and 1440 pixels.
7. Axe on home, About, and Privacy with no serious/critical violations.
8. Critical Docs and Web Studio destination checks.
9. Admin authentication/list/detail/approval against deterministic mocks of the actual Worker paths and headers.
10. Visual evidence captures at mobile, tablet, desktop, and About desktop.

No live beta request or admin mutation was sent. Mocked success is explicitly a boundary test and is not represented as live delivery.
