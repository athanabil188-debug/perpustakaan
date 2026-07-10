// Check members table schema to see what columns exist
// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

const mysql = require('mysql2/promise');

async function checkMembersSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  });

  console.log('Checking members table schema...');
  
  const [columns] = await connection.execute(`
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'members'
    ORDER BY ORDINAL_POSITION
  `, [process.env.DB_NAME || 'perpustakaan']);

  console.log('Columns in members table:');
  columns.forEach(col => {
    console.log(`- ${col.COLUMN_NAME} (${col.DATA_TYPE}) - NULL: ${col.IS_NULLABLE}, Default: ${col.COLUMN_DEFAULT}`);
  });

  await connection.end();
}

checkMembersSchema().catch(err => console.error('Error:', err));