'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BookAvailabilityPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const fixAvailability = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/book-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'fix' }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        // Also get updated stats
        fetchStats();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error fixing book availability: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAllAvailability = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mereset ketersediaan semua buku? Ini akan membuat semua buku tersedia untuk dipinjam.')) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/book-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset' }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        // Also get updated stats
        fetchStats();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error resetting book availability: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/book-availability');
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error fetching availability stats: ' + err.message);
    }
  };

  // Fetch stats on component mount
  useState(() => {
    fetchStats();
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* NAVBAR - copied from main page */}
        <nav className="bg-white shadow-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-md text-black whitespace-nowrap">
              PERPUSTAKAAN SMK TARUNA BHAKTI
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

          <div className="flex gap-4 text-sm text-black font-semibold whitespace-nowrap">
            <Link href="/">Home</Link>
            <Link href="/library/Peminjaman">Peminjaman</Link>
            <Link href="/pengembalian">Pengembalian</Link>
            <Link href="/info-pinjaman">Info Pinjaman</Link>
            <Link href="/auth/login">Login</Link>
            <Link href="/user/Profile_Anda">Profile Anda</Link>
          </div>
        </nav>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Manajemen Ketersediaan Buku</h1>
          <p className="text-white">Perbaiki ketersediaan buku untuk peminjaman</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          {stats && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Statistik Ketersediaan Buku:</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Total Buku: {stats.total_books}</li>
                <li>Buku Tersedia: {stats.available_books}</li>
                <li>Buku Tidak Tersedia: {stats.unavailable_books}</li>
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Perbaiki Ketersediaan Buku</h2>
            <p className="text-white mb-4">
              Fungsi ini akan menyesuaikan jumlah buku yang tersedia berdasarkan jumlah total buku 
              dikurangi buku yang sedang dipinjam.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={fixAvailability}
              disabled={loading}
              className={`px-6 py-3 font-semibold rounded-lg transition ${
                loading
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Memproses...' : 'Perbaiki Ketersediaan Buku'}
            </button>

            <button
              onClick={resetAllAvailability}
              disabled={loading}
              className={`px-6 py-3 font-semibold rounded-lg transition ${
                loading
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {loading ? 'Memproses...' : 'Reset Semua Ketersediaan'}
            </button>
          </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-3">Petunjuk Penggunaan:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-white">
              <li>Gunakan tombol &quot;Perbaiki Ketersediaan Buku&quot; untuk menyesuaikan jumlah buku yang tersedia</li>
              <li>Fungsi ini akan menyesuaikan jumlah buku yang tersedia berdasarkan jumlah total buku dikurangi jumlah buku yang sedang dipinjam</li>
              <li>Setelah diperbaiki, buku-buku yang sebelumnya tidak tersedia akan bisa dipinjam kembali</li>
            </ol>
          </div>
        </div>

        {/* FOOTER - copied from main page */}
        <footer className="bg-white border-t border-black mt-10 py-6 text-center text-sm text-black">
          <div className="flex justify-center flex-wrap gap-6 mb-4 font-semibold">
            <Link href="/search">Search</Link>
            <Link href="/">Home</Link>
            <Link href="/library/Peminjaman">Peminjaman</Link>
            <Link href="/auth/register">Register</Link>
            <Link href="/auth/login">Login</Link>
            <Link href="/pengembalian">Pengembalian Buku</Link>
            <Link href="/info-pinjaman">Info Pinjaman</Link>
            <Link href="/user/Profile_Anda">Profile Anda</Link>
          </div>
          <p>© 2025 Perpustakaan Online Taruna Bhakti</p>
        </footer>
      </div>
    </div>
  );
}