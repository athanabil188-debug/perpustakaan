// Check member data to see if registration is working correctly
// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

const mysql = require('mysql2/promise');

async function checkMemberData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  });

  console.log('Checking member data...\n');
  
  const [members] = await connection.execute('SELECT id, name, email, member_id, kelas, password_hash FROM members ORDER BY id');
  
  console.log(`Found ${members.length} members:`);
  members.forEach(member => {
    console.log(`ID: ${member.id}, Name: ${member.name}, Email: ${member.email}, Member ID: ${member.member_id}, Kelas: ${member.kelas}`);
    console.log(`  Password hash: ${member.password_hash ? 'SET' : 'NOT SET'}\n`);
  });

  await connection.end();
}

checkMemberData().catch(err => console.error('Error:', err));