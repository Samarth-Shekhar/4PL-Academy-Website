---
name: Enquiry integrity
description: Preserve contact subjects and disambiguate university-specific program enquiries.
---

Resolve program enquiries by institution as well as title whenever the
institution is supplied; a first title-only match is not reliable.

**Why:** Several universities offer the same named logistics degree. A
title-only lookup associated a VGU selection with another institution's
record, despite retaining the correct university text.

**How to apply:** Scope the linked program to its published university.
Preserve enquiry text without inventing an association when no match exists.

Contact subjects are currently retained as a labelled prefix to the enquiry
message rather than requiring a separate contact-only data model.

**Why:** This keeps existing enquiry consumers and other forms compatible
while ensuring the new subject is not discarded by the public API.

**How to apply:** Check the combined subject/message against the API length
limit. If introducing a dedicated subject field later, migrate the entire
capture and staff-view flow, not just the form input.
