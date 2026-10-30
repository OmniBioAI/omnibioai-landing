# SEO validation

SEO status: PASS for the local production artifact.

- Every route has a unique title and description.
- Clean canonical URLs are emitted for public pages; legacy `.html` artifacts point to the clean canonical.
- Open Graph and Twitter summary metadata are present.
- `<html lang="en">`, semantic headings, landmarks, descriptive links, and image alternatives are present.
- Organization JSON-LD contains only factual name, URL, logo, GitHub, and Twitter properties.
- `robots.txt` allows public content and disallows both admin paths.
- `sitemap.xml` lists only canonical public routes; admin and 404 are excluded.
- Admin and 404 documents carry explicit no-index directives.
- All important content is prerendered and crawlable without client JavaScript.

Lighthouse SEO: 100 mobile and 100 desktop. No staging environment configuration exists in this repository; a staging host must add host-level no-index behavior if one is introduced.
