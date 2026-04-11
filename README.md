# SIPARTA — Sistem Informasi Pencatatan RT/RW Terpadu

Aplikasi manajemen iuran dan administrasi RT/RW berbasis web. Dirancang untuk menggantikan pencatatan manual (buku/Excel) dengan sistem digital yang transparan dan mudah digunakan.

## Fitur Utama

### Pengurus RT
- **Iuran** — Kelola jenis iuran bulanan & insidental; generate tagihan otomatis ke semua rumah aktif
- **Verifikasi Pembayaran** — Setujui atau tolak bukti transfer dari warga; input pembayaran manual (langsung approved)
- **Data Rumah & KK** — CRUD rumah, kartu keluarga, dan kontrak penyewa; auto-nonaktifkan rumah ketika kosong
- **Manajemen Warga** — Buat/edit akun warga, setujui pendaftaran mandiri, kelola status aktif/nonaktif
- **Kas RT** — Catat pengeluaran; pemasukan otomatis dari pembayaran yang diverifikasi
- **Pengumuman** — Publish pengumuman untuk warga RT
- **Laporan** — Status pembayaran per periode, export CSV
- **Pengaturan** — Info rekening bank untuk warga, konfigurasi jadwal reminder

### Warga
- **Tagihan** — Lihat tagihan rumah; bayar via transfer (upload bukti) atau cash
- **Riwayat** — Lacak status semua pembayaran
- **Registrasi Mandiri** — Daftar sendiri, aktif setelah diverifikasi Pengurus RT

### Pengurus RW
- **Monitoring** — Dashboard read-only untuk semua RT di bawah RW; compliance rate, pemasukan, status iuran per RT

### Fitur Pendukung
- Voting / musyawarah digital
- Jadwal kegiatan RT + RSVP
- Pengajuan layanan (surat domisili, surat pengantar)
- Notifikasi in-app
- Reminder otomatis via Vercel Cron Jobs

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via [Neon](https://neon.tech) + Prisma ORM |
| Auth | JWT (access token + refresh token via httpOnly cookie) |
| File Upload | Cloudinary |
| Styling | Tailwind CSS 4 |
| Deployment | Vercel / Docker |

## Hierarki Data

```
RW
└── RT (banyak)
     └── Rumah (banyak) [tipe: milik | kontrak]
          ├── KontrakRumah (maks. 1 aktif; hanya tipe kontrak)
          ├── KartuKeluarga / KK (banyak per rumah)
          │    └── User/Warga (terhubung ke rumah, NIK unik)
          └── Tagihan (per rumah aktif — bukan per KK)
```

## Roles

| Role | Scope |
|---|---|
| `pengurus_rt` | Full CRUD untuk RT sendiri |
| `pengurus_rw` | Read-only untuk semua RT di bawah RW-nya |
| `warga` | Tagihan & pembayaran milik rumahnya sendiri |

## Memulai

### Prasyarat
- Node.js 20+
- PostgreSQL (atau akun [Neon](https://neon.tech) untuk serverless)
- Akun [Cloudinary](https://cloudinary.com) untuk file upload

### Instalasi

```bash
git clone https://github.com/cakapbagus/siparta.git
cd siparta
npm install
```

### Konfigurasi Environment

Buat file `.env` berdasarkan `.env.example`:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CRON_SECRET="your-cron-secret"
```

### Setup Database

```bash
# Push schema ke database
npm run db:push

# Atau jalankan migrasi
npm run db:migrate

# Seed data awal (RW, RT, user pengurus)
npm run db:seed
```

### Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Build Production

```bash
npm run build
npm start
```

## Struktur Proyek

```
src/
├── app/
│   ├── api/                    # API Routes (backend)
│   │   ├── auth/               # Login, register, logout, refresh, me
│   │   ├── iuran/              # Jenis iuran & tagihan
│   │   ├── pembayaran/         # Submit, verify, manual, history
│   │   ├── rumah/              # Rumah CRUD + KK + kontrak
│   │   ├── residents/          # Manajemen akun warga
│   │   ├── announcements/      # Pengumuman
│   │   ├── voting/             # Voting & musyawarah
│   │   ├── kegiatan/           # Jadwal kegiatan + RSVP
│   │   ├── layanan/            # Permintaan layanan surat
│   │   ├── kas/                # Kas RT
│   │   ├── reports/            # Laporan iuran, kas, warga-status
│   │   ├── pengurus-rw/        # Monitoring RT (RW only)
│   │   ├── notifications/      # Notifikasi in-app
│   │   ├── rt-settings/        # Konfigurasi RT (bank, reminder)
│   │   ├── public/             # Endpoint publik (RW/RT list untuk registrasi)
│   │   └── cron/reminder/      # Vercel Cron Job endpoint
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard utama (role-based)
│   │   ├── rt/                 # Halaman Pengurus RT
│   │   │   ├── iuran/          # Jenis iuran
│   │   │   ├── tagihan/        # Manajemen tagihan
│   │   │   ├── pembayaran/     # Verifikasi + input manual
│   │   │   ├── warga/          # Manajemen akun warga
│   │   │   ├── rumah/          # Data rumah & KK
│   │   │   ├── kas/            # Kas RT
│   │   │   ├── pengumuman/     # Pengumuman
│   │   │   ├── laporan/        # Laporan status pembayaran
│   │   │   └── pengaturan/     # Pengaturan RT
│   │   ├── warga/
│   │   │   ├── tagihan/        # Lihat tagihan + bayar
│   │   │   └── history/        # Riwayat pembayaran
│   │   └── rw/                 # Monitoring Pengurus RW
│   ├── login/
│   └── register/
├── contexts/
│   └── auth-context.tsx        # Auth state + apiFetch helper
├── lib/
│   ├── api-helpers.ts          # requireAuth, requireRole, jsonOk/Err
│   ├── jwt.ts                  # Sign & verify JWT
│   ├── prisma.ts               # Prisma client singleton
│   ├── password.ts             # bcrypt hash & compare
│   ├── cloudinary-server.ts    # Upload helper
│   ├── notifications.ts        # Buat notifikasi in-app
│   ├── tagihan-gen.ts          # Generate tagihan logic
│   └── pembayaran-service.ts   # Update status tagihan saat pembayaran
prisma/
├── schema.prisma               # Schema lengkap
└── seed.ts                     # Data awal
vercel.json                     # Cron job config
```

## Deployment di Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables
4. Deploy — `prisma generate` berjalan otomatis via `postinstall`

Cron job reminder sudah dikonfigurasi di `vercel.json` dan memanggil `/api/cron/reminder` setiap hari. Endpoint dilindungi header `CRON_SECRET`.

## Lisensi

MIT
