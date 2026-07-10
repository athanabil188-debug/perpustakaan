"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfileAnda() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("perpus_user");
    if (!userData) {
      // Redirect to login if no user data
      router.push("/auth/login");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      setUser(parsedData);
      setLoading(false);
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clear invalid data and redirect to login
      localStorage.removeItem("perpus_user");
      router.push("/auth/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-6">
      <h1 className="text-center text-white text-3xl font-bold mb-6">
        Profile Anda
      </h1>

      {/* CARD */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="space-y-4 text-lg">
          <p>
            <b>Nama:</b> {user.name}
          </p>
          <p>
            <b>NISN/NIP:</b> {user.nis}
          </p>
          <p>
            <b>Email:</b> {user.email || 'N/A'}
          </p>
          <p>
            <b>Role:</b> {user.role}
          </p>
        </div>

        {/* TOMBOL */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("perpus_user");
              router.push("/auth/login");
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
