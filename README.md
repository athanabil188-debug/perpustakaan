This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Setup

This project uses MySQL for data storage. Follow these steps to set up the database:

1. Make sure your MySQL server is running (e.g., through Laragon, XAMPP, or standalone MySQL)
2. Create a `.env` file in the root directory and add the following environment variables:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=  # Leave empty if you're using default Laragon/XAMPP MySQL setup
DB_NAME=perpustakaan
DB_PORT=3306
```

3. Run the database setup script to create the database and tables:

```bash
npm run db:setup
```

This will create the `perpustakaan` database and all necessary tables for the library management system including:
- Members table for storing library members
- Books table with details about available books
- Authors, categories, and publishers tables
- Borrowing transactions table
- Librarians table for system administration

## API Routes

The following API routes are available:

- `GET /api/test-db` - Test the database connection
- `GET /api/books` - Get all books in the library
- `POST /api/books` - Add a new book to the library
- `GET /api/members` - Get all library members
- `POST /api/members` - Add a new library member
- `GET /api/borrowing-requests` - Get all borrowing requests
- `POST /api/borrowing-requests` - Create a new borrowing request (for students)
- `PUT /api/borrowing-requests/[id]` - Update a borrowing request status (approve/reject)

## Peminjaman Buku

Sistem ini mendukung proses peminjaman buku oleh siswa dengan alur sebagai berikut:

1. Siswa mengajukan permintaan peminjaman melalui halaman `/Peminjaman`
2. Admin dapat melihat dan menyetujui/menolak permintaan di halaman `/admin/borrowing-requests`
3. Admin sekarang dapat melihat semua jenis permintaan (pending, approved, rejected, returned) berkat perubahan yang telah dibuat
4. Dashboard admin utama juga menampilkan jumlah permintaan peminjaman yang menunggu

## Fitur Admin

Admin memiliki akses ke berbagai fitur manajemen termasuk:

- Manajemen buku (`/admin/books`)
- Manajemen permintaan peminjaman (`/admin/borrowing-requests`) dengan filter untuk semua status
- Dashboard ringkasan peminjaman di halaman utama admin
