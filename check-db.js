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

const mysql = require('mysql2');

// First, connect without specifying database to check if MySQL is accessible and see existing databases
const connectionWithoutDB = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
});

console.log('Mencoba menghubungi MySQL server...');

connectionWithoutDB.connect((err) => {
  if (err) {
    console.error('Gagal menghubungi server MySQL:', err.message);
    return;
  }
  
  console.log('✅ Terhubung ke server MySQL, mencari database "perpustakaan"...');
  
  // Query to show existing databases
  connectionWithoutDB.query('SHOW DATABASES', (err, results) => {
    if (err) {
      console.error('Error saat mengecek database:', err.message);
      connectionWithoutDB.end();
      return;
    }
    
    console.log('Database yang tersedia:');
    const dbName = 'perpustakaan';
    let dbExists = false;
    
    results.forEach(row => {
      console.log('- ' + row.Database);
      if (row.Database === dbName) {
        dbExists = true;
      }
    });
    
    if (dbExists) {
      console.log(`\n✅ Database "${dbName}" DITEMUKAN`);
      
      // Close first connection and try to connect specifically to the database
      connectionWithoutDB.end(() => {
        console.log('Mencoba menghubungi database "perpustakaan" secara spesifik...');
        
        const connectionToDB = mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: dbName,
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
        });
        
        connectionToDB.connect((err) => {
          if (err) {
            console.error(`Gagal menghubungi database "${dbName}":`, err.message);
            connectionToDB.end();
            return;
          }
          
          console.log(`✅ Berhasil terhubung ke database "${dbName}"`);
          
          // Test a simple query
          connectionToDB.query('SELECT 1 as test', (err, results) => {
            if (err) {
              console.error('Error dalam query:', err.message);
            } else {
              console.log('✅ Query berhasil:', results[0]);
              
              // Check if tables exist
              connectionToDB.query('SHOW TABLES', (err, results) => {
                if (err) {
                  console.error('Error saat mengecek tabel:', err.message);
                } else {
                  console.log(`Tabel yang ditemukan: ${results.length} buah`);
                  if(results.length > 0) {
                    console.log('Nama-nama tabel:', results.map(r => Object.values(r)[0]).join(', '));
                  }
                }
                
                connectionToDB.end();
                console.log('Selesai.');
              });
            }
          });
        });
      });
    } else {
      console.log(`\n❌ Database "${dbName}" TIDAK DITEMUKAN`);
      console.log(`Silakan buat database "${dbName}" atau gunakan nama database yang sesuai.`);
      
      // Try to create the database
      console.log(`\nMencoba membuat database "${dbName}"...`);
      connectionWithoutDB.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (err, result) => {
        if (err) {
          console.error('Gagal membuat database:', err.message);
        } else {
          console.log(`✅ Database "${dbName}" berhasil dibuat!`);
        }
        connectionWithoutDB.end();
      });
    }
  });
});