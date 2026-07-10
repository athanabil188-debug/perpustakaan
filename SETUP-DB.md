# Setup Database untuk Sistem Perpustakaan

## Persyaratan
- Pastikan MySQL server berjalan di sistem Anda (dalam hal ini Laragon)
- Pastikan Anda sudah menyalakan MySQL dari Laragon Control Panel

## Cara Setup Database

### Metode 1: Menggunakan Node.js Script (Direkomendasikan)

1. Buka command prompt/terminal di direktori proyek ini
2. Jalankan perintah berikut:

```bash
node setup-database.js
```

Script ini akan:
- Membuat database `perpustakaan` jika belum ada
- Membuat semua tabel yang diperlukan
- Menambahkan admin default dengan username `admin` dan password `admin123`

### Metode 2: Menggunakan Command Line MySQL

Jika Anda lebih suka menggunakan perintah MySQL langsung, jalankan:

```bash
mysql -u root -p < lib/schema.sql
```

Atau jika tidak menggunakan password:

```bash
mysql -u root < lib/schema.sql
```

### Metode 3: Menggunakan phpMyAdmin (Laragon)

1. Buka browser dan akses `http://localhost/phpmyadmin`
2. Klik "New" untuk membuat database baru
3. Nama database: `perpustakaan`
4. Klik database yang baru dibuat
5. Klik tab "Import"
6. Klik "Choose File" dan pilih file `lib/schema.sql` di folder `lib/`
7. Klik "Go" untuk mengimpor skema database

## Verifikasi Setup

Setelah setup selesai:

1. Pastikan database `perpustakaan` sudah dibuat
2. Pastikan semua tabel sudah dibuat dengan benar
3. Pastikan user admin default sudah ada di tabel `librarians`

## Default Admin User

Setelah setup selesai, user admin default akan dibuat:
- Username: `admin`
- Password: `admin123`
- Email: `admin@library.com`

## Troubleshooting

Jika Anda mendapatkan error seperti:
- "ECONNREFUSED": Pastikan MySQL server berjalan
- "ER_ACCESS_DENIED_ERROR": Periksa username dan password di file `.env`
- "Unknown database": Database mungkin belum dibuat

## Setelah Setup Database

Setelah database berhasil dibuat, aplikasi seharusnya bisa berjalan dengan normal dan menampilkan data peminjaman di dashboard admin.

Jika masih ada masalah, pastikan:
1. File `.env` sudah berisi konfigurasi database yang benar
2. MySQL server berjalan (cek di Laragon Control Panel)
3. Port database benar (default 3306)