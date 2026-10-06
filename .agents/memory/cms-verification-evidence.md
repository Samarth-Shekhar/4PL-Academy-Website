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

Browser test scripts do not necessarily inherit workspace environment secrets.
Confirm a secure sign-in path before scheduling a protected-editor run.

**Why:** A protected CMS verification attempt could not authenticate because
the browser runtime did not contain the workspace admin credentials.

**How to apply:** Reuse a supported authenticated test session when available.
Never expose credentials or add an authentication bypass to make a test pass.
If sign-in remains unavailable, explicitly report the UI verification limitation
and use source, validation and public API checks for the coverage they can provide.
