"use client";

import { useState } from "react";

export default function PeminjamanPage() {
  const [selectedDurasi, setSelectedDurasi] = useState("");
  const [search, setSearch] = useState("");

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

  // 🔍 LOGIKA SEARCH
  const filteredDurasi = durasiList.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handlePinjam = () => {
    if (!selectedDurasi) {
      alert("Pilih durasi peminjaman!");
      return;
    }
    alert("Peminjaman berhasil dikirim!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6 text-white">
      <h1 className="text-center text-3xl font-bold mb-6">Peminjaman Buku</h1>

      <div className="max-w-4xl mx-auto bg-white text-black p-8 rounded-2xl shadow-2xl">
        {/* Header Buku */}
        <div className="flex gap-6">
          <img
            src="/IMG/kisah-kasih-SMA.jpeg"
            alt="Buku"
            className="w-44 h-60 object-cover rounded-xl shadow"
          />
          <div>
            <h2 className="text-2xl font-bold">Kisah Kasih SMA</h2>
            <p>Penulis: Tim cv detok pusaka</p>
            <p>Stock buku: 6</p>
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
                  }`}
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
          <button
            onClick={handlePinjam}
            className="w-64 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
          >
            Pinjam
          </button>
        </div>
      </div>
    </div>
  );
}
