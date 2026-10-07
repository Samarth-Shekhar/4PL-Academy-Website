---
name: Transparent logo verification
description: Check internal negative spaces as well as outer-background alpha after removing a flat logo's background.
---

Verify transparency inside a flat logo's negative spaces, not just at the
outer corners or by checking that the file has an alpha channel.

**Why:** Background removal produced transparent corners but retained white
foreground pixels inside an uploaded navy/gold mark's cutouts.

**How to apply:** Inspect opaque near-white pixels before generating icons.
Only remove them globally when the artwork has no intentional white ink;
preserve the actual logo colours and antialiased edges. Generate all icon
sizes from the verified transparent master.
