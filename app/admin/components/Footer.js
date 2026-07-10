import Link from 'next/link';

export default function AdminFooter() {
  return (
    <footer className="bg-white border-t border-black mt-10 py-6 text-center text-sm text-black">
      <div className="flex justify-center flex-wrap gap-6 mb-4 font-semibold">
        <Link href="/search">Search</Link>
        <Link href="/">Home</Link>
        <Link href="/Peminjaman">Peminjaman</Link>
        <Link href="/login">Login</Link>
        <Link href="/pengembalian">Pengembalian Buku</Link>
        <Link href="/info-pinjaman">Info Pinjaman</Link>
        <Link href="/Profile_Anda">Profile Anda</Link>
      </div>
      <p>© 2025 Perpustakaan Online Taruna Bhakti</p>
    </footer>
  );
}