# Careers job openings section

- Added Job Openings to the careers section navigation and page.
- Empty public content shows “No open positions right now.”
- Future openings are editable in the existing Careers page's admin editor.
- Job entries support title, description and an optional details/application URL.
- Existing item controls support add, edit, remove and reorder.
- Removing all entries produces an empty array and restores the empty state.
- Required-title and safe-link validation are implemented.
- Pure-function checks passed for add/edit/remove payload serialization, valid empty arrays, blank-title rejection and unsafe-link rejection.
- JavaScript checks, production build and whitespace checks passed.
- Public API returns the published careers page with no job entries.
- Desktop screenshot confirms the section, message and active sidebar link.

The protected-browser check could not sign in because workspace credentials
were unavailable in the browser test runtime. Therefore, authenticated editor
interactions are not browser-verified. No credentials were exposed, no test
positions were published, and no content records were modified.
