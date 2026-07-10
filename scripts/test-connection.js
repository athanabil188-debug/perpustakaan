require('dotenv').config();
const mysql = require('mysql2');

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
};

console.log('Testing MySQL connection with config:', config);

// Create a connection to MySQL server
const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure Laragon is running');
    console.log('2. Click on "MySQL" button in Laragon to start the MySQL service');
    console.log('3. Ensure the MySQL service shows as running in Laragon');
    console.log('4. Check that the DB_PORT in your .env file matches the port Laragon uses (default 3306)');
    process.exit(1);
  }

  console.log('✓ Successfully connected to MySQL server!');

  // Test if the database exists
  connection.query(`USE ${process.env.DB_NAME || 'perpustakaan'};`, (err) => {
    if (err) {
      console.log(`✗ Database ${(process.env.DB_NAME || 'perpustakaan')} does not exist. Please run 'node scripts/setup-db.js'`);
      connection.end();
      process.exit(1);
    }
    
    console.log(`✓ Database ${(process.env.DB_NAME || 'perpustakaan')} exists and is accessible!`);
    connection.end();
  });
});