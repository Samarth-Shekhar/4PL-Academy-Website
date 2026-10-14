---
name: CMS management scope
description: Owner's standing requirement for managing 4PL Academy site content from its admin interface.
---

All backend-managed website content should be manageable through the authenticated admin interface, including create, edit, publish/unpublish, and delete actions.

**Why:** the user explicitly asked for each content type to be manageable from the frontend so the site can be maintained without direct database edits.

**How to apply:** when adding a backend-managed content type, include its authenticated admin navigation, editor, publication controls, and safe deletion behavior. Preserve reversible archive/restore when permanent deletion is offered; prevent deleting records that are still referenced.

Only the configured owner may view and manage administrator profiles. Other administrators retain normal content access, not account-management privileges.

**Why:** the user explicitly selected configured-owner-only account management.

**How to apply:** enforce the permission on the server as well as the interface. Show account IDs and emails, never existing passwords or hashes; new-password actions must revoke the target account's existing sessions.
