"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SearchPage({ searchParams }) {
  const query = searchParams.q || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearch() {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        const semuaBuku = (data.data || []).map((book) => ({
          id: book.id,
          judul: book.title,
          gambar: book.cover_image_url || "/IMG/default-book.jpg",
        }));

        // Filter hasil berdasarkan kata pencarian
        const filtered = semuaBuku.filter((b) =>
          b.judul.toLowerCase().includes(query.toLowerCase())
        );

        setResults(filtered);
      } catch (err) {
        console.error("Error:", err);
      }

      setLoading(false);
    }

    fetchSearch();
  }, [query]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6">
      <h1 className="text-2xl font-extrabold text-white">
        Hasil Pencarian: "{query}"
      </h1>

      {loading ? (
        <p className="text-white mt-4">Sedang mencari buku...</p>
      ) : results.length === 0 ? (
        <p className="text-white mt-4">Tidak ada buku ditemukan.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-8">
          {results.map((b) => (
            <Link
              key={b.id}
              href={`/library/buku/${b.id}`}
              className="bg-white border border-gray-300 p-3 rounded-md flex flex-col items-center hover:scale-105 transition"
            >
              <img
                src={b.gambar}
                alt={b.judul}
                className="w-28 h-36 object-cover rounded-sm"
              />

              <p className="mt-3 font-semibold text-center text-black text-sm">
                {b.judul}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
