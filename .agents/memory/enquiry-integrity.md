---
name: Enquiry integrity
description: Complete lead capture and email notification, preserved contact subjects, and university-specific program enquiries.
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

All public enquiry and callback forms must save their complete submissions in the backend and email the academy's designated contact inbox.

**Why:** The user requested both backend storage and the whole form's details by email after submission.

**How to apply:** Include contact and careers enquiries, counselling, partnerships and chatbot callbacks. When adding fields, preserve them in backend capture, staff views and notifications.

Keep submission acceptance separate from notification delivery: an email outage must not discard a saved enquiry or imply it was never received.

**Why:** Mail-provider failures should not lose leads or encourage duplicate submissions.

**How to apply:** Save the enquiry before attempting email delivery, and report notification failures truthfully while keeping the saved record intact.

Use the academy's existing email provider for lead notifications without requiring an API key.

**Why:** The user declined the API-key setup and asked for the existing-provider option “without any api key.”

**How to apply:** Prefer an authenticated mailbox connection where available. Account authorization is still required; do not reintroduce a transactional-email API-key requirement.
