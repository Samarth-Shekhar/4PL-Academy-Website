---
name: Website performance verification
description: Interpret Lighthouse reports against the correct runtime and preserve branding while optimizing assets.
---

Treat Lighthouse results from the development preview separately from the minified production build. Development instrumentation and hosting headers can produce warnings that are not controlled by page metadata.

**Why:** Uploaded Lighthouse reports measured the development URL, including unminified development modules and a hosting-provided X-Robots-Tag blocking indexing. Changing the application's robots meta tag cannot override that header.

**How to apply:** Fix actual accessibility, image-loading and document issues in the app, but measure final performance and indexing against the published site. Do not remove useful development tools or weaken security just to improve preview scores.

Preserve original logo artwork and source images when producing smaller responsive derivatives. Retain font family names and font licenses when self-hosting fonts.

**Why:** The owner repeatedly requires the original Academy logo to remain intact and wants the established visual design preserved.

**How to apply:** Keep source assets, preserve aspect ratios and transparent cutouts, and compare rendered results on desktop and mobile.
