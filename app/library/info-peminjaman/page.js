"use client";

import Link from "next/link";

export default function InfoPeminjamanPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-700 to-blue-400 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Informasi Peminjaman Buku</h1>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6">
          <div className="prose max-w-none text-white">
            <h2 className="text-2xl font-bold mb-4">Tata Cara Peminjaman Buku</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-200">Syarat Peminjaman</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Wajib memiliki kartu anggota perpustakaan</li>
                  <li>Maksimal peminjaman 5 buku per anggota</li>
                  <li>Waktu peminjaman maksimal 7 hari (dapat diperpanjang)</li>
                  <li>Buku harus dikembalikan dalam kondisi baik</li>
                  <li>Tidak boleh ada tunggakan denda dari peminjaman sebelumnya</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-200">Cara Melakukan Peminjaman</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Datang ke perpustakaan dengan membawa kartu anggota</li>
                  <li>Cari buku yang ingin dipinjam di rak atau melalui katalog online</li>
                  <li>Bawa buku ke meja peminjaman</li>
                  <li>Serahkan buku dan kartu anggota kepada petugas perpustakaan</li>
                  <li>Petugas akan mencatat data peminjaman di sistem</li>
                  <li>Anda akan menerima bukti peminjaman beserta tanggal jatuh tempo</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-200">Denda Keterlambatan</h3>
                <div className="bg-red-500/20 p-4 rounded-lg border border-red-400/30">
                  <p className="mb-2"><strong>Jumlah Denda:</strong> Rp 2.000 per buku per hari</p>
                  <p className="mb-2">Contoh: Jika telat 3 hari dengan 2 buku = Rp 2.000 x 3 x 2 = Rp 12.000</p>
                  <p>Denda harus dibayar sebelum dapat melakukan peminjaman buku kembali.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-200">Perpanjangan Buku</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Peminjaman dapat diperpanjang selama buku tidak sedang dipesan oleh anggota lain</li>
                  <li>Perpanjangan dapat dilakukan 1 kali dengan durasi yang sama (7 hari)</li>
                  <li>Perpanjangan dapat dilakukan secara online atau datang langsung ke perpustakaan</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-200">Kebijakan Kerusakan dan Kehilangan Buku</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Jika buku rusak saat dikembalikan, dikenakan denda sebesar harga buku asli</li>
                  <li>Jika buku hilang, wajib mengganti dengan buku yang sama atau membayar biaya penggantian</li>
                  <li>Denda kerusakan/kehilangan harus diselesaikan sebelum dapat melakukan peminjaman kembali</li>
                </ul>
              </div>

              <div className="bg-green-500/20 p-4 rounded-lg border border-green-400/30">
                <h3 className="text-xl font-semibold mb-2 text-green-200">Tips untuk Anggota Perpustakaan</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Gunakan kantong plastik atau tas buku saat membawa pulang buku</li>
                  <li>Jaga kebersihan dan kondisi buku saat dipinjam</li>
                  <li>Catat tanggal jatuh tempo peminjaman</li>
                  <li>Gunakan fitur notifikasi di sistem online untuk mengingatkan jatuh tempo</li>
                  <li>Periksa kondisi buku sebelum dipinjam</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-white">Butuh Bantuan?</h2>
            <div className="flex gap-4">
              <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Hubungi Admin
              </Link>
              <Link href="/user/dashboard" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}