---
name: Crawler URL routing
description: Avoid false-positive SEO checks when web and API artifacts have separate routing.
---

Validate the actual XML or plain-text payload at public `/sitemap.xml` and `/robots.txt`, not just an HTTP 200 response or the API's internal SEO endpoints.

**Why:** The frontend's SPA fallback returned HTML with HTTP 200 while working crawler handlers existed in the separate API service. A status-only check missed the routing problem.

**How to apply:** Preserve public crawler routing when changing frontend servers. Preview URLs may use their development origin, but production must use an explicitly configured site URL rather than a guessed published address.
