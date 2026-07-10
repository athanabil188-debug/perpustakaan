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

async function testBookSearch() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    // Test searching for a specific book title
    const title = 'Putih Abu-Abu';
    const [rows] = await connection.execute(
      `SELECT b.*, a.name as author_name, c.name as category_name, p.name as publisher_name
       FROM books b
       LEFT JOIN authors a ON b.author_id = a.id
       LEFT JOIN categories c ON b.category_id = c.id
       LEFT JOIN publishers p ON b.publisher_id = p.id
       WHERE b.title LIKE ?`, 
      [`%${title}%`]
    );
    
    console.log('Search results for "' + title + '":');
    console.log(rows);
    
    if (rows.length > 0) {
      console.log('\n✅ Book found in database!');
    } else {
      console.log('\n❌ Book not found in database!');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error searching for book:', error.message);
  }
}

testBookSearch();