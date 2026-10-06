---
name: Unicode-safe content ingestion
description: JavaScript-valid JSON can still fail PostgreSQL JSONB after unsafe Unicode text transformations.
---

Content import transformations must preserve whole Unicode code points and reject
lone UTF-16 surrogates before sending a JSON payload to PostgreSQL.

**Why:** Matching an emoji with a JavaScript character class without Unicode mode
can remove only half of its surrogate pair. JSON.stringify accepts the remaining
lone surrogate, but PostgreSQL JSONB rejects it as invalid JSON. Transport changes
or base64 encoding do not repair the malformed text.

**How to apply:** Use Unicode-mode regular expressions for emoji/code-point
matching and code-point-aware truncation for externally supplied content. Validate
transformed strings with isWellFormed before a bulk write; preserve atomic imports
so malformed source text cannot cause a partial catalog update.
