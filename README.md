# 4PL Academy

A portable React + Vite education website and Express content-management API, written in plain JavaScript ES modules. PostgreSQL is the source of truth; Drizzle defines the schema. Replit is used for development only. No deployment or hosting-provider configuration has been created.

## Local development

Requirements: Node.js 22+ (24 recommended), pnpm 10+, and PostgreSQL.

1. Run `pnpm install`.
2. Copy `.env.example` to `.env` on your local machine, or supply the variables through your environment. Do not commit `.env`.
3. Configure `DATABASE_URL`, a long random `SESSION_SECRET`, `ADMIN_EMAIL`, and an initial `ADMIN_PASSWORD` of at least 12 characters.
4. Run `pnpm db:migrate`.
5. Run `pnpm db:seed` once to import initial content. Seeding is idempotent and does **not** overwrite CMS edits.
6. Run `pnpm dev`. The portable local server serves both the website and `/api` on `PORT` (default 5000).

In this project's Replit preview, the managed API and frontend workflows run separately. Do not start a second copy using `pnpm dev` while those workflows are running.

## Build and serve

```sh
pnpm build
pnpm start
```

`pnpm start` serves the built frontend and API together through Express. It does not apply migrations or reset the database. No hosting provider is assumed.

Configure `SITE_URL` with the final canonical origin when that origin has been approved. Until then, canonical sitemap generation fails explicitly instead of guessing a domain. The portable server generates `robots.txt`, database-driven `sitemap.xml`, and server-side metadata. These routes are also available under `/api/seo/` in the development preview.

## Data and verification

- The supplied Student Grad workbook provides **48 institution-directory records**, including source annotations and potential duplicates. Inclusion in the directory does **not** establish a 4PL partnership.
- Exact PGDM/BBA/BCA/B.Tech labels are imported only where supplied. Generic “UG”/“UG & PG” entries become discovery listings requiring verification, not invented named degrees or specializations.
- Four industry-integrated degree pathways are sourced from the official 4PL homepage.
- Twelve professional course names and their classifications come from the user's approved brief.
- Fees, duration, eligibility, accreditation, deadlines, facilities, salaries and placement statistics are left blank unless approved information is supplied.
- The NDIM spreadsheet link points to Fostiima; it is withheld and flagged for review. Malformed locations, shortened links, non-URL application instructions, multiple-link entries and likely duplicates are also flagged.
- Coupon codes remain private import metadata and are excluded from public APIs and ACAD BOT.
- No fictional university logos, campus photos, testimonials or articles are seeded.
- Privacy and refund policies remain drafts pending approval.

`scripts/data/institutions.json` is a one-time seed input, not the live content store. `scripts/import-workbook.py` can regenerate this input using Python's standard library without spreadsheet packages. The original workbook is retained under `attached_assets/`.

## CMS

Open `/admin/login`. The initial administrator is created from environment configuration only when no administrator exists. No default password, password display or authentication bypass exists.

The CMS manages universities, programs, professional courses, blogs, FAQs, informational pages, approved media URLs, SEO and admissions enquiries. Archiving is reversible. Public APIs show published records only. Private routes require a valid administrator session.

Media management supports approved image/video URLs and direct administrator uploads through App Storage. Uploaded bytes are stored outside PostgreSQL; the database stores paths and metadata only. Images are limited to 10 MB and videos to 25 MB. JPEG, PNG, WebP, AVIF, MP4 and WebM are accepted; SVG/HTML uploads are not accepted.

Uploads are private until a verified, published record references the file. Administrators can preview drafts. Videos require a poster before publication and support byte-range playback. Publishing a media record is an approval action, not proof that a photographed campus or company belongs to 4PL.

The storage adapter uses `PRIVATE_OBJECT_DIR` and the Replit signing service during development. Outside Replit, supply a compatible private `STORAGE_SIGNER_URL` and object-storage path, or replace the small `media-storage.js` adapter with your approved provider. Uploads return an explicit configuration error when no provider is available; approved URL-based media and the rest of the site do not require Replit storage. No deployment is configured.

### Homepage controls

`/admin/homepage` manages individual homepage sections: text, media, CTAs, enable/disable, ordering, featured status and learning/admissions story steps. Separate CMS collections manage industry companies, certifications and approved testimonials. They use the same existing PostgreSQL content store, archive/restore lifecycle and authentication as other catalog content.

