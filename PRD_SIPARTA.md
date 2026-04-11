# Product Requirements Document (PRD)

## SIPARTA - Sistem Informasi Pencatatan RT/RW Terpadu

**Project:** SIPARTA 
**Version:** 1.9 (MVP)  
**Date Created:** April 11, 2026  
**Target Launch:** 1 Week (MVP)  
**Document Owner:** cakapbagus

---

## 1. EXECUTIVE SUMMARY

### Problem Statement

Pengelolaan iuran RT/RW masih dilakukan secara manual (catatan buku/Excel), menyebabkan:

- Rentan kesalahan pencatatan dan transparansi rendah
- Warga kesulitan melacak riwayat pembayaran mereka
- Pengurus RT menghabiskan waktu berharga untuk administrasi manual
- Konflik terkait pembayaran karena kurangnya dokumentasi jelas

### Proposed Solution

Membangun sistem informasi digital yang mengintegrasikan:

- **Manajemen iuran** (penetapan, penagihan, pembayaran, verifikasi)
- **Transparansi keuangan** (laporan real-time untuk pengurus dan warga)
- **Fitur pendukung** (announcement, data warga, layanan, voting)

### Success Criteria (KPI)

1. **Payment Compliance Rate ≥ 90%** – Minimal 90% warga melakukan pembayaran iuran pada waktu yang ditentukan
2. **System Uptime ≥ 99%** – Sistem tersedia sepanjang waktu kecuali maintenance
3. **Pengurus RT Time Reduction ≥ 70%** – Pengurus menghemat waktu administratif minimal 70% dibanding manual
4. **User Adoption ≥ 75%** – Minimal 75% **rumah aktif** memiliki setidaknya 1 akun warga terdaftar di sistem dalam 1 bulan
5. **Payment Verification ≤ 24 Hours** – Bukti pembayaran diverifikasi dalam max 24 jam

---

## 2. USER EXPERIENCE & FUNCTIONALITY

### 2.1 User Personas

**Persona 1: Pengurus RT (Ketua/Bendahara)**

- **Name:** Pak Ahmad (Ketua RT)
- **Goals:** Mengelola iuran efisien, memastikan transparansi, mengurangi konflik
- **Pain Points:** Mencatat pembayaran manual, mengelola reminder, membuat laporan
- **Tech Proficiency:** Medium (bisa gunakan smartphone dan web)

**Persona 2: Pengurus RW**

- **Name:** Pak Budi (Ketua RW)
- **Goals:** Mengawasi kinerja semua RT di bawah RW-nya, memantau transparansi keuangan, memastikan compliance
- **Pain Points:** Sulit monitoring multiple RT sekaligus, kurang visibilitas atas status keuangan tiap RT
- **Tech Proficiency:** Medium (web-based, read-only access needed)

**Persona 3: Warga (Perwakilan Rumah)**

- **Name:** Pak Bagus (Penghuni rumah)
- **Goals:** Memudahkan pembayaran iuran, tracking history, melihat transparansi kas
- **Pain Points:** Tidak tahu kapan harus bayar, kejelasan penggunaan dana
- **Tech Proficiency:** Low-Medium (mobile-first preference)

---

### 2.2 User Stories & Acceptance Criteria

#### **PHASE 1: MVP - Fitur Iuran (Target 1 minggu)**

##### Story 1.1: Pengurus RT Membuat Jenis Iuran

**As an** Pengurus RT (Ketua/Bendahara)  
**I want to** membuat dan mengatur jenis iuran  
**So that** warga tahu apa yang harus dibayar

**Acceptance Criteria:**

- [ ] Pengurus RT dapat membuat jenis iuran baru (form dengan nama, nominal, deskripsi)
- [ ] Pengurus RT dapat menentukan tipe iuran: Bulanan / Insidental
- [ ] Pengurus RT dapat mengatur jadwal pembayaran (tanggal jatuh tempo) khusus tipe iuran bulanan
- [ ] Pengurus RT dapat mengedit, menonaktifkan, atau menghapus jenis iuran
- [ ] Sistem validasi: nominal harus angka positif, tanggal harus valid, tanggal tidak bisa backdate
- [ ] Notifikasi sukses ditampilkan setelah iuran dibuat

---

##### Story 1.2: Sistem Generate Tagihan Iuran Otomatis

**As a** System  
**I want to** generate tagihan otomatis untuk setiap warga  
**So that** tidak ada warga yang terlewat

**Acceptance Criteria:**

- [ ] Sistem otomatis membuat tagihan bulanan pada awal setiap bulan untuk semua rumah aktif berdasarkan jenis iuran bertipe `bulanan`
- [ ] Untuk iuran bertipe `insidental`: tagihan dibuat **manual** oleh Pengurus RT (pilih jenis iuran insidental → sistem generate tagihan ke semua rumah aktif sekaligus)
- [ ] Tagihan dibuat **per rumah** (bukan per KK — satu rumah dengan banyak KK tetap menerima satu tagihan per jenis iuran)
- [ ] Tagihan menampilkan: nomor rumah, nama kepala KK pertama (sebagai representasi), nominal, jatuh tempo khusus bulanan
- [ ] Status tagihan default = "Belum Bayar"
- [ ] Pengurus RT dapat melihat daftar semua tagihan per periode (bulan/tahun)

---

##### Story 1.3: Warga Melihat Tagihan & Melakukan Pembayaran

**As a** Warga (yang memiliki akun)  
**I want to** melihat tagihan rumah saya dan melakukan pembayaran  
**So that** saya bisa bayar dengan mudah dan tepat waktu

**Acceptance Criteria:**

- [ ] Warga dapat login menggunakan **username** atau **NIK (No. KTP)**
- [ ] Dashboard menampilkan: tagihan rumah bulan ini, riwayat pembayaran untuk rumah ini, status tagihan terbuka
- [ ] Warga melihat tagihan **milik rumahnya** — jika ada warga lain di rumah yang sama sudah bayar, tagihan tampil sebagai lunas
- [ ] Warga dapat melihat detail tagihan (jumlah, jatuh tempo, jenis iuran)
- [ ] Warga dapat submit pembayaran melalui 2 metode:
  - Manual Transfer: upload bukti transfer (foto/PDF)
  - Cash/Pembayaran Langsung: konfirmasi pembayaran (nama Pengurus RT yang terima, tanggal)
- [ ] Form pembayaran menampilkan nomor rekening/petunjuk pembayaran
- [ ] Sistem validasi: file upload max 5MB, format JPG/PNG/PDF
- [ ] Notifikasi "Pembayaran dikirim untuk verifikasi" ditampilkan

> **Catatan:** Tidak semua warga memiliki akun. Warga tanpa akun tidak dapat mengakses portal ini — pembayaran untuk rumah mereka diinput manual oleh Pengurus RT (lihat Story 1.3b).

---

##### Story 1.3b: Pengurus RT Input Pembayaran Manual

**As a** Pengurus RT  
**I want to** menginput pembayaran secara manual atas nama suatu rumah  
**So that** rumah yang warganya tidak memiliki akun atau yang membayar langsung tunai tetap tercatat

**Acceptance Criteria:**

