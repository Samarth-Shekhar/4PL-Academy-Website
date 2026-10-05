---
name: CMS verification evidence
description: Preserve acceptance proof and cleanup information across long signed-in browser runs.
---

Persist a scrubbed acceptance matrix and temporary-data cleanup manifest during
long CMS browser verification, rather than leaving all evidence in the tester's
notebook.

**Why:** A long browser run lost detailed intermediate acceptance evidence during
conversation compaction even though the tester retained a general pass summary.
That required additional narrowly scoped checks to substantiate completion.

**How to apply:** Record submitted values, resulting request/status/record IDs,
restoration comparisons, and test-object IDs as checks finish. Never record
credentials, session cookies, signed URLs, or other secrets. Treat an application
404 as access-control evidence, not proof of physical storage deletion.
