# Orbitra

Katalog objek luar angkasa — **Next.js + Prisma + SQLite**.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend:** Next.js Route Handlers (`/api/*`)
- **Database:** SQLite via Prisma (`prisma/dev.db`)
- **Auth:** JWT in httpOnly cookie (`jose`)

## Fitur

- Pengunjung: katalog, search/filter, detail objek
- Admin: login, dashboard, CRUD, reset seed
- Data tersimpan di database (bukan localStorage)

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Salin `.env.example` → `.env` jika belum ada.

## Admin demo

```
username: admin
password: orbitra123
```

Ubah di file `.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`).

## API

| Method | Path | Akses |
|--------|------|--------|
| GET | `/api/objects` | Publik |
| POST | `/api/objects` | Admin |
| GET | `/api/objects/:id` | Publik |
| PUT | `/api/objects/:id` | Admin |
| DELETE | `/api/objects/:id` | Admin |
| POST | `/api/objects/reset` | Admin |
| POST | `/api/auth/login` | Publik |
| POST | `/api/auth/logout` | Publik |
| GET | `/api/auth/session` | Publik |

## Scripts

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Development |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run db:studio` | Prisma Studio (lihat DB) |
| `npm run db:migrate` | Migration baru |

## Catatan deploy (Vercel)

SQLite file **tidak cocok** untuk serverless Vercel (filesystem ephemeral).  
Untuk production cloud, ganti `DATABASE_URL` ke **Postgres** (Neon/Supabase) dan ubah `provider` di `prisma/schema.prisma` ke `postgresql`.

Lokal dengan SQLite tetap ideal untuk development.
