"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserFromStorage, isAuthenticated } from '@/lib/auth';

export default function InfoPinjamanPage() {
  const router = useRouter();
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getUserFromStorage();
    if (!user || !isAuthenticated()) {
      // Redirect to login if not authenticated
      router.push("/auth/login");
      return;
    }

    setCurrentUser(user);

    // Fetch borrowing history for the logged-in user
    const fetchBorrowingHistory = async () => {
      try {
        // This API endpoint would need to be created to fetch user's borrowing history
        // For now, we'll use borrowing requests to show pending loans
        const response = await fetch('/api/borrowing-requests');
        const result = await response.json();

        if (result.success) {
          // Filter results to show only this user's requests
          const userBorrowingHistory = result.data.filter(request =>
            request.member_id === user.id || request.member_id === parseInt(user.nis)
          );
          setBorrowingHistory(userBorrowingHistory);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Gagal mengambil data peminjaman: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchBorrowingHistory();
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 flex items-center justify-center">
        <div className="text-white text-xl">Memuat informasi peminjaman...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6">
        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="mt-4">
            <Link href="/auth/login" className="text-blue-300 hover:underline">
              Kembali ke halaman login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white">Info Peminjaman Buku</h1>
          <p className="text-white">Riwayat peminjaman dan permintaan Anda</p>
        </div>

        {/* User Info */}
        {currentUser && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-4 mb-6">
            <div className="text-white">
              <p><span className="font-semibold">Nama:</span> {currentUser.name}</p>
              <p><span className="font-semibold">NIS/NIP:</span> {currentUser.nis}</p>
              <p><span className="font-semibold">Role:</span> {currentUser.role}</p>
            </div>
          </div>
        )}

        {/* Borrowing History */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Buku</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tanggal Pinjam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tanggal Harus Kembali</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white bg-opacity-70 divide-y divide-gray-200">
              {borrowingHistory.length > 0 ? (
                borrowingHistory.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.book_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.request_date ? new Date(request.request_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.due_date ? new Date(request.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          request.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' ? (
                        <span className="text-yellow-600">Menunggu konfirmasi</span>
                      ) : request.status === 'approved' ? (
                        <span className="text-green-600">Sedang dipinjam</span>
                      ) : request.status === 'returned' ? (
                        <span className="text-blue-600">Sudah dikembalikan</span>
                      ) : (
                        <span className="text-red-600">Ditolak</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada riwayat peminjaman
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Beranda
          </Link>
          <Link 
            href="/library/Peminjaman" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Pinjam Buku Baru
          </Link>
        </div>
      </div>
    </div>
  );
}