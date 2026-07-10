'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationBadge from '../../../components/NotificationBadge';

export default function AdminNavbar() {
  const router = useRouter();

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-md text-black whitespace-nowrap">
          ADMIN PANEL - PERPUSTAKAAN SMK TARUNA BHAKTI
        </h1>
      </div>

      <div className="flex justify-center flex-1">
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full shadow-sm w-full max-w-xs">
          <span className="text-xl mr-2">🔍</span>
          <input
            type="text"
            placeholder="Cari Buku......"
            className="outline-none font-bold text-black placeholder-black placeholder:font-bold w-full bg-transparent"
          />
        </div>
      </div>

      <div className="flex gap-4 text-sm text-black font-semibold whitespace-nowrap relative">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/admin/books" className="hover:underline">Manage Books</Link>
        <div className="relative">
          <Link href="/admin/borrowing-requests" className="hover:underline">Manage Borrowing</Link>
          <div className="absolute -top-2 -right-5">
            <NotificationBadge />
          </div>
        </div>
        <Link href="/Peminjaman" className="hover:underline">Peminjaman</Link>
        <Link href="/pengembalian" className="hover:underline">Pengembalian</Link>
        <Link href="/info-pinjaman" className="hover:underline">Info Pinjaman</Link>
        <Link href="/Profile_Anda" className="hover:underline">Profile</Link>
        <button
          onClick={() => {
            // Logout function
            if (typeof window !== 'undefined') {
              localStorage.removeItem('perpus_user');
              router.push('/login');
            }
          }}
          className="hover:underline text-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}