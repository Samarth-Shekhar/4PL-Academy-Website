---
name: Image-tooling defaults
description: ImageMagick font assumptions when producing image comparisons in this workspace.
---

Do not assume ImageMagick has an available default font. Supply an explicit, existing font when adding text or using montage.

**Why:** In this workspace, images decoded successfully but annotation and montage repeatedly failed because the default font was empty, including a montage without intentionally added captions.

**How to apply:** Check font availability before text operations. For unlabelled contact sheets, concatenate image rows and columns without introducing a font dependency.
