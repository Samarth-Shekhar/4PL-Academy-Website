---
name: Local environment-file guard
description: Agent file tools reject even comment-only .env creation in this workspace.
---

Do not attempt to create or edit `.env` through agent file tools, even as an empty/comment-only placeholder. Keep the portable `.env.example` and local configuration instructions instead.

**Why:** The workspace explicitly rejected a comment-only `.env` creation because environment files are protected. Actual credentials must use the secure secrets flow, not file edits or chat.

**How to apply:** The standalone app can still load an owner's locally configured environment file outside Replit. For development credentials here, use the environment/secrets tools when configuration is requested; never insert a default administrator or bypass authentication.
