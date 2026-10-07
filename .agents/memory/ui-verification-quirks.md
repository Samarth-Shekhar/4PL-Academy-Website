---
name: UI verification quirks
description: Avoid false failures involving controls, viewport coordinates, motion preferences and browser debug sessions.
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

For homepage section checks, scroll the target into view rather than using
its raw offsetTop as a document scroll coordinate.

**Why:** Reveal wrappers can be offset parents; a section's offsetTop may be
relative to its wrapper. A check stayed at the hero and falsely reported that
an intentionally offscreen-paused carousel was not moving.

**How to apply:** Use scrollIntoView, or the target's bounding rectangle plus
the current document scroll position, and confirm it intersects the viewport
before measuring visible-only animations.

Continuous auto-scroll should accumulate fractional displacement and avoid
native mandatory snap/smooth-scroll settings during drift.

**Why:** Tiny per-frame increments can be rounded away by scrollLeft, while
mandatory snap or smooth scrolling can override a continuously written position.

**How to apply:** Keep a floating-point position, reserve smooth/snap behavior
for manual interactions, and derive loop-copy coverage from viewport width.

Set browser emulation overrides explicitly in every new debugging session.

**Why:** A fresh CDP connection did not retain the previous session's emulated
reduced-motion preference, falsely suggesting that the static carousel still
contained looping copies.

**How to apply:** Set the viewport and motion preference before each relevant
check, confirm matchMedia reports the intended value, and move the mouse away
from a pause-on-hover region before measuring autoplay.

A loaded map iframe and a valid URL are not proof that its address resolved.

**Why:** Google returned a loaded, blank embedded search for a verbose office
address; the building/street/locality lookup produced the actual building pin.

**How to apply:** Scroll the map into view and verify the rendered building
label and surrounding streets. Preserve the full displayed postal address;
do not replace failed geocoding with an approximate city-centre pin.

Verify animated-card navigation with real pointer clicks, not just href
inspection or programmatic element clicks.

**Why:** A carousel's visible links navigated with DOM click() but real clicks
hit the containing 3D layer instead of the anchors.

**How to apply:** Check the element under the visible link with
elementFromPoint, then click that surface and confirm the resulting route.
Keep this distinction when evaluating transformed or overlapping components.
