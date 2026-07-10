// Script to add sample members to the database
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

async function addSampleMembers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    console.log('Adding sample members to the database...\n');

    // Sample members to add
    const members = [
      {
        member_id: 'M001',
        name: 'Ahmad Fauzi',
        email: 'ahmad.fauzi@example.com',
        phone: '081234567890',
        address: 'Jl. Merdeka No. 10, Jakarta',
        membership_date: '2024-01-15',
        membership_expiry: '2025-01-15'
      },
      {
        member_id: 'M002',
        name: 'Siti Nurhaliza',
        email: 'siti.nur@example.com',
        phone: '081234567891',
        address: 'Jl. Sudirman No. 25, Bandung',
        membership_date: '2024-02-20',
        membership_expiry: '2025-02-20'
      },
      {
        member_id: 'M003',
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        phone: '081234567892',
        address: 'Jl. Gatot Subroto No. 40, Surabaya',
        membership_date: '2024-03-10',
        membership_expiry: '2025-03-10'
      },
      {
        member_id: 'M004',
        name: 'Dewi Lestari',
        email: 'dewi.lestari@example.com',
        phone: '081234567893',
        address: 'Jl. Hayam Wuruk No. 5, Yogyakarta',
        membership_date: '2024-04-05',
        membership_expiry: '2025-04-05'
      },
      {
        member_id: 'M005',
        name: 'Rizki Pratama',
        email: 'rizki.pratama@example.com',
        phone: '081234567894',
        address: 'Jl. Diponegoro No. 15, Medan',
        membership_date: '2024-05-12',
        membership_expiry: '2025-05-12'
      }
    ];

    // Add members to the database
    for (const member of members) {
      const query = `
        INSERT INTO members (member_id, name, email, phone, address, membership_date, membership_expiry, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `;

      const [result] = await connection.execute(query, [
        member.member_id, 
        member.name, 
        member.email, 
        member.phone, 
        member.address,
        member.membership_date,
        member.membership_expiry
      ]);

      console.log(`✓ Added member: ${member.name} (ID: ${member.member_id})`);
    }

    await connection.end();
    console.log('\n🎉 All sample members added successfully!');
    console.log('The foreign key constraint error should now be resolved.');
  } catch (error) {
    console.error('❌ Error adding sample members:', error.message);
  }
}

addSampleMembers();