- [ ] Pengurus RT dapat membuka form input pembayaran manual (pilih rumah, pilih tagihan, nominal, tanggal, metode: cash/transfer)
- [ ] Form ini tersedia untuk **semua rumah aktif**, terlepas apakah ada warga yang punya akun atau tidak
- [ ] Pembayaran yang diinput Pengurus RT **langsung berstatus `approved`** tanpa perlu verifikasi ulang
- [ ] Pengurus RT dapat menambah catatan (misal: "dibayar langsung oleh Pak Budi")
- [ ] Riwayat pembayaran manual tercatat dengan penanda `input_by: pengurus_rt` beserta identitas pengurus yang menginput
- [ ] Status tagihan rumah berubah menjadi `lunas` setelah pembayaran manual diinput

---

##### Story 1.4: Pengurus RT Verifikasi Pembayaran

**As a** Pengurus RT  
**I want to** memverifikasi pembayaran dari warga  
**So that** status pembayaran akurat dan transparan

**Acceptance Criteria:**

- [ ] Pengurus RT melihat daftar pembayaran yang menunggu verifikasi
- [ ] Pengurus RT dapat melihat bukti pembayaran (preview gambar/dokumen)
- [ ] Pengurus RT dapat: Setujui / Tolak / Minta Konfirmasi Ulang
- [ ] Jika disetujui: status tagihan berubah menjadi "Lunas", catatan waktu verifikasi
- [ ] Jika ditolak: warga diberi notifikasi + alasan penolakan
- [ ] Pengurus RT dapat menambah catatan/note pada setiap verifikasi
- [ ] Riwayat verifikasi tersimpan (audit trail)

---

##### Story 1.5: Warga & Pengurus RT Melihat Riwayat & Transparansi

**As a** Warga  
**I want to** melihat riwayat pembayaran dan transparansi kas RT  
**So that** saya tahu sudah bayar apa saja dan kemana dana digunakan

**Acceptance Criteria:**

- [ ] Warga dapat melihat riwayat pembayaran pribadi (tabel: tanggal, iuran, status, nominal)
- [ ] Pengurus RT dapat melihat laporan iuran: ringkasan per periode, total pemasukan, status pembayaran
- [ ] Dashboard transparansi menampilkan:
  - Total iuran diterima bulan ini
  - Jumlah warga yang sudah bayar vs belum
  - Grafik ringkas penerimaan iuran (per bulan atau per jenis iuran)
- [ ] Pengurus RT dapat export laporan ke file CSV/PDF
- [ ] Warga dapat melihat ringkas transparansi (tidak bisa lihat data warga lain)

---

##### Story 1.6: Reminder Otomatis Jatuh Tempo

**As a** System  
**I want to** mengirim reminder kepada warga tentang jatuh tempo  
**So that** warga tidak lupa untuk membayar

**Acceptance Criteria:**

- [ ] Sistem mengirim reminder 3 hari sebelum jatuh tempo (via notifikasi in-app, SMS/email jika tersedia)
- [ ] Reminder dikirim: nama iuran, nominal, tanggal jatuh tempo
- [ ] Pengurus RT dapat customize kapan reminder dikirim (3 hari? 1 hari? hari H?)
- [ ] Reminder hanya dikirim ke warga yang belum bayar
- [ ] Pengurus RT dapat manual send reminder kapan saja

**Catatan Teknis:**
- Reminder otomatis dijalankan menggunakan **Vercel Cron Jobs** (`vercel.json` → `crons`) yang memanggil endpoint `/api/cron/reminder` setiap hari pada waktu yang ditentukan
- Endpoint cron dilindungi dengan `CRON_SECRET` header agar tidak bisa dipanggil sembarangan
- Untuk self-hosted (Docker): gunakan `node-cron` atau sistem cron OS

---

##### Story 1.7: Pengurus RW Monitoring Status Iuran Multiple RT

**As a** Pengurus RW  
**I want to** memonitor status iuran semua RT yang berada di bawah RW saya  
**So that** saya dapat memastikan transparansi dan compliance di setiap RT

**Acceptance Criteria:**

- [ ] Pengurus RW hanya dapat melihat (read-only) data dari RT-RT yang berada di bawah RW-nya
- [ ] Pengurus RW **tidak dapat** mengakses data RT dari RW lain
- [ ] Dashboard Pengurus RW menampilkan:
  - Daftar semua RT di bawah RW-nya
  - Ringkas status iuran per RT (jumlah pembayaran, persentase compliance)
  - Total pemasukan iuran per RT
  - Jumlah warga belum bayar per RT
- [ ] Pengurus RW dapat melihat detail laporan keuangan per RT (tidak bisa edit)
- [ ] Pengurus RW dapat melihat trend pembayaran (grafik per bulan)
- [ ] Pengurus RW **TIDAK dapat**: membuat iuran, verifikasi pembayaran, atau edit data apapun (hanya monitor)
- [ ] Sistem mencatat aktivitas Pengurus RW sebagai audit log

---

##### Story 1.8: Pengumuman RT

**As a** Pengurus RT  
**I want to** membuat pengumuman untuk warga RT saya  
**So that** informasi penting dapat disampaikan secara digital

**Acceptance Criteria:**

- [ ] Pengurus RT dapat menulis pengumuman (title, content, gambar optional)
- [ ] Pengumuman hanya tampil untuk warga di RT yang sama
- [ ] Pengumuman ditampilkan di dashboard warga
- [ ] Warga dapat melihat tanggal pengumuman dan nama pembuat
- [ ] Pengurus RT dapat edit/hapus pengumuman milik RT-nya sendiri
- [ ] Pengurus RT **tidak dapat** membuat atau mengedit pengumuman untuk RT lain

---

##### Story 2.1: Manajemen Data Rumah & Kartu Keluarga

**As a** Pengurus RT  
**I want to** mengelola data rumah dan Kartu Keluarga (KK) di RT saya  
**So that** data hunian terstruktur dan menjadi basis tagihan yang akurat

**Acceptance Criteria:**

**Rumah:**
- [ ] Pengurus RT dapat menambah rumah baru (form: nomor rumah, alamat, kontak, tipe hunian, status)
- [ ] **Tipe hunian** rumah: `milik` (pemilik yang menempati) atau `kontrak` (dikontrakkan ke penyewa)
- [ ] Status rumah: `aktif` atau `tidak_aktif` (kosong/tidak berpenghuni) — **tidak ada kaitannya dengan apakah warga punya akun atau tidak**
- [ ] Rumah berstatus `tidak_aktif` **tidak mendapat tagihan** saat generate tagihan bulanan maupun insidental
- [ ] Rumah berstatus `aktif` **selalu mendapat tagihan**, meski tidak ada satupun warga yang punya akun di sistem
- [ ] Menghapus rumah yang masih punya tagihan belum lunas tidak diizinkan (system validation)
- [ ] Daftar rumah menampilkan: nomor rumah, tipe hunian, status, jumlah KK, jumlah akun warga, status tagihan terakhir

