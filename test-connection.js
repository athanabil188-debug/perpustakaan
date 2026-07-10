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

async function testConnection() {
  console.log('Testing database connection...\n');
  
  console.log('Environment variables:');
  console.log('- DB_HOST:', process.env.DB_HOST || 'localhost');
  console.log('- DB_USER:', process.env.DB_USER || 'root');
  console.log('- DB_PASSWORD:', process.env.DB_PASSWORD || '(empty)');
  console.log('- DB_NAME:', process.env.DB_NAME || 'perpustakaan');
  console.log('- DB_PORT:', process.env.DB_PORT || 3306);
  console.log('');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan',
    port: process.env.DB_PORT || 3306,
  };

  let connection;
  
  try {
    console.log('Attempting to connect to MySQL server...');
    connection = await mysql.createConnection(config);
    
    console.log('✓ Successfully connected to MySQL server!');
    
    // Test database query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✓ Query test successful:', rows);
    
    // Check if database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === config.database);
    
    if (dbExists) {
      console.log(`✓ Database "${config.database}" exists`);
      
      // Check if tables exist
      const [tables] = await connection.execute(`SHOW TABLES FROM \`${config.database}\``);
      if (tables.length > 0) {
        console.log(`✓ Database "${config.database}" contains ${tables.length} tables`);
        console.log('Tables:', tables.map(t => Object.values(t)));
      } else {
        console.log(`⚠ Database "${config.database}" exists but has no tables`);
        console.log('You may need to run the setup script to create tables');
      }
    } else {
      console.log(`✗ Database "${config.database}" does not exist`);
      console.log('You need to create the database first');
    }
    
    console.log('\n✓ Database connection test completed successfully!');
  } catch (error) {
    console.error('✗ Database connection test failed:');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Cannot connect to MySQL server.');
      console.error('Make sure:');
      console.error('1. MySQL service is running in Laragon');
      console.error('2. The port is correct (default 3306)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n❌ Access denied. Check your username and password.');
    } else if (error.code === 'ER_DBACCESS_DENIED_ERROR') {
      console.error(`\n❌ Cannot access database "${config.database}".`);
      console.error('The database may not exist or you may not have permission.');
    }
  } finally {
    if (connection) {
      connection.end();
      console.log('Connection closed.');
    }
  }
}

// Run the test
testConnection();