"use client";

import { useState, useEffect } from "react";
import { getUserFromStorage, isAuthenticated } from "@/lib/auth";

export default function BookDetailPage() {
  const [book, setBook] = useState({
    id: 15, // Assigning an ID for this book
    title: "cerita yang lepas dari genggaman",
    author_name: "Tim Halo",
    publisher_name: "N/A",
    available_quantity: 8,
    description: "cerita yang lepas dari genggaman",
    cover_image_url: "/IMG/cerita lepas genggaman.jpg",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDurasi, setSelectedDurasi] = useState("");
  const [search, setSearch] = useState("");
  const [borrowingLoading, setBorrowingLoading] = useState(false);
  const [borrowingSuccess, setBorrowingSuccess] = useState(false);
  const [borrowingError, setBorrowingError] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const durasiList = [
    "1 Jam",
    "2 Jam",
    "3 Jam",
    "4 Jam",
    "5 Jam",
    "1 Hari",
    "2 Hari",
    "3 Hari",
    "4 Hari",
    "5 Hari",
    "6 Hari",
    "7 Hari",
    "8 Hari",
    "9 Hari",
    "10 Hari",
    "11 Hari",
    "12 Hari",
    "13 Hari",
    "14 Hari",
    "15 Hari",
    "1 Bulan",
    "2 Bulan",
    "3 Bulan",
    "4 Bulan",
    "5 Bulan",
  ];

  const durationMap = {
    "1 Jam": 1 / 24,
    "2 Jam": 2 / 24,
    "3 Jam": 3 / 24,
    "4 Jam": 4 / 24,
    "5 Jam": 5 / 24,
    "1 Hari": 1,
    "2 Hari": 2,
    "3 Hari": 3,
    "4 Hari": 4,
    "5 Hari": 5,
    "6 Hari": 6,
    "7 Hari": 7,
    "8 Hari": 8,
    "9 Hari": 9,
    "10 Hari": 10,
    "11 Hari": 11,
    "12 Hari": 12,
    "13 Hari": 13,
    "14 Hari": 14,
    "15 Hari": 15,
    "1 Bulan": 30,
    "2 Bulan": 60,
    "3 Bulan": 90,
    "4 Bulan": 120,
    "5 Bulan": 150,
  };

  // 🔍 LOGIKA SEARCH
  const filteredDurasi = durasiList.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    // Check authentication status
    setIsAuthed(isAuthenticated());
    setCurrentUser(getUserFromStorage());
  }, []);

  const handlePinjam = async () => {
    if (!selectedDurasi) {
      setBorrowingError("Pilih durasi peminjaman!");
      return;
    }

    if (!isAuthed) {
      setBorrowingError("Anda harus login terlebih dahulu untuk meminjam buku");
      return;
    }

    // Prevent admin from borrowing books
    if (currentUser?.role === "admin") {
      setBorrowingError(
        "Admin tidak dapat meminjam buku. Silakan login sebagai anggota."
      );
      return;
    }

    // Validate all required parameters
    const memberId = currentUser?.id;
    const bookId = book.id; // For static pages, we need to determine the book ID somehow

    if (!memberId) {
      setBorrowingError("Tidak dapat menemukan informasi pengguna");
      return;
    }

    if (!bookId) {
      setBorrowingError("ID buku tidak valid");
      return;
    }

    setBorrowingLoading(true);
    setBorrowingError("");

    try {
      // Calculate due date based on duration
      const durationInDays = durationMap[selectedDurasi] || 7; // Default to 7 days
      const borrowDate = new Date();
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + durationInDays);

      const response = await fetch("/api/borrowing-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: memberId,
          book_id: bookId,
          request_note: `Peminjaman untuk durasi: ${selectedDurasi}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBorrowingSuccess(true);
        setSelectedDurasi("");
      } else {
        setBorrowingError(
          result.message || "Failed to submit borrowing request"
        );
      }
    } catch (err) {
      setBorrowingError(err.message);
    } finally {
      setBorrowingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6 text-white">
      <h1 className="text-center text-3xl font-bold mb-6">Detail Buku</h1>

      <div className="max-w-4xl mx-auto bg-white text-black p-8 rounded-2xl shadow-2xl">
        {/* Header Buku */}
        <div className="flex gap-6">
          <img
            src={book?.cover_image_url || "/IMG/default-book.jpg"}
            alt={book?.title}
            className="w-44 h-60 object-cover rounded-xl shadow"
          />
          <div>
            <h2 className="text-2xl font-bold">{book?.title}</h2>
            <p>Penulis: {book?.author_name || "N/A"}</p>
            <p>Stock buku: {book?.available_quantity || 0}</p>
            <p className="mt-2 text-red-600">
              Jika telat kembalikan buku per 1 hari denda: 2000
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Rating & Ulasan Pembaca</h2>

          <div className="mb-6">
            <p className="font-semibold text-lg">carisa</p>
            <p className="text-yellow-500 text-xl">★★★★★</p>
            <p className="mt-1 text-gray-700">
              Bukunya sangat menginspirasi dan penuh dengan pelajaran kisah
              kasih di sma.
            </p>
            <hr className="mt-4" />
          </div>

          <div className="mb-6">
            <p className="font-semibold text-lg">Nabil</p>
            <p className="text-yellow-500 text-xl">★★★★☆</p>
            <p className="mt-1 text-gray-700">
              Cerita-ceritanya sangat menyentuh hati dan mudah dipahami.
            </p>
            <hr className="mt-4" />
          </div>
        </div>

        {/* Durasi */}
        <div className="mt-8">
          <p className="font-semibold mb-2">
            Minjam berapa menit, jam, hari, bulan:
          </p>

          {/* 🔍 SEARCH INPUT */}
          <input
            type="text"
            placeholder="Cari durasi…"
            className="w-full p-3 border rounded-lg mb-4 bg-gray-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            {filteredDurasi.length > 0 ? (
              filteredDurasi.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedDurasi(item)}
                  className={`py-2 rounded-lg border ${
                    selectedDurasi === item
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  } ${
                    book?.available_quantity <= 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={book?.available_quantity <= 0}
                >
                  {item}
                </button>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500">
                Durasi tidak ditemukan
              </p>
            )}
          </div>
        </div>

        {/* Tombol Pinjam */}
        <div className="mt-10 flex justify-center">
          {!isAuthed ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">
                Anda harus login terlebih dahulu untuk meminjam buku
              </p>
              <a
                href="/auth/login"
                className="inline-block w-64 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
              >
                Login untuk Meminjam
              </a>
            </div>
          ) : currentUser?.role === "admin" ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">
                Admin tidak dapat meminjam buku
              </p>
              <a
                href="/auth/login"
                className="inline-block w-64 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
              >
                Login sebagai anggota
              </a>
            </div>
          ) : book?.available_quantity > 0 ? (
            <button
              onClick={handlePinjam}
              disabled={borrowingLoading || !selectedDurasi}
              className={`w-64 py-3 rounded-xl font-semibold transition ${
                borrowingLoading
                  ? "bg-gray-400"
                  : selectedDurasi
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white`}
            >
              {borrowingLoading ? "Memproses..." : "Pinjam Buku"}
            </button>
          ) : (
            <button
              className="w-64 bg-red-500 text-white py-3 rounded-xl font-semibold cursor-not-allowed"
              disabled
            >
              Buku Tidak Tersedia
            </button>
          )}
        </div>

        {/* Pesan Sukses atau Error */}
        {borrowingSuccess && (
          <div
            className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">
              Permintaan peminjaman berhasil dikirim! Silakan tunggu konfirmasi
              dari admin.
            </span>
          </div>
        )}

        {borrowingError && (
          <div
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{borrowingError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
