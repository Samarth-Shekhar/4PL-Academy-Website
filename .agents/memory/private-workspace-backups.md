---
name: Private backup protection
description: Why private workspace exports need preview-server blocking as well as Git/publish exclusions.
---

Private database exports require protection from every development preview server, not just exclusion from Git and publishing.

**Why:** Vite's workspace-wide filesystem access can serve root-level private files through filesystem URLs even when Git and publishing ignore them. File permissions do not help when the preview process runs as the file owner.

**How to apply:** place private exports in a dedicated ignored folder with restrictive permissions, deny that folder in each preview server, and verify ordinary and raw filesystem requests return a denial without printing file contents. Remove any temporary restored copies after backup verification.
