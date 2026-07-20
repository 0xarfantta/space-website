# Orbitra — agent notes

## Git workflow (user preference)

Setelah mengubah kode di repo ini:

1. `git add` file yang relevan  
2. `git commit` dengan pesan singkat yang menjelaskan perubahan  
3. `git push` ke `origin` (branch `main`)

Lakukan otomatis tanpa diminta ulang, kecuali:

- user minta jangan push, atau  
- push gagal (auth/konflik) — laporkan errornya

Repo remote: `https://github.com/0xarfantta/space-website.git`

## Backend

- Prisma 5 + SQLite (`DATABASE_URL=file:./dev.db`)
- API under `src/app/api/`
- Do not commit `.env` or `prisma/*.db`
- After schema change: `npx prisma migrate dev`
