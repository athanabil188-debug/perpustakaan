require('dotenv').config();
const mysql = require('mysql2');

// Database configuration (without specifying database name initially)
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
};

console.log('Setting up database...');

// Create a connection to MySQL server (without specifying database)
const connection = mysql.createConnection(config);

// Read the schema from file
const fs = require('fs');
let schemaSQL = fs.readFileSync('./lib/schema.sql', 'utf8');

// Split the SQL into separate statements to avoid the multiple statements issue
const statements = schemaSQL.split(';').filter(stmt => stmt.trim() !== '');

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

  // Execute CREATE DATABASE statement first
  let stmtIndex = 0;

  function executeNextStatement() {
    if (stmtIndex < statements.length) {
      let sql = statements[stmtIndex].trim();

      // Skip the USE statement since we'll connect directly to the database next
      if (sql.toUpperCase().includes('USE LIBRARY_DB')) {
        stmtIndex++;
        executeNextStatement();
        return;
      }

      // Handle CREATE DATABASE separately since it doesn't need a database context
      if (sql.toUpperCase().includes('CREATE DATABASE')) {
        connection.query(sql, (err, results) => {
          if (err && !err.message.includes('database exists')) { // Ignore if database already exists
            console.error('Error executing statement:', sql);
            console.error(err);
            connection.end();
            process.exit(1);
          }
          stmtIndex++;
          executeNextStatement();
        });
        return;
      }

      // Connect to the specific database after creating it
      if (sql.toUpperCase().includes('CREATE TABLE') || sql.toUpperCase().includes('INSERT')) {
        // Create a new connection with the database specified
        const dbConfig = {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'library_db',
          port: process.env.DB_PORT || 3306,
        };

        connection.changeUser(dbConfig, (err) => {
          if (err) {
            console.error('Error changing user to use database:', err);
            connection.end();
            process.exit(1);
          }

          connection.query(sql, (err, results) => {
            if (err) {
              console.error('Error executing statement:', sql);
              console.error(err);
              connection.end();
              process.exit(1);
            }
            stmtIndex++;
            executeNextStatement();
          });
        });
        return;
      }

      stmtIndex++;
      executeNextStatement();
    } else {
      console.log('✓ Database and tables created successfully!');
      console.log('✓ Default admin user created with username: admin and password: admin123');
      connection.end();
      console.log('✓ Database setup completed!');
    }
  }

  // Start executing statements
  executeNextStatement();
});