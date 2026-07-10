// Script to add kelas column to members table
// Force override of environment variables by parsing files manually
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

async function addKelasColumn() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    console.log('Adding kelas column to members table...\n');

    // Check if kelas column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'members' AND COLUMN_NAME = 'kelas'
    `, [process.env.DB_NAME || 'perpustakaan']);

    if (columns.length > 0) {
      console.log('❌ kelas column already exists in members table.');
    } else {
      // Add the kelas column to the members table
      const query = 'ALTER TABLE members ADD COLUMN kelas VARCHAR(50) NULL AFTER email';
      await connection.execute(query);
      console.log('✅ kelas column added to members table successfully.');
    }

    await connection.end();
    console.log('\n🎉 Operation completed!');
  } catch (error) {
    console.error('❌ Error adding kelas column:', error.message);
  }
}

addKelasColumn();