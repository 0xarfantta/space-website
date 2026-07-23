# Presentasi Orbitra  
## Katalog Objek Luar Angkasa — Frontend hingga Backend

**Proyek:** Orbitra  
**Jenis:** Full-stack web application  
**Stack:** Next.js 15 · React 19 · Tailwind CSS · Prisma · SQLite · JWT  

---

## 1. Pendahuluan

### 1.1 Latar belakang
Orbitra adalah aplikasi web katalog benda langit (planet, bintang, galaksi, nebula, lubang hitam, asteroid, komet, dan bulan). Pengunjung dapat menjelajah katalog; admin dapat mengelola data (CRUD) setelah login.

### 1.2 Tujuan aplikasi
| Tujuan | Keterangan |
|--------|------------|
| Informasi | Menyediakan data objek luar angkasa yang terstruktur |
| Interaktif | Pencarian, filter kategori, detail, peta tata surya, bandingkan objek |
| Manajemen | Admin menambah, mengubah, menghapus, dan mereset data |
| Full-stack | Memisahkan **tampilan (frontend)** dan **logika + data (backend)** |

### 1.3 Masalah yang diselesaikan
- Data tidak hanya di browser (localStorage), melainkan di **database**
- Login admin diproses di **server** (cookie HTTP-only), bukan hanya di client
- Kode frontend dan backend terorganisir dalam satu proyek Next.js

---

## 2. Arsitektur sistem

