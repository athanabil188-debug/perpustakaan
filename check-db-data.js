// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

const mysql = require('mysql2/promise');

async function checkDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  });

  // Check if books table exists and has data
  const [bookCount] = await connection.execute('SELECT COUNT(*) as count FROM books');
  console.log('Number of books:', bookCount[0].count);
  
  // Check other tables too
  const [requestCount] = await connection.execute('SELECT COUNT(*) as count FROM borrowing_requests');
  console.log('Number of borrowing requests:', requestCount[0].count);

  const [borrowCount] = await connection.execute('SELECT COUNT(*) as count FROM borrowings');
  console.log('Number of borrowings:', borrowCount[0].count);

  await connection.end();
}

checkDatabase().catch(err => console.error('Error:', err));