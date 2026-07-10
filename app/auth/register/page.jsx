'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [memberId, setMemberId] = useState(''); // This will be the NIS/NIP
  const [kelas, setKelas] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState(''); // We'll store this but not use for login
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!name || !email || !memberId) {
      setError('Nama, email, dan NIS/NIP wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          member_id: memberId,
          kelas,
          phone,
          address,
          password, // We'll store this for security but not use for login
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Registrasi berhasil! Silakan login untuk melanjutkan.');
        // Clear form
        setName('');
        setEmail('');
        setMemberId('');
        setPhone('');
        setAddress('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat registrasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0d2dbf] to-[#7BB3FF] p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">
          Registrasi Akun Perpustakaan
        </h1>
        <p className="text-center text-gray-500 mb-4">
          Buat akun untuk meminjam buku
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Lengkap *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Masukkan nama lengkap Anda"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Masukkan email Anda"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">NIS/NIP *</label>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Masukkan NIS/NIP Anda"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Kelas</label>
            <input
              type="text"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Masukkan kelas Anda (jika pelajar)"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nomor Telepon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Masukkan nomor telepon Anda"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Alamat</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Masukkan alamat Anda"
              rows="2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Buat password Anda"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Konfirmasi Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Ulangi password Anda"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg mt-2"
          >
            {loading ? 'Memproses...' : 'Daftar Akun'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Login disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}