const mysql = require('mysql2');
require('dotenv').config();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'perpustakaan',
  port: process.env.DB_PORT || 3306,
};

console.log('Connecting to database to add admin user...');

// Create a connection to MySQL server
const connection = mysql.createConnection(config);

// Hash untuk password "Nabil_carisa" menggunakan bcrypt
// Ini adalah hash bcrypt dari password "Nabil_carisa"
const hashedPassword = '$2a$10$w0mZgD78iLGD/.peF8Iw7.6w4HqB1.U4E46Vg5U6kL0y1qyWd5h0K'; // bcrypt hash for "Nabil_carisa"

connection.query(
  `INSERT INTO librarians (username, password_hash, name, email, role) VALUES (?, ?, ?, ?, 'admin')`,
  ['Nabil', hashedPassword, 'Nabil', 'nabil@library.com'],
  (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('Admin user "Nabil" already exists in the database.');
      } else {
        console.error('Error inserting admin user:', err);
      }
    } else {
      console.log('Admin user "Nabil" created successfully!');
      console.log('Username: Nabil');
      console.log('Password: Nabil_carisa');
    }

    // Close connection
    connection.end();

    console.log('\nDatabase operations completed successfully!');
  }
);