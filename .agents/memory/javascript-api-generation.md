---
name: API generation in JavaScript projects
description: Why API generation uses JavaScript runtime bundles rather than TypeScript barrels in this project.
---

The user's no-TypeScript application requirement also applies to shared runtime helpers. API generation may use TypeScript internally, but the delivered runtime must be JavaScript.

**Why:** The workspace generator emits TypeScript by default. Its generated validator barrel also collided with a query/path parameter type when the same operation had both kinds of parameters; a separate generation issue required DOM iterable types for Headers. Bundling only the generated validators avoids the duplicate type-export problem without altering the API contract.

**How to apply:** Regenerate from the contract, then compile the client and validator runtimes to JavaScript. Do not reintroduce generated type-barrel exports as application dependencies, or require TypeScript for the portable build.
