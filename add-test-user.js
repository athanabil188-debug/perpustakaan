// Add a test user directly to check if registration logic works properly
// Force override of environment variables by parsing files manually
const fs = require('fs');
const dotenv = require('dotenv');
const envParsed = dotenv.parse(fs.readFileSync('./.env', 'utf8'));
const envLocalParsed = dotenv.parse(fs.readFileSync('./.env.local', 'utf8'));
const merged = { ...envParsed, ...envLocalParsed };
Object.assign(process.env, merged);

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function addTestUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  });

  console.log('Adding a test user to verify registration flow works...\n');
  
  const name = 'Test Registration User';
  const email = 'testregistration@example.com';
  const member_id = 'TEST003';
  const kelas = 'XII-B';
  const phone = '081234567892';
  const address = 'Test Registration Address';
  const password = 'securepassword123';
  
  // Hash the password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);
  
  try {
    // Insert the new member
    const insertQuery = `
      INSERT INTO members (member_id, name, email, kelas, phone, address, membership_date, status, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'active', ?)
    `;

    const [result] = await connection.execute(insertQuery, [
      member_id,
      name,
      email,
      kelas,
      phone,
      address,
      password_hash
    ]);
    
    console.log('✅ Test user added successfully!');
    console.log('User ID:', result.insertId);
    console.log('Email:', email);
    console.log('Password hash created:', password_hash ? 'Yes' : 'No');
    
    // Now verify we can retrieve the user and check the password
    const [rows] = await connection.execute('SELECT * FROM members WHERE email = ?', [email]);
    const user = rows[0];
    
    if (user) {
      console.log('\n✅ User retrieval successful!');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Kelas:', user.kelas);
      console.log('Has password hash:', user.password_hash ? 'Yes' : 'No');
      
      // Test password verification
      if (user.password_hash) {
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log('Password verification:', isValid ? '✅ Correct' : '❌ Incorrect');
      }
    }
    
  } catch (error) {
    console.error('❌ Error adding test user:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('This email or member_id already exists in the database.');
    }
  }

  await connection.end();
  console.log('\n🎉 Test completed!');
}

addTestUser().catch(err => console.error('Test failed:', err));