Company relationship types are displayed explicitly; company logos, certifications and testimonials require verification before appearing on the homepage. No demonstration partners, credentials or testimonials are seeded. The real-event gallery is empty until approved 4PL or university media is provided.

The university map distinguishes directory entries from verified partnerships. Seed coordinates are approximate city centres for recognizable locations in the supplied directory, not campus coordinates. Unrecognized locations are not guessed. Administrators can provide approved campus coordinates and region data. Seeding does not replace coordinates after the initial geographic enrichment or overwrite CMS edits.

New homepage photography comes from Pexels and is labelled as illustrative—not as actual 4PL students, campuses or events. Credits are in `artifacts/academy/public/images/editorial/credits.md`. The India silhouette is generated from public-domain Natural Earth country boundaries and is a schematic discovery aid, not a campus-location survey.

Admissions forms save enquiries to PostgreSQL for the admissions team. They do not send email or confirm university admission. Application links supplied in the workbook require verification before use as official admissions destinations.

### Education discovery and counselling

The public header intentionally remains Home, About Us, Courses, Universities, Blogs and Contact Us, without additional action buttons. Book Counselling is the primary conversion within pages; the existing verified-content assistant remains secondary.

Program cards and detail pages expose database-managed facts, intake, fees, eligibility and highlights. Discovery supports degree, professional-course and approved-certification selection; comparison supports up to three degree programs, including curriculum and career paths. `/professional-courses` and its detail/category routes are available alongside the existing `/courses` URLs. `/book-counselling` and `/counselling` share the contextual booking form.

Program semesters are managed as named groups of modules in the CMS; the existing curriculum list remains supported. University-linked approved media is managed through `/admin/media`. Contact offices supplied in the discovery brief are initial published Site Settings records, not React constants; both UK numbers are retained. Subsequent imports preserve these settings edits. Legacy homepage bot conversion links are migrated once to counselling defaults.

Counselling requests include interest, university/program selection, qualification, city, consent, page source and session UTM attribution. The shared lead schema and checked-in migration persist these fields. Administrator lead lists/details and filtered CSV exports include them. No additional administrator or authentication bypass is created for testing; signed-in CMS verification requires owner-configured credentials.

## ACAD BOT

ACAD BOT uses bounded, read-only catalog retrieval and approved fields. It does not call an external LLM or execute user-written SQL. Missing fees, eligibility, dates and other unverified facts receive the required “I don't have verified information…” response. It cannot access administrator credentials, private leads, coupon codes or database mutation tools.

For ambiguity, it asks the user to identify the exact institution and program. Links to the relevant public records are returned as sources. Counselling requests are handled separately through the normal consent-based admissions form.

## Security

- Scrypt password hashes with random salts.
- HTTP-only, same-site cookies; secure cookies in production and proxied Replit development.
- Opaque session tokens; only keyed hashes are stored in PostgreSQL. Sessions expire after eight hours.
- Sessions revoked on password changes.
- Same-origin write protection, request limits, login/chat/form rate limiting and HTTP security headers.
- Shared generated Zod request validation and parameterized Drizzle queries.
- Safe errors without stack traces, passwords, private credentials or connection strings.
- Secrets belong in the server environment, never browser `VITE_` variables.

## Development commands

```sh
pnpm check                              # JavaScript syntax checks
pnpm db:generate                        # Create a reviewed Drizzle migration
pnpm db:migrate                         # Apply checked-in migrations explicitly
pnpm db:seed                            # Idempotent initial import
pnpm --filter @workspace/api-spec codegen # Regenerate API helpers from OpenAPI
```

OpenAPI lives in `lib/api-spec/openapi.yaml`. The generator uses TypeScript as a temporary intermediate internally and emits plain-JavaScript runtime modules for the React Query client and Zod validators. Application code does not require TypeScript.

## Layout

- `artifacts/academy/`: React website and responsive administrator UI.
- `artifacts/api-server/`: Express APIs, authentication, verified retrieval and seeding.
- `lib/db/`: PostgreSQL connection and JavaScript Drizzle schema.
- `lib/api-spec/`: API contract and generator configuration.
- `lib/api-client-react/`, `lib/api-zod/`: shared JavaScript API runtimes.
- `drizzle/`: checked-in database migrations.
- `scripts/`: one-time source extraction and checks.

The unused canvas sandbox is provided by the development environment and is not part of the 4PL website.