**Kontrak Rumah (hanya untuk rumah bertipe `kontrak`):**
- [ ] Pengurus RT dapat menambah data kontrak (form: nama penyewa, tanggal mulai, tanggal selesai)
- [ ] Satu rumah hanya boleh memiliki **satu kontrak aktif** dalam satu waktu
- [ ] Pengurus RT dapat memperpanjang atau mengakhiri kontrak sebelum tanggal selesai
- [ ] Sistem menampilkan peringatan ketika kontrak mendekati tanggal selesai (≤ 7 hari)
- [ ] **Ketika kontrak berakhir dan rumah dikosongkan:** Pengurus RT menandai rumah sebagai "penyewa keluar" → sistem otomatis:
  1. Mengubah status rumah menjadi `tidak_aktif`
  2. Menghapus seluruh data KK yang terdaftar di rumah tersebut
  3. Menghapus seluruh akun warga yang terhubung ke rumah tersebut
  4. Riwayat tagihan & pembayaran **tetap tersimpan** untuk keperluan arsip
- [ ] Aksi penghapusan massal ini memerlukan konfirmasi eksplisit dari Pengurus RT sebelum dieksekusi

**Pindah Kepemilikan (khusus rumah bertipe `milik`):**
- [ ] Pengurus RT dapat melakukan **pindah kepemilikan** rumah — mengganti pemilik lama dengan pemilik baru
- [ ] Alur pindah kepemilikan:
  1. Pengurus RT memilih rumah yang akan dialihkan
  2. Sistem menampilkan daftar KK & akun warga yang saat ini terhubung ke rumah
  3. Pengurus RT mengkonfirmasi → sistem otomatis **menghapus seluruh KK dan akun warga lama** dari rumah tersebut
  4. Pengurus RT menambahkan KK pemilik baru dan (opsional) membuat akun warga baru
- [ ] Aksi penghapusan data lama memerlukan konfirmasi eksplisit sebelum dieksekusi
- [ ] Riwayat tagihan & pembayaran pemilik lama **tetap tersimpan** untuk keperluan arsip
- [ ] Rumah **tetap berstatus `aktif`** setelah pindah kepemilikan — tagihan berjalan terus ke pemilik baru

**KK:**
- [ ] Pengurus RT dapat menambah KK ke dalam suatu rumah (form: nomor KK 16 digit, nama kepala keluarga)
- [ ] KK yang terdaftar di rumah bertipe `kontrak` merepresentasikan **penyewa aktif**
- [ ] Satu rumah dapat memiliki lebih dari satu KK
- [ ] Pengurus RT dapat edit data KK, termasuk mengubah rumah yang ditempati (selama masih dalam RT yang sama)

**Skenario A — KK pindah ke rumah lain dalam RT yang sama:**
- [ ] Pengurus RT mengedit KK → memilih rumah tujuan baru
- [ ] Sistem otomatis memindahkan seluruh akun warga yang terhubung ke KK tersebut ke rumah tujuan
- [ ] Jika rumah asal tidak lagi memiliki KK manapun setelah perpindahan → status rumah asal otomatis berubah menjadi `tidak_aktif`
- [ ] Rumah tujuan tetap berstatus sesuai kondisi sebelumnya (tidak berubah)

**Skenario B — KK pindah keluar RT (pindah domisili):**
- [ ] Pengurus RT menghapus KK → sistem otomatis menghapus seluruh akun warga yang terhubung ke KK tersebut
- [ ] Jika rumah asal tidak lagi memiliki KK manapun setelah penghapusan → status rumah asal otomatis berubah menjadi `tidak_aktif`
- [ ] Riwayat tagihan & pembayaran rumah **tetap tersimpan** — yang dihapus hanya data KK dan akun warga

**Aturan umum KK:**
- [ ] Menghapus KK memerlukan konfirmasi eksplisit karena berdampak pada akun warga terkait

---

##### Story 2.2: Registrasi & Manajemen Akun Warga

**Registrasi Mandiri (oleh Warga):**

**As a** Warga  
**I want to** mendaftarkan akun saya sendiri  
**So that** saya tidak perlu menunggu pengurus RT untuk bisa mengakses portal

**Acceptance Criteria:**

- [ ] Halaman registrasi publik tersedia tanpa perlu login
- [ ] Form registrasi mandiri: nama, username, NIK/No. KTP 16 digit, password, pilih RT, pilih rumah, pilih KK (dropdown berdasarkan RT yang dipilih)
- [ ] Akun yang baru dibuat via registrasi mandiri otomatis berstatus **`tidak_aktif`**
- [ ] Warga dengan akun `tidak_aktif` **tidak dapat login** — sistem menampilkan pesan "Akun Anda sedang menunggu verifikasi pengurus RT"
- [ ] Pengurus RT menerima notifikasi in-app ketika ada pendaftaran baru yang menunggu verifikasi
- [ ] Pengurus RT dapat melihat detail pendaftar (nama, NIK, rumah yang diklaim) sebelum menyetujui
- [ ] Pengurus RT dapat: **Aktifkan** akun (ubah status `tidak_aktif` → `aktif`) atau **Tolak** (hapus akun beserta alasan)
- [ ] Warga yang akunnya diaktifkan dapat langsung login

---

**Manajemen Akun (oleh Pengurus RT):**

**As a** Pengurus RT  
**I want to** mengelola akun warga di RT saya  
**So that** hanya warga yang terverifikasi yang dapat mengakses sistem

**Acceptance Criteria:**

- [ ] **Akun warga bersifat opsional** — tidak semua warga diwajibkan punya akun; data rumah & KK tetap ada tanpa akun
- [ ] Pengurus RT dapat membuat akun warga secara langsung (form: nama, username, NIK/No. KTP 16 digit, password awal, pilih rumah) — akun yang dibuat pengurus langsung berstatus **`aktif`**
- [ ] Setiap akun warga **wajib** memiliki NIK unik — digunakan untuk login alternatif selain username
- [ ] Akun warga terhubung ke **satu rumah**; satu rumah dapat memiliki **lebih dari satu akun warga**
- [ ] Pembayaran oleh akun warga manapun yang terhubung ke rumah yang sama dianggap sebagai pembayaran untuk rumah tersebut
- [ ] Rumah yang **tidak ada satupun akun warga aktif** tetap mendapat tagihan dan pembayarannya diinput manual oleh Pengurus RT (Story 1.3b)
- [ ] **Pindah rumah:** Pengurus RT dapat mengubah `rumah_id` pada akun warga — riwayat pembayaran lama tetap terhubung ke rumah lama, tagihan berikutnya mengacu ke rumah baru
- [ ] Pengurus RT dapat mengubah status akun: `aktif` ↔ `tidak_aktif`
- [ ] Pengurus RT dapat edit dan hapus akun warga
- [ ] Data akun warga tersimpan aman (hanya pengurus yang bisa lihat detail lengkap)
- [ ] Export daftar warga (termasuk kolom: status akun, rumah saat ini) ke CSV

---

##### Story 2.3: Kelola Kas RT (Pemasukan & Pengeluaran)

**As a** Pengurus RT  
**I want to** mencatat pemasukan dan pengeluaran kas RT  
**So that** seluruh transaksi keuangan tercatat dengan jelas

**Acceptance Criteria:**

- [ ] Pengurus RT dapat menambah catatan pengeluaran (deskripsi, nominal, tanggal, kategori)
- [ ] Pemasukan iuran otomatis tercatat dari konfirmasi pembayaran
- [ ] Dashboard kas menampilkan: saldo awal, total pemasukan, total pengeluaran, saldo akhir
- [ ] Transparansi kas: warga dapat melihat ringkas (tanpa detail kecil)
- [ ] Laporan kas dapat diexport

