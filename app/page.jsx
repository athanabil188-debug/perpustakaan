"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      name: "Kisah Kasih SMA",
      img: "/IMG/kisah-kasih-SMA.jpeg",
      link: "/buku/kisah/kasih",
    },
    {
      name: "Bahasa Indonesia",
      img: "/IMG/bahasa_indonesia.jpg",
      link: "/buku/indonesia",
    },
    {
      name: "Text Cerita Sejarah",
      img: "/IMG/teks_cerita_sejarah.jpg",
      link: "/buku/text-cerita-sejarah",
    },
    {
      name: "Bahasa Inggris",
      img: "/IMG/Bahasa inggris.jpeg",
      link: "/buku/inggris",
    },
    { name: "Agama Islam", img: "/IMG/PAI.jpeg", link: "/buku/agama-islam" },
    {
      name: "Animasi 2D,3D",
      img: "/IMG/ANIMASI 2D dan 3D.jpg",
      link: "/buku/2d-3d",
    },
    {
      name: "Sekolah di Atas Bukit",
      img: "/IMG/Sekolah di atas bukit.jpg",
      link: "/buku/sekolah-diatas-bukit",
    },
    {
      name: "Dongeng Teladan dari Dunia Binatang",
      img: "/IMG/Dongeng teladan.jpg",
      link: "/buku/dongeng/teladan",
    },
    {
      name: "Dongeng Nina Bobo",
      img: "/IMG/Dongeng Nina Bobo.jpg",
      link: "/buku/dongeng_nina/bobo",
    },
    { name: "Putih Abu-abu", img: "/IMG/Putih abu-abu.jpg", link: "/buku/abu" },
    {
      name: "Cerita yang Lepas dari Genggaman",
      img: "/IMG/cerita lepas genggaman.jpg",
      link: "/buku/cerita-yang-lepas-dari-genggaman",
    },
    {
      name: "Persahabatan",
      img: "/IMG/Persahabatan.jpg",
      link: "/buku/persaha/batan",
    },
    {
      name: "Algoritma Pemprograman",
      img: "/IMG/Algoritma_Pemprograman.jpeg",
      link: "/buku/algo",
    },
    { name: "Sejarah", img: "/IMG/sejarah.jpg", link: "/buku/sejarah" },
    {
      name: "ilmu pengetahuan bumi dan antariksa",
      img: "/IMG/Bumi dan Antariska.jpg",
      link: "/buku/bumi/ilmu-pengetahuan-bumi-dan-antariksa",
    },
  ];

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        const transformedBooks = (data.data || []).map((book) => ({
          id: book.id,
          judul: book.title || "Tanpa Judul",
          gambar: book.cover_image_url || "/IMG/default-book.jpg",
          rating: 4.5,
        }));

        setBooks(transformedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([
          {
            id: 1,
            judul: "Buku Default",
            gambar: "/IMG/default-book.jpg",
            rating: 4.5,
          },
        ]);
      }
    }
    fetchBooks();
  }, []);

  // =========================
  // FIX SEARCH FILTER
  // =========================
  const filteredBooks =
    searchTerm.trim() === ""
      ? books // kalau search kosong → tampil semua
      : books.filter((b) =>
          b.judul?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400">
      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="font-bold text-md text-black whitespace-nowrap">
          PERPUSTAKAAN SMK TARUNA BHAKTI
        </h1>

        {/* SEARCH */}
        <div className="flex justify-center flex-1">
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full shadow-sm w-full max-w-xs">
            <span className="text-xl mr-2">🔍</span>
            <input
              type="text"
              placeholder="Cari Buku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none font-bold text-black placeholder-black bg-transparent w-full"
            />
          </div>
        </div>

        <div className="flex gap-4 text-sm text-black font-semibold whitespace-nowrap">
          <Link href="/">Home</Link>
          <Link href="/library/Peminjaman">Peminjaman</Link>
          <Link href="/pengembalian">Pengembalian</Link>
          <Link href="/info-pinjaman">Info Pinjaman</Link>
          <Link href="/auth/register">Register</Link>
          <Link href="/auth/login">Login</Link>
          <Link href="/user/Profile_Anda">Profile Anda</Link>
        </div>
      </nav>

      {/* TITLE */}
      <div className="flex justify-center mt-6 px-4">
        <div className="rounded-lg shadow-lg p-6 max-w-2xl text-center bg-white/10 backdrop-blur-md">
          <h2 className="font-extrabold text-2xl md:text-3xl text-white">
            Selamat Datang di Perpustakaan Digital SMK Taruna Bhakti!!
          </h2>
          <p className="mt-3 text-sm md:text-base font-medium text-white">
            Temukan dan pinjam buku favoritmu dengan mudah, cepat, dan praktis.
          </p>
        </div>
      </div>

      {/* KATEGORI */}
      <div className="max-w-6xl mx-auto mt-10 px-4">
        <h3 className="text-white font-bold text-2xl mb-6">Daftar Isi Buku</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.link}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:scale-105 transition"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-44 object-cover"
              />
              <div className="p-4 text-center">
                <h4 className="font-bold text-black">{cat.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* GRID BUKU */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-4xl mx-auto mt-10">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((b) => (
            <Link
              key={b.id}
              href={`/library/buku/${b.id}`}
              className="bg-white border border-gray-300 p-2 rounded-md flex flex-col items-center hover:scale-105 transition"
            >
              <img
                src={b.gambar}
                alt={b.judul}
                className="w-28 h-36 object-cover rounded-sm"
              />
              <p className="mt-3 font-semibold text-center text-black text-sm">
                {b.judul}
              </p>
              <p className="text-xs text-gray-600 italic">Rating: {b.rating}</p>
            </Link>
          ))
        ) : (
          <p className="text-center text-white col-span-full text-lg font-bold">
            Buku tidak ditemukan 😢
          </p>
        )}
      </div>

      {/* LOGO */}
      <div className="mt-16 flex justify-center">
        <img src="/IMG/logo_tb.jpeg" className="w-32" />
      </div>

      {/* FOOTER */}
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
  );
}
