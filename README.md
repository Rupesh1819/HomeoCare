# Bhagwati Clinic — Management System

Enterprise clinic management platform for **Bhagwati Clinic** — consultations, prescriptions, lab management, billing, and follow-ups in one secure workspace.

## Features

- 🔐 Secure role-based login (Super Admin, Doctor, Lab Technician, Pharmacist)
- 📋 Patient registration, profiles, and medical history
- 📅 Appointment scheduling with live status tracking
- 💊 Prescription generator with PDF print/download
- 🧪 Lab management — test master, orders, results, and reports
- 💰 Billing — invoice creation, payment recording, and receipt printing
- 📦 Pharmacy inventory with batch tracking and expiry alerts
- 📊 Practice analytics and revenue dashboards
- 📱 WhatsApp integration templates
- 🛡️ Audit logging for compliance

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Supabase Auth with auto-provisioning
- **PDF**: pdfmake for invoices and prescriptions
- **Charts**: Recharts
- **Styling**: Tailwind CSS + custom design system

## Run Locally

```bash
npm install
cp .env.example .env   # Then fill in your Supabase + DB credentials
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000` and log in with your clinic credentials.

## Environment Variables

Copy `.env.example` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection (transaction pooler) |
| `DIRECT_URL` | PostgreSQL connection (session pooler, for migrations) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## Deployment

Deployed on **Vercel** with automatic builds from the `main` branch.

```bash
git push origin main   # Triggers Vercel deployment
```

## License

Private — Bhagwati Clinic internal use only.
