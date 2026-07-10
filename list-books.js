// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

const mysql = require('mysql2/promise');

async function listBooks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  });

  // Get all books
  const [books] = await connection.execute('SELECT id, title, quantity, available_quantity FROM books ORDER BY id');
  console.log('Books in database:');
  if (books.length > 0) {
    books.forEach(book => {
      console.log(`ID: ${book.id}, Title: ${book.title}, Quantity: ${book.quantity}, Available: ${book.available_quantity}`);
    });
  } else {
    console.log('No books found in the database.');
    console.log('This explains the "Book not found" error.');
  }

  await connection.end();
}

listBooks().catch(err => console.error('Error:', err));