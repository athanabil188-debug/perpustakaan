"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateAdminCredentials } from '@/lib/auth';

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState(""); // For non-admin users, this will be their email; for admin, this will be username
  const [password, setPassword] = useState(""); // For all users, this will be the password
  const [kelas, setKelas] = useState("");
  const [role, setRole] = useState("siswa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (role !== 'admin') {
      // For student and teacher, require email and password
      if (!username.trim() || !password.trim()) {
        setError("Email dan password harus diisi.");
        return;
      }
    } else {
      // For admin, only require username and password
      if (!username.trim() || !password.trim()) {
        setError("Username dan password harus diisi.");
        return;
      }
      // For admin, set kelas to empty if not already set
      if (!kelas) {
        setKelas(""); // This is done just for consistency in the stored object
      }
    }

    setLoading(true);

    try {
      if (role === "admin") {
        // For admin, validate credentials client-side first
        if (validateAdminCredentials(username, password)) {
          // Admin credentials are valid, store user in localStorage
          localStorage.setItem(
            "perpus_user",
            JSON.stringify({
              id: 1, // Placeholder ID for admin
              nis: username, // username for admin
              name: username, // Use username as name for admin
              email: "", // No email in this implementation
              kelas: "", // Empty class for admin
              role: role
            })
          );

          // Redirect to admin dashboard
          router.push("/admin");
          return;
        } else {
          setError("Username atau password admin tidak valid.");
          setLoading(false);
          return;
        }
      } else {
        // For non-admin roles, authenticate via API using email
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: username, // Using email for non-admin login
            password: password, // Password for verification
            kelas: kelas, // Include class for student/teacher
            role: role
          })
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.message || "Login gagal. Silakan coba lagi.");
          return;
        }

        const userData = result.user;

        // Store user data in localStorage with proper ID
        // For admin: id, username, name, email, role
        // For others: id, member_id, name, email, role
        localStorage.setItem(
          "perpus_user",
          JSON.stringify({
            id: userData.id, // This is the actual database ID
            nis: userData.username || userData.member_id, // username for admin, member_id for others
            name: userData.name,
            email: userData.email,
            kelas: userData.kelas || kelas, // Class for student/teacher (from database or form)
            role: role
          })
        );

        // ⬅ Arahkan berdasarkan role
        if (role === "guru") {
          router.push("/guru");
        } else if (role === "admin") {
          router.push("/admin");
        } else {
          // Redirect students and other users to landing page
          router.push("/");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0d2dbf] to-[#7BB3FF] p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">
          Login Perpustakaan
        </h1>
        <p className="text-center text-gray-500 mb-4">
          Masuk menggunakan akun Anda
        </p>

        {role !== 'admin' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4">
            <p className="font-semibold">Belum punya akun?</p>
            <p>Untuk dapat meminjam buku, Anda harus terdaftar sebagai anggota perpustakaan.</p>
            <a href="/auth/register" className="text-blue-600 hover:underline font-medium">Daftar di sini</a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ROLE */}
          <div>
            <label className="text-sm font-medium">Role</label>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setRole("siswa")}
                className={`px-3 py-1 rounded-lg border ${
                  role === "siswa" ? "bg-blue-600 text-white" : ""
                }`}
              >
                Siswa
              </button>

              <button
                type="button"
                onClick={() => setRole("guru")}
                className={`px-3 py-1 rounded-lg border ${
                  role === "guru" ? "bg-blue-600 text-white" : ""
                }`}
              >
                Guru
              </button>

              {/* ADMIN BARU */}
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`px-3 py-1 rounded-lg border ${
                  role === "admin" ? "bg-red-600 text-white" : ""
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {role !== 'admin' ? (
            <>
              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="Masukkan email Anda"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="Masukkan password Anda"
                />
              </div>

            </>
          ) : (
            <>
              {/* USERNAME */}
              <div>
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="Masukkan username admin"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder="Masukkan password admin"
                />
              </div>
            </>
          )}

          {role !== 'admin' && (
            <>
              {/* KELAS */}
              <div>
                <label className="text-sm font-medium">Kelas {role === 'siswa' ? '(wajib)' : '(opsional)'}</label>
                <input
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg"
                  placeholder={role === 'siswa' ? "Masukkan kelas Anda" : "Masukkan kelas (jika ada)"}
                />
              </div>
            </>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg mt-2"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