---

##### Story 2.4: Pengajuan Layanan (Surat Domisili, Pengantar)

**As a** Warga  
**I want to** mengajukan surat domisili atau surat pengantar  
**So that** saya tidak perlu datang langsung ke rumah Ketua

**Acceptance Criteria:**

- [ ] Warga dapat membuat permintaan layanan (tipe: Domisili / Pengantar / Lainnya) beserta keterangan keperluan
- [ ] Pengurus RT menerima notifikasi ada permintaan baru
- [ ] Pengurus RT dapat memberi status: `proses` / `selesai`, dengan catatan
- [ ] Ketika status = `selesai`, Pengurus RT **mengupload file surat** (PDF) secara manual — tidak ada generate otomatis
- [ ] Warga dapat download file surat yang telah diupload pengurus RT
- [ ] Riwayat permintaan tersimpan

---

##### Story 2.5: Jadwal Kegiatan RT

**As a** Pengurus RT  
**I want to** membuat dan publish jadwal kegiatan RT  
**So that** warga tahu kapan ada kegiatan apa

**Acceptance Criteria:**

- [ ] Pengurus RT dapat membuat kegiatan (nama, deskripsi, tanggal, jam, lokasi)
- [ ] Kegiatan ditampilkan di dashboard warga
- [ ] Warga dapat lihat detail dan RSVP (hadir/tidak)
- [ ] Pengurus RT dapat melihat siapa saja yang RSVP

---

##### Story 2.6: Voting / Musyawarah Digital

**As a** Pengurus RT  
**I want to** membuat voting untuk keputusan bersama  
**So that** transparansi keputusan dan partisipasi warga lebih baik

**Acceptance Criteria:**

- [ ] Pengurus RT dapat membuat voting (pertanyaan, opsi, deadline)
- [ ] Warga dapat vote **sekali** per voting — sistem mencegah double vote berdasarkan `user_id`
- [ ] Hasil voting ditampilkan real-time atau setelah deadline
- [ ] Pengurus RT dapat melihat detail voting (siapa aja yang vote opsi apa)

---

### 2.3 Non-Goals (Tidak Termasuk MVP)

- **Payment Gateway Integration** – Fase 1 hanya support manual transfer & cash
- **SMS/Email Notification** – Fase 1 hanya notifikasi in-app (SMS/Email jika budget tersedia)
- **Mobile App Native** – Fase 1 adalah web-based, responsive untuk mobile
- **Accounting System** – Hanya pencatatan iuran, bukan full accounting
- **Multi-bahasa** – Bahasa Indonesia saja untuk MVP
- **Advanced Analytics/BI** – Hanya laporan basic

---

## 3. TECHNICAL SPECIFICATIONS

### 3.1 Technology Stack

| Layer              | Technology                     | Reason                                                         |
| ------------------ | ------------------------------ | -------------------------------------------------------------- |
| **Frontend**       | Next.js (React)                | Full-stack framework, SSR/SSG, built-in API routes, fast build |
| **Backend**        | Next.js API Routes (Node.js)   | Unified full-stack, rapid development, async-friendly          |
| **Database**       | PostgreSQL (Neon)              | Structured data (relational), serverless, scalable, free tier  |
| **Authentication** | JWT                            | Stateless, secure for web & future mobile                      |
| **File Storage**   | Cloudinary                     | Upload & hosting bukti pembayaran dan file surat; free tier, transformasi gambar otomatis |
| **Deployment**     | Vercel / Docker + Linux Server | Zero-config deployment, auto-scaling, or self-hosted           |

---

### 3.2 Architecture Overview

**Hierarki Data:**

```
RW (1)
 └── RT (banyak)
      └── Rumah (banyak) [tipe: milik | kontrak]
           ├── KontrakRumah (maks. 1 aktif; hanya tipe kontrak)
           ├── KartuKeluarga / KK (banyak per rumah)
           │    └── Warga/User opsional (terkait ke rumah, punya NIK unik)
           └── Tagihan (per rumah, bukan per KK)
```

> **Aturan tagihan:** Tagihan dibebankan **per rumah aktif**, terlepas dari jumlah KK atau kepemilikan akun.
>
> **Aturan kontrak:** Ketika penyewa keluar dan rumah dikosongkan, Pengurus RT mengakhiri kontrak → sistem nonaktifkan rumah dan hapus seluruh KK + akun warga terkait. Riwayat tagihan & pembayaran tetap tersimpan.

- **Pengurus RW** hanya dapat memonitor RT-RT yang berada di bawah RW-nya (read-only)
- **Pengurus RT** hanya dapat mengelola data warga, iuran, dan kas di RT-nya sendiri
- **Warga** hanya dapat melihat dan membayar tagihan miliknya sendiri

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FULL-STACK                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           FRONTEND (React Components)                 │  │
│  │  ├─ Pengurus RT Dashboard (Iuran, Verifikasi, Laporan)│  │
│  │  ├─ Pengurus RW Dashboard (Monitoring RT bawahan)    │  │
│  │  ├─ Warga Portal (Tagihan, Pembayaran, History)      │  │
│  │  └─ Responsive Design (Desktop & Mobile)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↕                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      API ROUTES (pages/api)                          │  │
│  │  ├─ /api/auth (login, register, logout)              │  │
│  │  ├─ /api/iuran (jenis iuran, tagihan, pembayaran)   │  │
│  │  │   → semua di-scope ke rt_id Pengurus RT           │  │
│  │  ├─ /api/residents (data warga per RT)               │  │
│  │  ├─ /api/verification (verifikasi pembayaran per RT) │  │
│  │  ├─ /api/reports (laporan per RT / per RW)          │  │
│  │  ├─ /api/announcements (pengumuman per RT)           │  │
│  │  ├─ /api/pengurus-rw (monitoring RT bawahan)         │  │
│  │  └─ /api/upload (upload bukti pembayaran)            │  │
│  │                                                      │  │
│  │  Middleware:                                         │  │
│  │  ├─ JWT Authentication                               │  │
│  │  ├─ Role-based Authorization                         │  │
│  │  │   (pengurus_rt → scope RT sendiri)                │  │
│  │  │   (pengurus_rw → scope RT bawahan RW-nya saja)    │  │
│  │  │   (warga → scope data milik sendiri)              │  │
│  │  ├─ RT/RW Scope Enforcement                          │  │
│  │  ├─ Error Handling & Logging                         │  │
│  │  └─ Input Validation                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↕                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      DATABASE LAYER (PostgreSQL - Neon)              │  │
│  │  Tables:                                             │  │
│  │  ├─ RW (id, nama, ...)                               │  │
│  │  ├─ RT (id, rw_id, nama, ...)                        │  │
│  │  ├─ Users (id, username, no_ktp, rumah_id, role, ...)│  │
│  │  ├─ PengurusRW_RT (pengurus_rw_id, rt_id)            │  │
│  │  ├─ Rumah (id, rt_id, nomor_rumah, tipe, status)     │  │
│  │  ├─ KontrakRumah (id, rumah_id, penyewa, tgl_mulai) │  │
│  │  ├─ KartuKeluarga (id, rumah_id, no_kk, nama_kk)    │  │
│  │  ├─ JenisIuran (id, rt_id, nama, nominal, tipe)      │  │
│  │  ├─ Tagihan (id, rt_id, rumah_id, iuran_id, status)  │  │
│  │  ├─ Pembayaran (id, tagihan_id, bukti, status, dll)  │  │
│  │  ├─ Announcement (id, rt_id, admin_id, title, ...)   │  │
│  │  ├─ Kas (id, rt_id, tipe, deskripsi, nominal)        │  │
│  │  ├─ Kegiatan (id, rt_id, nama, tanggal, rsvp data)   │  │
│  │  ├─ LayananRequest (id, rumah_id, tipe, status)      │  │
│  │  ├─ Voting (id, rt_id, pertanyaan, opsi, deadline)   │  │
│  │  ├─ VoteRecord (id, voting_id, user_id, opsi)        │  │
│  │  └─ RefreshTokens (id, user_id, token_hash, exp)     │  │
│  │                                                      │  │
│  │  File Storage:                                       │  │
│  │  └─ Cloudinary (bukti_pembayaran, file_surat)        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.3 API Endpoints (Core MVP)

