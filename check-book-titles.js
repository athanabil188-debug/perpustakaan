// Force override of environment variables by parsing files manually
// This handles cases where system environment variables override .env files
const fs = require('fs');
const dotenv = require('dotenv');

// Parse both files
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));

// Merge with .env.local taking precedence
const merged = { ...envParsed, ...envLocalParsed };

// Apply to process.env (this will override existing values)
Object.assign(process.env, merged);

const mysql = require('mysql2/promise');

async function checkBooks() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    console.log('Checking book titles in database...\n');

    const [rows] = await connection.execute('SELECT id, title FROM books ORDER BY id');
    
    console.log('Available books:');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: "${row.title}"`);
    });

    await connection.end();
    console.log('\n✅ Book data checked successfully!');
  } catch (error) {
    console.error('❌ Error checking books:', error.message);
  }
}

checkBooks();