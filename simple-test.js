const mysql = require('mysql2');

// Konfigurasi spesifik untuk database Anda
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Biasanya kosong di Laragon
  database: 'perpustakaan',  // Nama database Anda
  port: 3306  // Port yang digunakan oleh Laragon (standar MySQL)
});

connection.connect((err) => {
  if (err) {
    console.error('Koneksi GAGAL:', err.message);

    if (err.code === 'ECONNREFUSED') {
      console.error('❌ MySQL server tidak berjalan! Pastikan MySQL di Laragon sudah START');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ Database "perpustakaan" tidak ditemukan!');
      console.error('Silakan buat database "perpustakaan" di phpMyAdmin atau jalankan skrip setup');
    } else {
      console.error('❌ Error lain:', err.code, err.sqlMessage);
    }
  } else {
    console.log('✅ Koneksi BERHASIL ke database "perpustakaan"');
    connection.end();
  }
});