#### Authentication

```
POST   /api/auth/login                  - Login (cek status aktif sebelum issue token)
POST   /api/auth/register               - Registrasi mandiri warga (akun otomatis tidak_aktif)
POST   /api/auth/logout                 - Logout
GET    /api/auth/me                     - Get current user info

GET    /api/residents/pending           - List akun warga menunggu verifikasi (Pengurus RT)
PUT    /api/residents/:id/activate      - Aktifkan akun warga (Pengurus RT)
PUT    /api/residents/:id/deactivate    - Nonaktifkan akun warga (Pengurus RT)
DELETE /api/residents/:id/reject        - Tolak & hapus pendaftaran (Pengurus RT)
```

#### Iuran Management

```
POST   /api/iuran/jenis        - Create jenis iuran (Pengurus RT)
GET    /api/iuran/jenis        - List semua jenis iuran
PUT    /api/iuran/jenis/:id    - Edit jenis iuran (Pengurus RT)
DELETE /api/iuran/jenis/:id    - Delete jenis iuran (Pengurus RT)

POST   /api/iuran/tagihan/generate  - Generate tagihan (Pengurus RT, auto/manual)
GET    /api/iuran/tagihan            - Get tagihan (Pengurus RT: semua, User: milik sendiri)
GET    /api/iuran/tagihan/:id        - Get detail tagihan
```

#### Pembayaran

```
GET    /api/pembayaran/pending       - List pending pembayaran (Pengurus RT)
POST   /api/pembayaran/submit        - Submit pembayaran oleh warga (status: pending)
POST   /api/pembayaran/manual        - Input pembayaran manual oleh Pengurus RT (status: approved langsung)
GET    /api/pembayaran/history       - History pembayaran (warga: rumahnya; pengurus: semua)
PUT    /api/pembayaran/:id/verify    - Verify pembayaran (Pengurus RT)
PUT    /api/pembayaran/:id/reject    - Reject pembayaran (Pengurus RT)
POST   /api/pembayaran/upload        - Upload bukti pembayaran
```

#### Laporan & Transparansi

```
GET    /api/reports/iuran-summary    - Laporan ringkas iuran (Pengurus RT)
GET    /api/reports/kas              - Laporan kas (Pengurus RT)
GET    /api/reports/warga-status     - Status pembayaran per warga (Pengurus RT)
GET    /api/reports/export           - Export laporan (CSV/PDF)
```

#### Pengurus RW Monitoring (Read-Only, scope: RT di bawah RW-nya)

```
GET    /api/pengurus-rw/dashboard           - Dashboard monitoring (hanya RT di bawah RW sendiri)
GET    /api/pengurus-rw/rt-list             - Daftar RT di bawah RW sendiri
GET    /api/pengurus-rw/rt/:rt_id/status    - Status iuran per RT (validasi rt_id ∈ RW sendiri)
GET    /api/pengurus-rw/rt/:rt_id/reports   - Laporan detail per RT (validasi rt_id ∈ RW sendiri)
```

#### Data Rumah

```
GET    /api/rumah                   - List semua rumah di RT (Pengurus RT)
POST   /api/rumah                   - Tambah rumah baru (Pengurus RT)
PUT    /api/rumah/:id               - Edit data rumah (Pengurus RT)
DELETE /api/rumah/:id               - Hapus rumah (Pengurus RT; gagal jika ada tagihan aktif)
POST   /api/rumah/:id/pindah-kepemilikan - Pindah kepemilikan: hapus KK & akun lama, rumah tetap aktif (Pengurus RT)
```

#### Kartu Keluarga

```
GET    /api/rumah/:rumah_id/kontrak          - List riwayat kontrak rumah (Pengurus RT)
POST   /api/rumah/:rumah_id/kontrak          - Tambah kontrak baru (Pengurus RT; gagal jika ada kontrak aktif)
PUT    /api/rumah/:rumah_id/kontrak/:id      - Edit / perpanjang kontrak (Pengurus RT)
POST   /api/rumah/:rumah_id/kontrak/:id/akhiri - Akhiri kontrak + kosongkan rumah (nonaktifkan, hapus KK & akun warga)

GET    /api/rumah/:rumah_id/kk      - List semua KK dalam satu rumah (Pengurus RT)
POST   /api/rumah/:rumah_id/kk      - Tambah KK ke rumah (Pengurus RT)
PUT    /api/kk/:id                  - Edit data KK termasuk pindah rumah (Pengurus RT); jika rumah asal jadi kosong → otomatis tidak_aktif
DELETE /api/kk/:id                  - Hapus KK + akun warga terhubung (Pengurus RT); jika rumah asal jadi kosong → otomatis tidak_aktif
```

#### Akun Warga

```
GET    /api/residents               - List semua akun warga (Pengurus RT)
POST   /api/residents               - Buat akun warga baru (Pengurus RT)
PUT    /api/residents/:id           - Edit akun warga (Pengurus RT)
DELETE /api/residents/:id           - Hapus akun warga (Pengurus RT)
```

---

### 3.3.1 Role-Based Access Control (RBAC)

| Feature                  | Pengurus RT (scope: RT sendiri)      | Pengurus RW (scope: RT di bawah RW-nya, read-only) | Warga (scope: data milik sendiri) |
| ------------------------ | ------------------------------------ | -------------------------------------------------- | --------------------------------- |
| **Jenis Iuran**          | Create, Read, Update, Delete         | Read Only                                          | Read (Own RT)                     |
| **Tagihan**              | Create, Read, Update, Delete         | Read Only (RT di bawah RW-nya)                     | Read (Own)                        |
| **Pembayaran**           | Create, Read, Update, Delete, Verify | Read Only                                          | Submit, View Own                  |
| **Laporan Keuangan**     | Full Access (RT sendiri)             | Read Only (RT di bawah RW-nya)                     | View Own RT (Limited)             |
| **Data Warga**           | CRUD (RT sendiri)                    | Read Only (RT di bawah RW-nya)                     | View Own                          |
| **Pengumuman**           | Create, Update, Delete (RT sendiri)  | Read Only                                          | Read (Own RT)                     |
| **Kas RT**               | CRUD (RT sendiri)                    | Read Only (RT di bawah RW-nya)                     | Limited View (Own RT)             |
| **Dashboard Monitoring** | Own RT Only                          | Semua RT di bawah RW-nya                           | Own Data Only                     |

