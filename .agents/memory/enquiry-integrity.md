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

Use Microsoft Graph app-only tenant credentials for complete lead emails, rather than a transactional-email API key.

**Why:** The user explicitly selected the Microsoft tenant credentials method after declining the transactional-email API-key setup.

**How to apply:** Read credentials from securely configured server environment variables or the owner's ignored local `.env`. Require Microsoft Graph Mail.Send Application permission with admin consent; never put credentials in tracked example files. Keep saved enquiries intact if email delivery fails.

All enquiry forms need a selectable phone country/calling code and country-specific validation, not just a generic digit-length check.

**Why:** The user asked for precise phone submissions for every country across all forms.

**How to apply:** Preserve the selected country together with the international-format number in backend capture, staff editing, exports and email details. Do not claim number validation proves ownership or reachability.

Keep each form’s leads in its own named staff section and table while retaining a shared category-based lead store.

**Why:** The user wants to manage Contact Us, Partner With Us, Counselling and other forms by name. Separate staff views provide this without splitting historical records or duplicating capture and notification logic.

**How to apply:** Allow full lead editing and confirmed permanent deletion. Preserve original consent and received time. Validate/rewrite a historical phone only when staff change its phone or country, not during unrelated edits.
