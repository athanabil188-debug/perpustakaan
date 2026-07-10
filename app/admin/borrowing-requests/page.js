'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BorrowingRequestsDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/borrowing-requests');
      const result = await response.json();

      if (result.success) {
        setRequests(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error fetching borrowing requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Dashboard Permintaan Peminjaman</h1>
            <p className="text-white">Kelola permintaan peminjaman buku dari anggota</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white">Memuat permintaan peminjaman...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Dashboard Permintaan Peminjaman</h1>
            <p className="text-white">Kelola permintaan peminjaman buku dari anggota</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-2xl font-bold text-white mb-2">
            Dashboard Permintaan Peminjaman
          </h1>
          <p className="text-white">
            Kelola permintaan peminjaman buku dari anggota
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-white">
              Daftar Permintaan Peminjaman
            </h2>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Semua ({requests.length})
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Menunggu (
                {requests.filter((r) => r.status === "pending").length})
              </button>
              <button
                onClick={() => setFilterStatus("approved")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === "approved"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Disetujui (
                {requests.filter((r) => r.status === "approved").length})
              </button>
              <button
                onClick={() => setFilterStatus("rejected")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Ditolak (
                {requests.filter((r) => r.status === "rejected").length})
              </button>
              <button
                onClick={() => setFilterStatus("returned")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filterStatus === "returned"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Dikembalikan (
                {requests.filter((r) => r.status === "returned").length})
              </button>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white text-lg">
                Tidak ada permintaan peminjaman{" "}
                {filterStatus === "all" ? "" : filterStatus}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      ID
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Anggota
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Buku
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Tanggal Permintaan
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Catatan
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {request.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {request.member_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {request.book_title}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status === "pending" && "Menunggu"}
                          {request.status === "approved" && "Disetujui"}
                          {request.status === "rejected" && "Ditolak"}
                          {request.status === "returned" && "Dikembalikan"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(request.request_date).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {request.request_note || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Link
                          href={`/admin/borrowing-requests/${request.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          terima
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Link
                          href={`/admin/borrowing-requests/${request.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Tolak
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Total Permintaan
            </h3>
            <p className="text-3xl font-bold text-white">{requests.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Menunggu</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {requests.filter((r) => r.status === "pending").length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Disetujui</h3>
            <p className="text-3xl font-bold text-green-400">
              {requests.filter((r) => r.status === "approved").length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Ditolak</h3>
            <p className="text-3xl font-bold text-red-400">
              {requests.filter((r) => r.status === "rejected").length}
            </p>
          </div>
        </div>

        {/* FOOTER - copied from main page */}
        <footer className="bg-white border-t border-black mt-10 py-6 text-center text-sm text-black">
          <div className="flex justify-center flex-wrap gap-6 mb-4 font-semibold">
            <Link href="/search">Search</Link>
            <Link href="/">Home</Link>
            <Link href="/library/Peminjaman">Peminjaman</Link>
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