---

### 3.4 Database Schema (Simplified)

```sql
-- RW Table
CREATE TABLE rw (
  id UUID PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  alamat TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RT Table
CREATE TABLE rt (
  id UUID PRIMARY KEY,
  rw_id UUID NOT NULL REFERENCES rw(id),
  nama VARCHAR(100) NOT NULL,  -- e.g., 'RT 001'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users Table
-- Pengurus RT: role='pengurus_rt', rt_id=RT yang dikelola (wajib), rumah_id=NULL
-- Pengurus RW: role='pengurus_rw', rw_id=RW yang dikelola (wajib), rt_id=NULL, rumah_id=NULL
-- Warga:       role='warga', rumah_id=rumah yang ditempati (wajib); banyak user bisa di rumah sama
-- Login dapat menggunakan username ATAU no_ktp (NIK) — no_ktp wajib untuk role 'warga'
-- Pembayaran tagihan oleh warga manapun dalam satu rumah = pembayaran untuk rumah tersebut
-- status: 'aktif' = dapat login; 'tidak_aktif' = menunggu verifikasi atau dinonaktifkan pengurus
-- Akun yang dibuat pengurus RT langsung 'aktif'; akun registrasi mandiri mulai sebagai 'tidak_aktif'
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  no_ktp VARCHAR(16) UNIQUE,       -- NIK/No. KTP 16 digit; wajib untuk warga (enforce via constraint)
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('pengurus_rt', 'pengurus_rw', 'warga')),
  status VARCHAR(20) NOT NULL DEFAULT 'tidak_aktif' CHECK (status IN ('aktif', 'tidak_aktif')),
  rt_id UUID REFERENCES rt(id),    -- hanya untuk pengurus_rt
  rw_id UUID REFERENCES rw(id),    -- hanya untuk pengurus_rw
  rumah_id UUID,                   -- hanya untuk warga (FK ke rumah, ditambah setelah tabel rumah dibuat)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- Constraint: setiap role wajib memiliki referensi yang sesuai
  CONSTRAINT chk_role_ref CHECK (
    (role = 'pengurus_rt' AND rt_id IS NOT NULL AND rw_id IS NULL AND rumah_id IS NULL) OR
    (role = 'pengurus_rw' AND rw_id IS NOT NULL AND rt_id IS NULL AND rumah_id IS NULL) OR
    (role = 'warga' AND rumah_id IS NOT NULL AND rt_id IS NULL AND rw_id IS NULL)
  ),
  -- no_ktp wajib untuk warga
  CONSTRAINT chk_warga_ktp CHECK (
    role != 'warga' OR no_ktp IS NOT NULL
  )
);

-- Rumah (Houses) Table
-- Setiap rumah terikat ke satu RT
-- Tagihan berlaku per rumah, terlepas dari jumlah KK atau akun warga di dalamnya
-- Rumah tidak aktif (kosong) tidak mendapat tagihan
CREATE TABLE rumah (
  id UUID PRIMARY KEY,
  rt_id UUID NOT NULL REFERENCES rt(id),
  nomor_rumah VARCHAR(50) NOT NULL,
  alamat TEXT,
  kontak VARCHAR(15),
  tipe_hunian VARCHAR(20) NOT NULL DEFAULT 'milik' CHECK (tipe_hunian IN ('milik', 'kontrak')),
  status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'tidak_aktif')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rt_id, nomor_rumah)
);

-- Kontrak Rumah
-- Hanya berlaku untuk rumah bertipe 'kontrak'
-- Satu kontrak aktif per rumah dalam satu waktu (enforce via partial unique index)
CREATE TABLE kontrak_rumah (
  id UUID PRIMARY KEY,
  rumah_id UUID NOT NULL REFERENCES rumah(id),
  nama_penyewa VARCHAR(200) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai')),
  catatan TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_tanggal CHECK (tanggal_selesai > tanggal_mulai)
);

-- Hanya boleh ada 1 kontrak aktif per rumah
CREATE UNIQUE INDEX idx_kontrak_aktif ON kontrak_rumah (rumah_id) WHERE status = 'aktif';

-- Kartu Keluarga (KK) Table
-- Satu rumah bisa memiliki lebih dari satu KK
-- Untuk rumah tipe 'kontrak', KK merepresentasikan penyewa aktif
-- KK digunakan untuk data administratif warga, bukan sebagai basis tagihan
CREATE TABLE kartu_keluarga (
  id UUID PRIMARY KEY,
  rumah_id UUID NOT NULL REFERENCES rumah(id),
  no_kk VARCHAR(16) UNIQUE NOT NULL,
  nama_kepala_keluarga VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FK rumah ke users (ditambahkan setelah tabel rumah dibuat)
ALTER TABLE users ADD CONSTRAINT fk_users_rumah FOREIGN KEY (rumah_id) REFERENCES rumah(id);

-- Jenis Iuran (Types of Contributions)
-- Setiap jenis iuran terikat ke satu RT (Pengurus RT hanya bisa kelola milik RT-nya sendiri)
CREATE TABLE jenis_iuran (
  id UUID PRIMARY KEY,
  rt_id UUID NOT NULL REFERENCES rt(id),  -- wajib: iuran milik RT tertentu
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  nominal DECIMAL(15,2) NOT NULL,
  tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('bulanan', 'insidental')),
  jatuh_tempo INT,  -- hari dalam bulan (e.g., 10)
  deleted_at TIMESTAMP,  -- soft delete
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tagihan (Invoices)
-- Status tagihan hanya 2: belum_bayar atau lunas
-- Penolakan/approval terjadi di level tabel pembayaran, bukan tagihan
CREATE TABLE tagihan (
  id UUID PRIMARY KEY,
  rt_id UUID NOT NULL REFERENCES rt(id),  -- denormalisasi untuk query scope RT lebih cepat
  rumah_id UUID NOT NULL REFERENCES rumah(id),
  iuran_id UUID NOT NULL REFERENCES jenis_iuran(id),
  periode VARCHAR(7),  -- 'YYYY-MM' untuk iuran bulanan; NULL untuk insidental
  nominal DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'lunas')),
  jatuh_tempo DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rumah_id, iuran_id, periode)
);

-- Pembayaran (Payments)
-- Ada 2 sumber pembayaran:
--   1. Warga (via portal): submitted_by = user_id warga, input_by_pengurus = FALSE
--      → status awal 'pending', perlu diverifikasi pengurus RT
--   2. Pengurus RT (manual): submitted_by = user_id pengurus, input_by_pengurus = TRUE
--      → status langsung 'approved', tidak perlu verifikasi
-- rumah_id diambil dari tagihan, dicatat ulang untuk kemudahan query
CREATE TABLE pembayaran (
  id UUID PRIMARY KEY,
  tagihan_id UUID NOT NULL REFERENCES tagihan(id),
  rumah_id UUID NOT NULL REFERENCES rumah(id),
  submitted_by UUID NOT NULL REFERENCES users(id),  -- warga atau pengurus yang menginput
  input_by_pengurus BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = diinput manual oleh pengurus RT
  nominal DECIMAL(15,2) NOT NULL,
  metode VARCHAR(20) NOT NULL CHECK (metode IN ('transfer_manual', 'cash')),
  bukti_file VARCHAR(500),  -- file path/URL untuk bukti transfer (NULL jika cash atau input manual)
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_by UUID REFERENCES users(id),  -- pengurus_rt yang memverifikasi (NULL jika input manual)
  catatan TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcement
-- Pengumuman terikat ke RT tertentu; hanya Pengurus RT dari RT tersebut yang bisa kelola
CREATE TABLE announcement (
  id UUID PRIMARY KEY,
  rt_id UUID NOT NULL REFERENCES rt(id),  -- wajib: pengumuman milik RT tertentu
  created_by UUID NOT NULL REFERENCES users(id),  -- harus pengurus_rt dari RT yang sama
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_file VARCHAR(500),
  posted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Voting
CREATE TABLE voting (
  id UUID PRIMARY KEY,
  rt_id UUID NOT NULL REFERENCES rt(id),
  created_by UUID NOT NULL REFERENCES users(id),
  pertanyaan TEXT NOT NULL,
  opsi JSONB NOT NULL,             -- array of strings, e.g. ["Setuju", "Tidak Setuju", "Abstain"]
  deadline TIMESTAMP NOT NULL,
  show_result_after_deadline BOOLEAN DEFAULT FALSE,  -- true: hasil hanya tampil setelah deadline
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vote Record — mencatat satu vote per user per voting (enforce one-vote constraint)
CREATE TABLE vote_record (
  id UUID PRIMARY KEY,
  voting_id UUID NOT NULL REFERENCES voting(id),
  user_id UUID NOT NULL REFERENCES users(id),
  opsi_dipilih VARCHAR(255) NOT NULL,  -- harus salah satu nilai dari voting.opsi
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(voting_id, user_id)           -- satu user hanya bisa vote sekali per voting
);

-- Refresh Tokens (untuk token revocation)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,  -- SHA-256 hash dari refresh token asli
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,                     -- NULL = masih valid; NOT NULL = sudah di-revoke
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kas (Finance Records)
-- Kas terikat ke RT tertentu
CREATE TABLE kas (
  id UUID PRIMARY KEY,
  rt_id UUID NOT NULL REFERENCES rt(id),  -- wajib: kas milik RT tertentu
  tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  deskripsi VARCHAR(255) NOT NULL,
  nominal DECIMAL(15,2) NOT NULL,
  kategori VARCHAR(100),
  recorded_by UUID REFERENCES users(id),
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.5 Authentication & Security

**Authentication Method:** JWT (JSON Web Token)

```
Login Flow:
1. User input identifier (username ATAU NIK/No. KTP) + password
2. Backend cari user berdasarkan username atau no_ktp (whichever matches)
3. Jika user ditemukan tapi status = 'tidak_aktif' → return 403 "Akun menunggu verifikasi pengurus RT"
4. Jika valid dan status = 'aktif' → Generate JWT access token (exp: 1 jam) + refresh token (exp: 7 hari)
5. Access token dikirim via response body; refresh token disimpan di httpOnly cookie
5. Frontend simpan access token di memory (bukan localStorage) untuk mencegah XSS
6. Setiap request ke API: include Authorization header (Bearer access_token)
7. Backend verify token di middleware
8. Ketika access token expired → frontend call /api/auth/refresh menggunakan httpOnly cookie
9. Logout: backend invalidasi refresh token (hapus dari DB), hapus cookie
```

**Token Revocation:**
- Refresh token disimpan di tabel `refresh_tokens` (user_id, token_hash, expires_at, revoked_at)
- Ketika pengurus RT logout atau role berubah → refresh token di-revoke (`revoked_at = NOW()`)
- Tabel `refresh_tokens` di-cleanup periodik untuk token expired

**Security Best Practices:**

- [ ] Password hashing menggunakan bcrypt (salt rounds: 10)
- [ ] JWT secret key disimpan di environment variable (.env)
- [ ] Access token disimpan di memory (bukan localStorage) — mencegah XSS
- [ ] Refresh token disimpan di httpOnly cookie — tidak dapat diakses JavaScript
- [ ] HTTPS only (disable HTTP di production)
- [ ] CORS configuration: hanya allow origin yang terdaftar
- [ ] Input validation & sanitization (prevent SQL Injection, XSS)
- [ ] Rate limiting pada login endpoint (max 5 attempt per 15 menit)
- [ ] File upload validation: max 5MB, whitelist format (JPG, PNG, PDF)
- [ ] Sensitive data logging disabled di production
- [ ] Refresh token revocation saat logout atau perubahan role

---

### 3.6 Integration Points

| Integration         | Detail                           | Status   |
| ------------------- | -------------------------------- | -------- |
| **File Upload**     | Cloudinary — upload bukti pembayaran & file surat; credentials via env (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) | MVP      |
| **Email/SMS**       | Reminder jatuh tempo (future)    | Post-MVP |
| **Payment Gateway** | Integasi bank/e-wallet (future)  | Post-MVP |
| **PDF Export**      | Laporan ke PDF                   | MVP      |
| **CSV Export**      | Data export untuk spreadsheet    | MVP      |

---

## 4. RISKS & ROADMAP

### 4.1 Technical Risks

| Risk                                  | Severity              | Mitigation                                                                |
| ------------------------------------- | --------------------- | ------------------------------------------------------------------------- |
| **Database connection failures**      | High                  | Implement connection pooling, auto-reconnect logic, health check endpoint |
| **File upload max size exceeded**     | Medium                | Validate file size client-side & server-side, compress images             |
| **Token expiration handling**         | Medium                | Implement refresh token mechanism, clear UI for re-login                  |
| **Data consistency (race condition)** | Medium                | Use database transactions, unique constraints                             |
| **High concurrent users**             | Low                   | Monitor performance, optimize queries, cache if needed                    |

---

### 4.2 Business Risks

| Risk                             | Impact | Mitigation                                                  |
| -------------------------------- | ------ | ----------------------------------------------------------- |
| **Low user adoption**            | High   | Training session for admin, simple UX, support channel      |
| **Data privacy concern**         | High   | Clear privacy policy, secure auth, audit logs               |
| **Pengurus RT leaves before handover** | Medium | Document process, backup admin account, knowledge base      |
| **Extended timeline**            | Medium | Strict scope (MVP only), daily standup, prioritize features |

---

### 4.3 Phased Rollout

```
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 1: MVP (Week 1)                                               │
├─────────────────────────────────────────────────────────────────────┤
│ ✓ Fitur Iuran (jenis, tagihan, pembayaran, verifikasi)              │
│ ✓ Dashboard Pengurus RT & Warga                                     │
│ ✓ Laporan basic & export CSV                                        │
│ ✓ Authentication & basic authorization                              │
│ ✓ Basic announcement feature                                        │
│ ✓ Data Warga management                                             │
│ ✓ Kas RT feature (pemasukan, pengeluaran, transparansi)             │
│ Target: Deploy to untuk testing                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                        Feedback & Bug Fix
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│ PHASE 2: Rollout + Additional Features (Week 2-3)                   │
├─────────────────────────────────────────────────────────────────────┤
│ ✓ Extended announcement feature                                     │
│ ✓ Service request feature (surat domisili, pengantar)               │
│ ✓ Jadwal kegiatan & RSVP                                            │
│ ✓ Voting/musyawarah digital                                         │
│ ✓ Training & documentation untuk pengurus & warga                   │
│ ✓ Email/SMS reminder setup (if budget allows)                       │
│ Target: Full rollout, semua RT menggunakan sistem                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                      Monitoring & Optimization
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│ PHASE 3: Enhancement (Week 4+)                                      │
├─────────────────────────────────────────────────────────────────────┤
│ ✓ Payment gateway integration (bank / e-wallet / qris)              │
│ ✓ Mobile app native (iOS/Android)                                   │
│ ✓ Advanced analytics & reporting                                    │
│ Target: Full-featured system, scale to more RW/district             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. SUCCESS METRICS & MONITORING

