// Load both .env files, with .env.local taking precedence
require('dotenv').config({ path: ['.env', '.env.local'] });

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
};

console.log('\nTrying to connect with config:', config);

async function testConnection() {
  try {
    console.log('Attempting to connect to MySQL...');
    const connection = await mysql.createConnection(config);
    console.log('✓ Connection successful!');
    
    // Test with a simple query
    const [result] = await connection.execute('SELECT 1+1 as solution');
    console.log('✓ Query result:', result);
    
    await connection.end();
    console.log('Connection closed.');
  } catch (error) {
    console.log('✗ Connection failed:', error.message);
    console.log('Error code:', error.code);
  }
}

testConnection();