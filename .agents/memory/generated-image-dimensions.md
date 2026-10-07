---
name: Generated image dimensions
description: Validate generated image dimensions rather than treating quality or aspect prompts as output-size guarantees.
---

Inspect generated files before claiming native resolution or a requested aspect
ratio. A high-quality generation setting and a wide-image prompt do not guarantee
4K or landscape output.

**Why:** High-quality image requests with wide 16:9 prompts in this workspace
returned 1024×1024 files. Larger landscape web exports therefore required cropping
and upscaling rather than being native 4K.

**How to apply:** Check actual dimensions and export suitable responsive variants.
Describe upscaled assets as 4K-sized exports, not native 4K photography. If native
detail is essential, obtain appropriately licensed or owner-provided originals.

For tall mobile heroes, use a subject-focused portrait crop alongside the desktop
landscape version.

**Why:** A width-based responsive image selection does not account for a landscape
image being enlarged to fill a tall container with `object-fit: cover`. This can
make the mobile background look soft even when the desktop version looks clear.

**How to apply:** Preserve the same subject in both crops, match preloading to the
displayed crop, and keep original source files unchanged for later exports.
