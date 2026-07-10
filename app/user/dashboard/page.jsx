"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          Selamat! Anda Berhasil Login 🎉
        </h1>
        <p className="mb-6 text-gray-600">
          Anda sekarang dapat mengakses sistem.
        </p>

        <div className="flex flex-col gap-3">
          {/* TOMBOL PROFILE ANDA */}
          <Link
            href="/Profile_Anda"
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Profile Anda
          </Link>

          {/* TOMBOL KEMBALI */}
          <Link
            href="/"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