### 2.1 Gambaran umum

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                     │
│  UI React + Tailwind  ·  Hooks  ·  Fetch API            │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (JSON / FormData)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (Backend)                    │
│  App Router pages  ·  Route Handlers /api/*             │
│  Auth JWT (jose)   ·  Upload file  ·  Business logic    │
└──────────────────────────┬──────────────────────────────┘
                           │ Prisma ORM
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    DATABASE SQLite                       │
│              prisma/dev.db  (CelestialObject)             │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Pola arsitektur
Orbitra memakai **monorepo full-stack** dengan Next.js App Router:

- **Frontend:** komponen React di browser (Client Components)
- **Backend:** Route Handlers di `src/app/api/` (server)
- **Data access:** Prisma sebagai ORM ke SQLite

Keuntungan untuk presentasi akademik:
1. Satu codebase, mudah dijalankan (`npm run dev`)
2. Pemisahan concern jelas (UI ↔ API ↔ DB)
3. Cocok menjelaskan alur request–response modern

---

## 3. Frontend

### 3.1 Teknologi frontend

| Teknologi | Fungsi |
|-----------|--------|
| **Next.js 15** (App Router) | Routing, layout, SSR/static shell, integrasi API |
| **React 19** | Komponen UI interaktif |
| **Tailwind CSS 3** | Styling utility-first, tema glassmorphism, dark space |
| **Hooks kustom** | `useAuth`, `useObjects` — state & pemanggilan API |

### 3.2 Struktur folder frontend

```
src/
├── app/                 # Halaman (routing)
│   ├── page.jsx         # Beranda /
│   ├── detail/          # Detail objek
│   ├── login/           # Login admin
│   ├── dashboard/       # Dasbor admin
│   ├── add-object/      # Tambah objek
│   ├── edit-object/     # Ubah objek
│   ├── compare/         # Bandingkan 2 objek
│   ├── solar-system/    # Peta tata surya
│   ├── layout.jsx       # Layout global
│   └── globals.css      # Style global + glass effect
├── components/          # Komponen UI
├── hooks/               # useAuth, useObjects
└── lib/
    ├── api.js           # Helper fetch ke backend
    └── data.jsx         # Kategori, seed data, normalisasi
```

### 3.3 Halaman (routes) frontend

| Path | Akses | Fungsi |
|------|--------|--------|
| `/` | Publik | Hero, unggulan, kategori, katalog, tentang |
| `/detail?id=` | Publik | Detail objek (gambar, spek, deskripsi) |
| `/compare` | Publik | Bandingkan dua objek |
| `/solar-system` | Publik | Visualisasi tata surya interaktif |
| `/login` | Publik | Form login admin |
| `/dashboard` | Admin | Statistik, daftar, hapus, reset |
| `/add-object` | Admin | Form tambah + upload gambar |
| `/edit-object?id=` | Admin | Form edit objek |

### 3.4 Komponen penting

| Komponen | Peran |
|----------|--------|
| `HomePage` | Katalog, search, filter kategori |
| `ObjectCard` | Kartu glassmorphism per objek |
| `DetailPage` / `DetailImage` | Halaman detail + animasi gambar |
| `LoginPage` | Form login |
| `DashboardPage` | Panel admin |
| `ObjectForm` | Form create/edit + upload file |
| `AdminGuard` | Proteksi rute admin di UI |
| `BgScene` | Background foto + efek bintang/nebula/parallax |
| `Navbar` / `Footer` | Navigasi & footer |
| `ComparePage` | Perbandingan objek |
| `SolarSystemMap` | Peta tata surya |

### 3.5 Alur data di frontend

1. Komponen memanggil **hook** (`useObjects` / `useAuth`)
2. Hook memanggil **`src/lib/api.js`**
3. `api.js` melakukan `fetch` ke endpoint `/api/...`
4. Response JSON diubah jadi state React
5. UI re-render otomatis

Contoh konsep:

```
User klik "Masuk"
  → useAuth.login(username, password)
  → apiLogin() → POST /api/auth/login
  → Server set cookie session
  → State isAdmin = true
  → Redirect ke /dashboard
```

### 3.6 Fitur UI & UX

- **Bahasa Indonesia** pada label, tombol, dan pesan error
- **Glassmorphism** pada card (blur, border highlight, shadow 3D)
- **Responsive** (mobile-first, safe-area)
- **Loading screen** & empty/not-found states
- **Filter kategori** dengan normalisasi label EN→ID agar data lama tetap cocok
- **Upload gambar** dari drive (bukan hanya URL)

---

## 4. Backend

### 4.1 Teknologi backend

| Teknologi | Fungsi |
|-----------|--------|
| **Next.js Route Handlers** | API REST di `src/app/api/` |
| **Prisma 5** | ORM (Object-Relational Mapping) |
| **SQLite** | Database file (`prisma/dev.db`) |
| **jose** | Membuat & memverifikasi JWT |
| **Node.js fs** | Menyimpan file upload ke `public/uploads` |

### 4.2 Mengapa backend diperlukan?

| Tanpa backend | Dengan backend (Orbitra sekarang) |
|---------------|-------------------------------------|
| Data di localStorage browser | Data di database server |
| Mudah dimanipulasi user | Validasi & auth di server |
| Tidak sinkron antar device | Sumber data terpusat (satu DB) |
| Demo UI saja | Aplikasi full-stack |

### 4.3 Model data (Prisma)

```prisma
model CelestialObject {
  id             String   @id @default(cuid())
  name           String
  scientificName String
  category       String
  diameter       String
  mass           String
  gravity        String
  temperature    String
  distance       String
  yearDiscovered String
  imageUrl       String
  description    String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

- Satu tabel utama: **CelestialObject**
- `imageUrl` menyimpan path/URL gambar
- Timestamp otomatis untuk create/update

### 4.4 Endpoint API

#### Autentikasi

| Method | Endpoint | Akses | Fungsi |
|--------|----------|--------|--------|
| POST | `/api/auth/login` | Publik | Verifikasi admin, set cookie JWT |
| POST | `/api/auth/logout` | Publik | Hapus cookie session |
| GET | `/api/auth/session` | Publik | Cek apakah user masih login |

#### Objek (CRUD)

| Method | Endpoint | Akses | Fungsi |
|--------|----------|--------|--------|
| GET | `/api/objects` | Publik | Daftar semua objek + statistik |
| POST | `/api/objects` | Admin | Tambah objek |
| GET | `/api/objects/:id` | Publik | Detail satu objek |
| PUT | `/api/objects/:id` | Admin | Update objek |
| DELETE | `/api/objects/:id` | Admin | Hapus objek |
| POST | `/api/objects/reset` | Admin | Reset ke data seed |

#### Upload

| Method | Endpoint | Akses | Fungsi |
|--------|----------|--------|--------|
| POST | `/api/upload` | Admin | Upload gambar (JPEG/PNG/WebP/GIF, max 5 MB) |

### 4.5 Autentikasi (cara kerja)

```
1. Admin kirim username + password → POST /api/auth/login
2. Server bandingkan dengan ADMIN_USERNAME & ADMIN_PASSWORD (.env)
3. Jika cocok → buat JWT (jose) berisi { username, role: "admin" }
4. JWT disimpan di cookie HTTP-only: orbitra_session
5. Request admin berikutnya → server baca cookie & verify JWT
6. Jika valid → izinkan create/update/delete/upload
7. Logout → cookie dihapus
```

**Keamanan yang dijelaskan ke dosen:**
- Password **tidak** dicek hanya di JavaScript browser
- Cookie **httpOnly** → tidak bisa dibaca lewat `document.cookie` (XSS lebih sulit mencuri session)
- Kredensial di **`.env`** (tidak di-commit ke GitHub)
- Rute admin di UI dilindungi `AdminGuard`; aksi berbahaya dilindungi lagi di API

### 4.6 Lapisan server (`src/lib/`)

| File | Peran |
|------|--------|
| `prisma.js` | Singleton koneksi Prisma |
| `auth-server.js` | JWT, cookie, `requireAdmin()` |
| `objects-server.js` | CRUD, seed, statistik, migrasi kategori |
| `upload-server.js` | Validasi & simpan file gambar |
| `api.js` | Dipakai **frontend** untuk memanggil API |

### 4.7 Seed data
- Saat database kosong, server mengisi katalog awal dari `SEED_OBJECTS` (`data.jsx`)
- Admin bisa **reset ke seed** dari dasbor
- Kategori mendukung label Indonesia (Bintang, Galaksi, dll.) + migrasi label English lama

---

## 5. Alur end-to-end (contoh skenario)

### 5.1 Pengunjung melihat katalog
```
Browser buka /
  → HomePage + useObjects()
  → GET /api/objects
  → Prisma findMany()
  → JSON { objects, stats }
  → Render ObjectCard
```

### 5.2 Admin menambah objek
```
Login → cookie session
  → /add-object (AdminGuard cek session)
  → User isi form + pilih gambar
  → POST /api/upload (butuh admin)
  → POST /api/objects (butuh admin)
  → Prisma create
  → Redirect dashboard / detail
```

### 5.3 Admin menghapus objek
```
Dashboard → konfirmasi hapus
  → DELETE /api/objects/:id
  → Server requireAdmin()
  → Prisma delete
  → Refresh daftar
```

---

## 6. Environment & deployment

### 6.1 Variabel lingkungan (`.env`)
```
DATABASE_URL="file:./dev.db"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="orbitra123"
AUTH_SECRET="...rahasia untuk tanda tangan JWT..."
```

- `.env` **tidak** di-upload ke GitHub (ada di `.gitignore`)
- `.env.example` hanya template untuk setup

### 6.2 Perintah penting
| Perintah | Fungsi |
|----------|--------|
| `npm install` | Install dependensi |
| `npx prisma migrate dev` | Buat/apply migrasi DB |
| `npm run dev` | Jalankan development |
| `npm run build` | Build production |
| `npm run db:studio` | GUI lihat isi database |

### 6.3 Catatan deploy
- SQLite cocok untuk **lokal / demo**
- Untuk cloud (Vercel), idealnya ganti ke **PostgreSQL** (Neon/Supabase) karena filesystem serverless tidak persisten untuk file DB

---

## 7. Fitur tambahan (nilai plus presentasi)

1. **Peta tata surya** (`/solar-system`) — visual orbit interaktif  
2. **Bandingkan objek** (`/compare`) — dua objek side-by-side  
3. **Glassmorphism UI** — desain modern frosted glass  
4. **Efek background** — bintang, nebula, debu kosmik, shooting star, milky way, parallax  
5. **Upload gambar** ke server (bukan hanya link eksternal)  
6. **Git + GitHub** — version control & kolaborasi multi-device  

---

## 8. Kelebihan & batasan

### Kelebihan
- Full-stack dalam satu framework (Next.js)
- Arsitektur jelas: UI → API → ORM → DB
- Auth server-side dengan JWT cookie
- UI responsif & berbahasa Indonesia
- Mudah dikembangkan (tambah field/model lewat Prisma)

### Batasan (jujur di hadapan dosen)
- SQLite kurang ideal untuk multi-server production
- Auth demo (satu akun admin dari env, belum multi-user/role kompleks)
- Password belum di-hash di database user (kredensial env sederhana)
- Upload file tersimpan di disk lokal (`public/uploads`)

### Pengembangan lanjutan (opsional sebutkan)
- Multi-admin + hash password (bcrypt)
- PostgreSQL di cloud
- Role & permission lebih lengkap
- Pagination & pencarian server-side
- Unit/integration test

---

## 9. Kesimpulan

Orbitra adalah **aplikasi web full-stack** katalog luar angkasa yang:

1. **Frontend** — React/Next.js + Tailwind untuk antarmuka interaktif  
2. **Backend** — Next.js API Routes untuk auth, CRUD, dan upload  
3. **Database** — SQLite via Prisma sebagai penyimpanan data terpusat  

Proyek ini menunjukkan pemahaman alur modern web development:  
**Client → API → Server logic → Database → Response → UI update.**

---

## 10. Diagram singkat untuk slide

### Slide arsitektur (teks)
```
[UI React] --fetch--> [/api/*] --Prisma--> [SQLite]
                ^
                |
         Cookie JWT (admin)
```

### Slide stack
```
Frontend: Next.js + React + Tailwind
Backend : Next.js Route Handlers + jose
Database: Prisma + SQLite
Tools   : Git, npm, Prisma Studio
```

### Slide demo flow
1. Jelajah katalog (publik)  
2. Login admin  
3. Tambah / edit / hapus objek  
4. Tunjukkan data di Prisma Studio / refresh browser  

---

## 11. Saran alur presentasi lisan (±10–15 menit)

| Menit | Isi |
|------:|-----|
| 0–1 | Judul, identitas, ringkas apa itu Orbitra |
| 1–3 | Masalah & tujuan (kenapa full-stack, bukan static saja) |
| 3–6 | Arsitektur + stack (frontend vs backend vs DB) |
| 6–9 | Demo live: katalog → login → CRUD |
| 9–11 | Jelaskan 1 alur API (mis. login atau create) |
| 11–13 | Keamanan, env, GitHub |
| 13–15 | Kelebihan, batasan, rencana lanjut, penutup |

---

*Dokumen ini dibuat untuk mendukung presentasi akademik proyek Orbitra.*  
*Repo: https://github.com/0xarfantta/space-website*
