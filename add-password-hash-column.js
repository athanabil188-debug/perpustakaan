// Add password_hash column to members table
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

async function addPasswordHashColumn() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    console.log('Adding password_hash column to members table...\n');

    // Check if password_hash column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'members' AND COLUMN_NAME = 'password_hash'
    `, [process.env.DB_NAME || 'perpustakaan']);

    if (columns.length > 0) {
      console.log('❌ password_hash column already exists in members table.');
    } else {
      // Add the password_hash column to the members table
      const query = 'ALTER TABLE members ADD COLUMN password_hash VARCHAR(255) NULL AFTER status';
      await connection.execute(query);
      console.log('✅ password_hash column added to members table successfully.');
    }

    await connection.end();
    console.log('\n🎉 Operation completed!');
  } catch (error) {
    console.error('❌ Error adding password_hash column:', error.message);
  }
}

addPasswordHashColumn();