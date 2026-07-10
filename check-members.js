// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

const mysql = require('mysql2/promise');

async function checkMembers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  });

  // Check if members table exists and has data
  const [memberCount] = await connection.execute('SELECT COUNT(*) as count FROM members');
  console.log('Number of members:', memberCount[0].count);
  
  if (memberCount[0].count > 0) {
    const [members] = await connection.execute('SELECT id, name, member_id, email FROM members LIMIT 5');
    console.log('Sample members:');
    members.forEach(member => {
      console.log(`ID: ${member.id}, Name: ${member.name}, Member ID: ${member.member_id}, Email: ${member.email}`);
    });
  }

  await connection.end();
}

checkMembers().catch(err => console.error('Error:', err));