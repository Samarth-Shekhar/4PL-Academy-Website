# Legacy blog import verification

Source: https://4placademy.com/blogs.php

- All 40 listing entries and linked full article pages were fetched without truncation.
- Original listing titles, excerpts, authors and publication dates are retained.
- Source headings are retained separately when they differ from listing titles.
- Shared chat/form widgets and repeated website footer copy are excluded from article bodies.
- All 40 original images are saved unchanged; each is 900 × 500 (9:5).
- SHA-256 checks confirm every served image matches the retrieved original bytes.
- All 40 public detail endpoints return the expected title and complete imported article text.
- Public list records match the import plan's excerpts, authors and original dates.
- Blog listing, article image and reusable blog cards use natural-height images without cover cropping or hover zoom.
- Article formatting supports headings, emphasis, lists, tables and reference links; raw HTML is disabled.
- Desktop listing and mobile article screenshots show the original artwork and readable content without browser errors.
- JavaScript checks, production build and diff whitespace checks passed.

The import plan and image manifest contain source URLs, dimensions and file hashes.
The source host's incomplete certificate chain required an isolated public-image
retrieval fallback; the application and API TLS settings were not changed.
