'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '../../lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending_requests: 0,
    active_borrowings: 0,
    overdue_borrowings: 0,
    total_active_borrowings: 0,
    total_members: 0,
    total_books: 0
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
    } else {
      setLoading(false);

      // Fetch admin statistics
      const fetchStats = async () => {
        try {
          const response = await fetch('/api/admin/stats');
          const data = await response.json();

          if(data.success) {
            setStats(data.data);
          } else {
            setSummaryError(data.message);
          }
        } catch (error) {
          // Provide more user-friendly error message
          if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
            setSummaryError('Koneksi ke database terlalu lama. Silakan coba lagi nanti atau periksa koneksi server Anda.');
          } else {
            setSummaryError(error.message);
          }
        } finally {
          setSummaryLoading(false);
        }
      };

      fetchStats();
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Admin</h1>
        <p className="text-gray-600 mb-6">Selamat datang di panel administrasi perpustakaan.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Manajemen Buku</h2>
            <p className="text-gray-600 mt-2">Tambah, edit, atau hapus buku dari perpustakaan</p>
            <a href="/admin/books" className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Kelola Buku
            </a>
          </div>

          <div className="bg-green-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Permintaan Peminjaman</h2>
            <p className="text-gray-600 mt-2">Lihat dan tanggapi permintaan peminjaman buku</p>
            <a href="/admin/borrowing-requests" className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Lihat Permintaan
            </a>
          </div>

          <div className="bg-purple-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Peminjaman Aktif</h2>
            <p className="text-gray-600 mt-2">Lihat dan kelola peminjaman buku yang sedang aktif</p>
            <a href="/admin/active-borrowings" className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Lihat Peminjaman
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Perbaiki Ketersediaan Buku</h2>
            <p className="text-gray-600 mt-2">Atur ulang jumlah buku yang tersedia untuk dipinjam</p>
            <a href="/admin/book-availability" className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Perbaiki Ketersediaan
            </a>
          </div>

          <div className="bg-orange-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Manajemen Anggota</h2>
            <p className="text-gray-600 mt-2">Lihat dan kelola data anggota perpustakaan</p>
            <a href="/admin/members" className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Kelola Anggota
            </a>
          </div>
        </div>

        {/* Admin Statistics Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Statistik Perpustakaan</h2>
          {summaryLoading ? (
            <p className="text-gray-600">Memuat data statistik...</p>
          ) : summaryError ? (
            <p className="text-red-500">Gagal memuat data: {summaryError}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-700">{stats.pending_requests}</p>
                <p className="text-sm text-gray-600">Menunggu</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{stats.total_active_borrowings}</p>
                <p className="text-sm text-gray-600">Sedang Dipinjam</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-700">{stats.overdue_borrowings}</p>
                <p className="text-sm text-gray-600">Terlambat</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-700">{stats.total_members}</p>
                <p className="text-sm text-gray-600">Anggota</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-2xl font-bold text-purple-700">{stats.total_books}</p>
                <p className="text-sm text-gray-600">Buku</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}