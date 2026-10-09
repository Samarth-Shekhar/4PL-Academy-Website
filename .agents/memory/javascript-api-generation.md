---
name: API generation in JavaScript projects
description: Why API generation uses JavaScript runtime bundles rather than TypeScript barrels in this project.
---

The user's no-TypeScript application requirement also applies to shared runtime helpers. API generation may use TypeScript internally, but the delivered runtime must be JavaScript.

Use the generated package's public entry point rather than assuming an intermediate source barrel still exists after generation.

**Why:** Clean finalization removes intermediate barrels while preserving the JavaScript runtime exposed through package exports.

**How to apply:** After regeneration, inspect the package exports and actual validator names before writing standalone validation checks. Do not infer operation names from route filenames.

**Why:** The workspace generator emits TypeScript by default. Its generated validator barrel also collided with a query/path parameter type when the same operation had both kinds of parameters; a separate generation issue required DOM iterable types for Headers. Bundling only the generated validators avoids the duplicate type-export problem without altering the API contract.

**How to apply:** Regenerate from the contract, then compile the client and validator runtimes to JavaScript. Do not reintroduce generated type-barrel exports as application dependencies, or require TypeScript for the portable build.

Saving an extra field in CMS JSON does not automatically expose it through the public API; response validators discard undeclared fields.

**Why:** Supporting page photos were saved successfully but disappeared from the public response because their initial JSON key was outside the published contract.

**How to apply:** Verify the actual public response when adding CMS-backed fields. Reuse an existing typed CMS item shape where appropriate, or update the API contract and regenerate its validators. Ensure the CMS editor also preserves the field on save.
