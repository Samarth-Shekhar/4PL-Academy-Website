# Development CMS verification

Date: 2026-10-05  
Application: 4PL Academy  
Result: **Pass**

Administrator initialization was explicitly approved by the owner and used
credentials supplied through Secrets. Browser verification used normal
administrator authentication. No default credentials, authentication bypasses,
application code changes, or deployments were made.

## Coverage

| Requirement | Result and evidence |
| --- | --- |
| Homepage edit and persistence | Hero CTA changed to `/student-life`; admin API and signed-out link matched. Original CTA restored. |
| Reorder, disable, and restore including hero | Hero moved below the ecosystem section; public heading order matched. Disabling persisted `enabled:false` and removed both hero heading and CTA. Re-enabling restored the hero. |
| Exact homepage restoration | All 14 original homepage records matched the saved snapshot field-by-field; no differing IDs. Original nested story items and absent optional keys restored. |
| Explicit false and zero | Temporary homepage persisted `enabled:false`, `featured:false`, `verified:false`, and `sortOrder:0`. University latitude/longitude zero checks passed. Restored FAQ retained false flags and zero sort order. |
| Image and video upload | Valid PNG and MP4 fixtures uploaded through browser file inputs. Published approved image decoded publicly. |
| Automatic draft creation then update | Image upload returned POST 201 with ID 655; final metadata save returned PATCH 200 for that same ID. Media count increased from six to seven, not eight, and returned to six after cleanup. |
| Visible failures | Simulated upload and save HTTP 500 responses produced visible errors. Failed upload did not create a record; failed save retained editor state without silently modifying saved content. |
| Video poster requirement | Publishing video without a poster rejected visibly. Adding a poster allowed publication. Unpublishing blocked both video and poster. |
| Archive and restore | Temporary FAQ moved from published to archived, then restored as draft under the same ID and slug. |
| Relationship types | All eight company relationship choices observed; Technology Partner persisted and appeared as the public label. |
| Related records and links | University/program/course relationships and public certification detail links verified. Wrong-kind relationship IDs returned HTTP 400 without changing valid relationships. |
| Public approved nested images and logos | Nested story image, company logo, and partnership-approved university logo returned HTTP 200 and decoded in a signed-out browser. |
| Draft/unverified protection | Signed-out draft image and published-but-unverified image returned 404. Unpublished video/poster also returned 404. |

Image fixtures were 1×1 pixels. They verify upload, decoding, authorization, and
rendering, not photographic quality or visual polish.

## Cleanup

- All temporary content IDs 643–655 are absent.
- Original six media records remain; no temporary media drafts remain.
- All 14 original homepage records were restored exactly.
- All eight uploaded test binaries were physically deleted using the existing
  private storage signer. Each DELETE returned 204; direct storage GET afterward
  returned 404. This verifies deletion independently of the app's access rules.
- No source code or deployment changes were needed.

The non-secret request/status and cleanup manifest is
`cms-followup-evidence.json`. It contains no credentials, session tokens, or
signed storage URLs.