### 5.1 Key Metrics to Track

| Metric                            | Target              | Measurement                               |
| --------------------------------- | ------------------- | ----------------------------------------- |
| **Payment Compliance Rate**       | ≥ 90%               | (Pembayaran Lunas / Total Tagihan) × 100% |
| **System Uptime**                 | ≥ 99%               | Monitoring tool (e.g., Uptime Robot)      |
| **Avg Payment Verification Time** | ≤ 24 hours          | (Verification Time - Submit Time)         |
| **User Adoption**                 | ≥ 75% rumah aktif   | Rumah aktif dengan ≥1 akun / total rumah aktif |
| **User Login Activity**           | ≥ 80% akun / bulan  | Unique logins per month / total akun warga terdaftar |
| **Pengurus RT Task Time Reduction**     | ≥ 70%               | Compare manual vs system (hours/month)    |
| **Bug Report Response Time**      | ≤ 24 hours          | Time from report to fix deployment        |

### 5.2 Monitoring & Logging

- **Application Monitoring:** Error tracking (e.g., Sentry), performance logs
- **Database:** Query performance, backup integrity
- **User Activity:** Login, payment submission, verification actions
- **File System:** Upload success rate, storage usage

---

## 6. DELIVERY TIMELINE

| Milestone                  | Week | Deliverables                         |
| -------------------------- | ---- | ------------------------------------ |
| **Project Kickoff**        | 1    | Design review, dev environment setup |
| **Backend API Dev**        | 1-2  | All endpoints defined, basic CRUD    |
| **Frontend Dev**           | 1-2  | React components, dashboard UI       |
| **Integration & Testing**  | 2    | API-Frontend integration, QA testing |
| **Deployment (1-2 RT)**    | 2    | Deploy to staging, pilot testing     |
| **Bug Fix & Optimization** | 2-3  | Performance tuning, bug fixes        |
| **Rollout (10 RT)**        | 3    | Full deployment, admin training      |
| **Go-Live**                | 3    | System live, monitoring active       |
| **Post-Launch Support**    | 3+   | Support, feedback collection         |

