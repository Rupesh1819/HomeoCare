# HomeoCare Pro Enterprise

Responsive clinic management workspace built from the supplied HomeoCare Pro specification and Google Stitch prototype.

## Included

- Secure login experience and role-aware application shell
- Practice dashboard with patient, appointment, follow-up, and revenue analytics
- Searchable patient registry, four-step registration, and longitudinal profile
- Appointment calendar with live status actions
- Treatment history and prescription generator with print layout
- Medical report center, billing, inventory, analytics, follow-ups, WhatsApp templates, staff, settings, dark mode, and language preferences
- PostgreSQL/Prisma enterprise data model with indexes and audit entities
- Local PostgreSQL Docker configuration and Supabase/WhatsApp environment placeholders

The UI runs in demo mode with realistic local data. Supabase Auth, Storage, server actions, WhatsApp/SMS provider calls, and production backup jobs require project credentials before they can be connected.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Demo credentials are prefilled on the login screen.

## Database

```bash
copy .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:validate
```

For a first migration after configuring PostgreSQL:

```bash
npx prisma migrate dev --name init
```

## Production checklist

1. Create a Supabase project and place credentials in `.env`.
2. Connect Supabase Auth identities to `User.authUserId`.
3. Add server actions/API routes for patient, appointment, billing, and file workflows.
4. Store medical files in private Supabase Storage buckets with signed URLs.
5. Configure Meta WhatsApp Business and an SMS fallback provider.
6. Apply rate limiting, CSP, CSRF protection, upload validation, audit middleware, and retention policies.
7. Run migrations against managed PostgreSQL and deploy the Next.js app to Vercel.
