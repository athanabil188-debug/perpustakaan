// Update existing members with kelas values
// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

const mysql = require('mysql2/promise');

async function updateMemberKelas() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  });

  console.log('Adding kelas values to existing members...');

  // Sample kelas for existing members
  const membersKelas = [
    { id: 1, kelas: 'XII-A' },
    { id: 2, kelas: 'X-IIS' },
    { id: 3, kelas: 'XI-MIPA' },
    { id: 4, kelas: 'X-RPL' },
    { id: 5, kelas: 'XII-IPS' }
  ];

  for (const member of membersKelas) {
    const [result] = await connection.execute(
      'UPDATE members SET kelas = ? WHERE id = ?',
      [member.kelas, member.id]
    );
    console.log(`Updated member ID ${member.id} with kelas: ${member.kelas}`);
  }

  await connection.end();
  console.log('All members updated with kelas values.');
}

updateMemberKelas().catch(err => console.error('Error:', err));