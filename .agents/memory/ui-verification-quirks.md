---
name: UI verification quirks
description: Avoid false failures when checking Radix accordions and browser viewport widths.
---

Do not enumerate Radix Accordion triggers by requiring an `aria-controls`
attribute: closed triggers may not expose it until their content is open.
Select triggers by their component/state attributes, expand them, then inspect
the controlled answer.

**Why:** A browser check incorrectly counted only the initially expanded FAQ,
although all six questions were present and worked.

**How to apply:** Test opening each question and read its answer after React
has updated the DOM.

For horizontal-overflow checks, compare document scroll width with document
client width rather than requiring equality with window inner width.

**Why:** A desktop browser's scrollbar made inner width 15 pixels larger than
the layout viewport, producing a false failure despite no overflow.

**How to apply:** Assert scroll width is no greater than client width.

JavaScript-driven auto-scroll must respond to live reduced-motion changes,
not only the preference present when the component mounts.

**Why:** A browser preference change left the old auto-scroll running even
though reduced motion had been requested; a live media-query subscription
stopped it correctly.

**How to apply:** Verify both animation resumption and a live switch to a
static single set of cards. CSS media queries alone do not stop JavaScript loops.
