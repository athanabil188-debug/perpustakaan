"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BorrowBookPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check authentication on component mount
  useEffect(() => {
    const userData = localStorage.getItem("perpus_user");
    if (!userData) {
      // Redirect to login if no user data
      router.push("/auth/login");
      return;
    }
  }, [router]);

  // Get member ID from user data
  const [memberId, setMemberId] = useState(null);

  // Fetch books and members
  useEffect(() => {
    const userData = localStorage.getItem("perpus_user");
    if (!userData) {
      router.push("/auth/login");
      return;
    }

    const user = JSON.parse(userData);
    const fetchMemberData = async () => {
      try {
        // Fetch books that are available
        const booksRes = await fetch("/api/books");
        const booksData = await booksRes.json();

        // Only show books with available quantity > 0
        const availableBooks = booksData.data?.filter(book => book.available_quantity > 0) || [];
        setBooks(availableBooks);

        // Fetch members based on user role
        if (user.role === 'admin') {
          // Admin can see all members
          const membersRes = await fetch("/api/members");
          const membersData = await membersRes.json();
          setMembers(membersData.data || []);

          // Set default member if available
          if (membersData.data && membersData.data.length > 0) {
            setMemberId(membersData.data[0].id);
          }
        } else {
          // Regular user can only see their own data
          setMembers([user]);
          setMemberId(user.id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication before submitting
    const userData = localStorage.getItem("perpus_user");
    if (!userData) {
      router.push("/auth/login");
      return;
    }

    if (!selectedBook) {
      setError("Please select a book to borrow.");
      return;
    }

    if (!memberId) {
      setError("Please select a member.");
      return;
    }

    try {
      const response = await fetch("/api/borrowing-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: parseInt(memberId),
          book_id: parseInt(selectedBook),
          request_note: requestNote,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Borrowing request submitted successfully! Please wait for admin approval.");
        setSelectedBook("");
        setRequestNote("");
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error submitting borrowing request: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
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
            <Link href="/library/Peminjaman" className="hover:underline">Peminjaman</Link>
            <Link href="/pengembalian">Pengembalian</Link>
            <Link href="/info-pinjaman">Info Pinjaman</Link>
            <Link href="/auth/login">Login</Link>
            <Link href="/user/Profile_Anda">Profile Anda</Link>
          </div>
        </nav>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Form Peminjaman Buku</h1>
          <p className="text-white">Ajukan permintaan peminjaman buku yang tersedia</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Pilih Buku
              </label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
                required
              >
                <option value="">-- Pilih Buku --</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} (by {book.author_name}) - Tersedia: {book.available_quantity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Anggota (Peminjam)
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-white">Pilih anggota perpustakaan</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Catatan Permintaan (Opsional)
              </label>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
                placeholder="Tulis alasan peminjaman atau catatan lainnya..."
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Ajukan Permintaan Peminjaman
              </button>
            </div>
          </form>
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