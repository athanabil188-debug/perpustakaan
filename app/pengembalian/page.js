"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserFromStorage, isAuthenticated } from '@/lib/auth';

export default function ReturnBookPage() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [fineAmount, setFineAmount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);

  // Check if user is authenticated on component mount
  useEffect(() => {
    setIsAuthed(isAuthenticated());
    setCurrentUser(getUserFromStorage());
  }, []);

  // Fetch borrowed books when user is authenticated
  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      if (!isAuthed || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get borrowed books for the current user
        const response = await fetch(`/api/user-borrowings?member_id=${currentUser.id}`);
        const result = await response.json();

        if (result.success) {
          setBorrowedBooks(result.data);
        } else {
          setError(result.message || "Gagal mengambil daftar buku dipinjam");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data buku dipinjam: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthed) {
      fetchBorrowedBooks();
    }
  }, [isAuthed, currentUser]);

  // Calculate fine amount based on due date
  useEffect(() => {
    if (selectedBook && returnDate) {
      const book = borrowedBooks.find(b => b.id === parseInt(selectedBook));
      if (book) {
        const dueDate = new Date(book.due_date);
        const returnDateObj = new Date(returnDate);
        
        // Calculate days overdue (0 if returned on time or early)
        const timeDiff = returnDateObj.getTime() - dueDate.getTime();
        const daysOverdue = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        
        // Calculate fine (2000 per day overdue)
        const fine = daysOverdue * 2000;
        setFineAmount(fine);
      }
    } else {
      setFineAmount(0);
    }
  }, [selectedBook, returnDate, borrowedBooks]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBook) {
      setError("Silakan pilih buku yang ingin dikembalikan.");
      return;
    }

    if (!returnDate) {
      setError("Silakan pilih tanggal pengembalian.");
      return;
    }

    try {
      const response = await fetch(`/api/returns/${selectedBook}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "returned",
          return_date: returnDate,
          fine_amount: fineAmount,
          member_id: currentUser.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Buku berhasil dikembalikan!");
        setError(null);

        // Refresh the list of borrowed books
        const updatedResponse = await fetch(`/api/user-borrowings?member_id=${currentUser.id}`);
        const updatedResult = await updatedResponse.json();

        if (updatedResult.success) {
          setBorrowedBooks(updatedResult.data);
        }

        // Reset form
        setSelectedBook("");
        setReturnDate("");
      } else {
        setError(result.message || "Gagal mengembalikan buku");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengembalikan buku: " + err.message);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Akses Ditolak</h2>
          <p className="text-white mb-6">Anda harus login terlebih dahulu untuk mengembalikan buku</p>
          <Link 
            href="/auth/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'admin') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Akses Ditolak</h2>
          <p className="text-white mb-6">Admin tidak dapat mengembalikan buku. Silakan login sebagai anggota.</p>
          <Link 
            href="/auth/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Login sebagai anggota
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 flex items-center justify-center">
        <div className="text-white text-xl">Memuat...</div>
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
            <Link href="/library/Peminjaman" className="hover:underline">Peminjaman</Link>
            <Link href="/pengembalian" className="hover:underline">Pengembalian</Link>
            <Link href="/info-pinjaman">Info Pinjaman</Link>
            <Link href="/auth/login">Login</Link>
            <Link href="/user/Profile_Anda">Profile Anda</Link>
          </div>
        </nav>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Form Pengembalian Buku</h1>
          <p className="text-white">Kembalikan buku yang telah dipinjam</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {borrowedBooks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white text-lg">Anda tidak memiliki buku yang sedang dipinjam</p>
              <Link href="/library/Peminjaman" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Pinjam Buku
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Buku yang Sedang Dipinjam</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="py-2 px-4 text-left">Judul Buku</th>
                        <th className="py-2 px-4 text-left">Peminjaman</th>
                        <th className="py-2 px-4 text-left">Jatuh Tempo</th>
                        <th className="py-2 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowedBooks.map((book) => (
                        <tr key={book.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{book.book_title}</td>
                          <td className="py-2 px-4">{new Date(book.borrow_date).toLocaleDateString()}</td>
                          <td className="py-2 px-4">{new Date(book.due_date).toLocaleDateString()}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              new Date(book.due_date) < new Date() 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {new Date(book.due_date) < new Date() ? 'Terlambat' : 'Tepat Waktu'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Pilih Buku untuk Dikembalikan
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
                    required
                  >
                    <option value="">-- Pilih Buku --</option>
                    {borrowedBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.book_title} - Jatuh Tempo: {new Date(book.due_date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tanggal Pengembalian
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
                    min={new Date().toISOString().split('T')[0]} // Can't return before today
                    required
                  />
                  <p className="mt-1 text-sm text-white">Tanggal pengembalian (default hari ini jika kosong)</p>
                </div>

                {selectedBook && returnDate && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Perhitungan Denda</h3>
                    <p className="text-gray-700">
                      {fineAmount > 0 
                        ? `Denda: Rp ${fineAmount.toLocaleString('id-ID')} (${Math.max(0, Math.ceil((new Date(returnDate).getTime() - new Date(borrowedBooks.find(b => b.id === parseInt(selectedBook)).due_date).getTime()) / (1000 * 3600 * 24)))} hari terlambat × Rp 2.000/hari)`
                        : "Tidak ada denda (buku dikembalikan tepat waktu)"
                      }
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    disabled={!selectedBook || !returnDate}
                  >
                    Kembalikan Buku
                  </button>
                </div>
              </form>
            </>
          )}
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