'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function BorrowingRequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('perpus_user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        window.location.href = '/auth/login'; // Redirect to login if not admin
        return;
      }
      setCurrentUser(user);
    } else {
      window.location.href = '/auth/login'; // Redirect to login if not authenticated
      return;
    }

    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/borrowing-requests/${id}`);
      const result = await response.json();

      if (result.success) {
        setRequest(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error fetching borrowing request detail: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui permintaan peminjaman ini?')) {
      return;
    }

    setApproving(true);
    try {
      const response = await fetch(`/api/borrowing-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          approved_by: currentUser?.id || null,
          due_date: calculateDueDate(7) // Default to 7 days
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Permintaan peminjaman berhasil disetujui!');
        fetchRequest(); // Refresh the data
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error approving request: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const rejectRequest = async () => {
    if (!rejectionReason.trim()) {
      alert('Silakan masukkan alasan penolakan.');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin menolak permintaan peminjaman ini?')) {
      return;
    }

    setRejecting(true);
    try {
      const response = await fetch(`/api/borrowing-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          rejected_by: currentUser?.id || null,
          rejection_reason: rejectionReason
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Permintaan peminjaman berhasil ditolak!');
        fetchRequest(); // Refresh the data
        setRejectionReason(''); // Clear the reason field
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error rejecting request: ' + err.message);
    } finally {
      setRejecting(false);
    }
  };

  const calculateDueDate = (days) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Detail Permintaan Peminjaman</h1>
            <p className="text-white">Informasi lengkap tentang permintaan peminjaman buku</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-white">Memuat detail permintaan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Detail Permintaan Peminjaman</h1>
            <p className="text-white">Informasi lengkap tentang permintaan peminjaman buku</p>
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

  if (!request) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Detail Permintaan Peminjaman</h1>
            <p className="text-white">Informasi lengkap tentang permintaan peminjaman buku</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
            <div className="text-center py-10">
              <p className="text-white text-lg">Permintaan peminjaman tidak ditemukan.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <Link href="/admin/borrowing-requests">Daftar Permintaan</Link>
          </div>
        </nav>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Detail Permintaan Peminjaman</h1>
          <p className="text-white">ID: #{request.id} - {new Date(request.request_date).toLocaleDateString('id-ID')}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Detail Anggota</h2>
              <div className="bg-white p-4 rounded-lg">
                <p className="mb-2"><span className="font-semibold">Nama:</span> {request.member_name}</p>
                <p className="mb-2"><span className="font-semibold">ID Anggota:</span> {request.member_id}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Detail Buku</h2>
              <div className="bg-white p-4 rounded-lg">
                <p className="mb-2"><span className="font-semibold">Judul:</span> {request.book_title}</p>
                <p className="mb-2"><span className="font-semibold">ID Buku:</span> {request.book_id}</p>
                <p className="mb-2"><span className="font-semibold">ISBN:</span> {request.isbn || 'N/A'}</p>
                <p className="mb-2"><span className="font-semibold">Penulis:</span> {request.author_name || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Status dan Tanggal</h2>
              <div className="bg-white p-4 rounded-lg">
                <p className="mb-2">
                  <span className="font-semibold">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {request.status === 'pending' && 'Menunggu'}
                    {request.status === 'approved' && 'Disetujui'}
                    {request.status === 'rejected' && 'Ditolak'}
                    {request.status === 'returned' && 'Dikembalikan'}
                  </span>
                </p>
                <p className="mb-2"><span className="font-semibold">Tanggal Permintaan:</span> {new Date(request.request_date).toLocaleDateString('id-ID')}</p>
                {request.approved_date && (
                  <p className="mb-2"><span className="font-semibold">Tanggal Disetujui:</span> {new Date(request.approved_date).toLocaleDateString('id-ID')}</p>
                )}
                {request.rejected_date && (
                  <p className="mb-2"><span className="font-semibold">Tanggal Ditolak:</span> {new Date(request.rejected_date).toLocaleDateString('id-ID')}</p>
                )}
                {request.borrow_date && (
                  <p className="mb-2"><span className="font-semibold">Tanggal Peminjaman:</span> {new Date(request.borrow_date).toLocaleDateString('id-ID')}</p>
                )}
                {request.due_date && (
                  <p className="mb-2"><span className="font-semibold">Tanggal Jatuh Tempo:</span> {new Date(request.due_date).toLocaleDateString('id-ID')}</p>
                )}
                {request.return_date && (
                  <p className="mb-2"><span className="font-semibold">Tanggal Dikembalikan:</span> {new Date(request.return_date).toLocaleDateString('id-ID')}</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Informasi Tambahan</h2>
              <div className="bg-white p-4 rounded-lg">
                <p className="mb-2"><span className="font-semibold">Catatan Permintaan:</span> {request.request_note || 'Tidak ada catatan'}</p>
                {request.approved_by_name && (
                  <p className="mb-2"><span className="font-semibold">Disetujui oleh:</span> {request.approved_by_name}</p>
                )}
                {request.rejected_by_name && (
                  <p className="mb-2"><span className="font-semibold">Ditolak oleh:</span> {request.rejected_by_name}</p>
                )}
                {request.rejection_reason && (
                  <p className="mb-2"><span className="font-semibold">Alasan Penolakan:</span> {request.rejection_reason}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - only show if status is pending */}
        {request.status === 'pending' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Aksi Permintaan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <button
                  onClick={approveRequest}
                  disabled={approving}
                  className={`w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition ${
                    approving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {approving ? 'Memproses...' : 'Setujui Permintaan'}
                </button>
              </div>
              
              <div>
                <div className="mb-3">
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-white mb-1">
                    Alasan Penolakan
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
                    placeholder="Masukkan alasan penolakan..."
                  />
                </div>
                
                <button
                  onClick={rejectRequest}
                  disabled={rejecting}
                  className={`w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition ${
                    rejecting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {rejecting ? 'Memproses...' : 'Tolak Permintaan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER - copied from main page */}
        <footer className="bg-white border-t border-black mt-10 py-6 text-center text-sm text-black">
          <div className="flex justify-center flex-wrap gap-6 mb-4 font-semibold">
            <Link href="/">Home</Link>
            <Link href="/library/Peminjaman">Peminjaman</Link>
            <Link href="/auth/login">Login</Link>
            <Link href="/pengembalian">Pengembalian Buku</Link>
            <Link href="/info-pinjaman">Info Pinjaman</Link>
            <Link href="/admin/borrowing-requests">Daftar Permintaan</Link>
          </div>
          <p>© 2025 Perpustakaan Online Taruna Bhakti</p>
        </footer>
      </div>
    </div>
  );
}