---

## 7. APPENDIX

### A. Glossary

- **Iuran:** Kontribusi keuangan warga ke RT/RW
- **Tagihan:** Invoice/bill untuk pembayaran iuran
- **RT:** Rukun Tetangga (neighborhood unit)
- **RW:** Rukun Warga (larger neighborhood cluster)
- **Pengurus RW:** Ketua/Bendahara RW yang memonitor semua RT di bawah RW-nya (read-only access). 1 RW memiliki beberapa RT.
- **Bukti Transfer:** Proof of payment (screenshot/photo)
- **Verifikasi:** Pengurus RT checking dan approval pembayaran
- **Transparansi:** Visibility of financial records to residents

### B. Assumptions

1. **Internet Connection:** Setiap RT memiliki admin dengan akses internet stabil
2. **User Device:** Warga memiliki smartphone atau bisa akses web browser
3. **Pengurus RW Role:** Setiap RW memiliki minimal 1 Pengurus RW yang bertanggung jawab memonitor semua RT di bawah RW-nya dengan akses read-only. 1 RW dapat memiliki lebih dari 1 Pengurus RW (misalnya Ketua dan Bendahara RW).
4. **Legal:** Belum ada regulasi khusus tentang sistem digital RT
5. **Data Privacy:** Warga agree dengan penggunaan data sesuai privacy policy

### C. Constraints

- **Timeline:** 1 minggu untuk MVP
- **Budget:** Limited (need to prioritize)
- **Team:** Small development team
- **Scope:** Focus on Iuran feature untuk MVP

---

**Document Approval:**

- [ ] Product Owner: **\*\***\_\_\_**\*\*** (Date: \_\_\_)
- [ ] Tech Lead: **\*\***\_\_\_**\*\*** (Date: \_\_\_)
- [ ] Project Manager: **\*\***\_\_\_**\*\*** (Date: \_\_\_)

---

**Revision History:**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 7 Apr 2026 | Programming Club | Initial PRD creation |
| 1.1 | 11 Apr 2026 | cakapbagus | Tambah logika KK/rumah, NIK login, audit fixes: Story 2.1, VoteRecord, refresh token, perbaikan status tagihan, mekanisme insidental & reminder, keamanan JWT |
| 1.2 | 11 Apr 2026 | cakapbagus | Rumah bisa tidak aktif (kosong), banyak user per rumah, pembayaran oleh user manapun berlaku untuk rumahnya |
| 1.3 | 11 Apr 2026 | cakapbagus | Akun warga opsional; rumah tanpa akun tetap dapat tagihan; Story 1.3b baru untuk input pembayaran manual oleh pengurus RT |
| 1.4 | 11 Apr 2026 | cakapbagus | KPI User Adoption diukur per rumah aktif; fitur pindah rumah untuk KK dan akun warga; validasi hapus KK |
| 1.5 | 11 Apr 2026 | cakapbagus | Tipe hunian rumah (milik/kontrak); tabel kontrak_rumah; logika nonaktifkan rumah + hapus KK & akun saat penyewa keluar |
| 1.6 | 11 Apr 2026 | cakapbagus | Tambah alur pindah kepemilikan rumah: hapus KK & akun pemilik lama, rumah tetap aktif untuk pemilik baru |
| 1.7 | 11 Apr 2026 | cakapbagus | Detail skenario pindah KK: A (pindah intra-RT via edit KK), B (keluar RT via hapus KK); keduanya otomatis nonaktifkan rumah asal jika jadi kosong; Skenario C (pecah KK) diabaikan di MVP |
| 1.8 | 11 Apr 2026 | cakapbagus | Registrasi mandiri warga dengan approval flow; kolom status pada users (tidak_aktif default); akun dibuat pengurus langsung aktif; login blokir akun tidak_aktif |
| 1.9 | 11 Apr 2026 | cakapbagus | Revisi hierarki RW→RT: standarisasi terminologi Pengurus RW, perbaikan database schema (rt_id pada semua tabel, role enum, constraint scope), klarifikasi RBAC scoping per RT |
