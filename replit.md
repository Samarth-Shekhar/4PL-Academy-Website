# 4PL Academy

A portable education discovery website and dynamic CMS connecting students, universities and industry.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run check` — plain JavaScript syntax checks
- `pnpm run build` — build API and website
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm db:migrate` — explicitly apply checked-in Drizzle migrations
- `pnpm db:seed` — idempotent initial-content import, never overwrite CMS edits
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, plain JavaScript ES modules
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec), compiled to JavaScript runtime modules
- Build: esbuild (CJS bundle)

## Where things live

See README.md for the repository map, local run instructions and data-verification notes.

## Architecture decisions

- Institution-directory inclusion must never be treated as proof of a 4PL partnership.
- ACAD BOT uses bounded read-only retrieval so it can abstain from unverified admissions facts without an external model.
- Initial data imports preserve source ambiguity and flag conflicts rather than silently reconciling them.

## Product

Degree and institution discovery, professional courses, comparisons, admissions enquiries, verified informational assistance, and administrator-managed content.

## User preferences

- Do not deploy, configure deployment, assume final hosting, or suggest publishing. Replit is development-only.
- Keep the requested stack portable: React/Vite/plain JavaScript, Express, PostgreSQL/Drizzle, pnpm.
- Use the supplied official 4PL logo unchanged. Navy dominates; gold is an accent.
- Do not fabricate fees, accreditation, eligibility, deadlines, salary/placement claims, facilities or partnerships.
- Database content is the source of truth; React must not hardcode CMS-managed institution, program or course data.
- Mobile-first experience must work from 320px; generic imagery must not be presented as a real institution's campus.
- Use upGrad SOT as storytelling inspiration only, never copy its layout or animations. The homepage should be cinematic, interactive and uniquely 4PL, with no generated website mockups.
- Treat city-centre map coordinates as approximate directory locations, not campus addresses or evidence of a partnership. Real-event galleries require approved 4PL/university media.
- Keep the public header limited to Home, About Us, Courses, Universities, Blogs and Contact Us. Do not add extra top-level links or action buttons.

## Gotchas

- The initial CMS administrator requires ADMIN_EMAIL and ADMIN_PASSWORD through Secrets or a local environment. Do not insert a default account.
- SITE_URL is intentionally unset until a canonical origin is approved. Never substitute the development domain.
- Archive/restore content instead of destroying records.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
