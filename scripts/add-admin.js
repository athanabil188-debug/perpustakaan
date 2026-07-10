const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'perpustakaan',
  port: process.env.DB_PORT || 3306,
};

async function addAdmin(username, password, name, email) {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Adding admin user...');
    const query = `
      INSERT INTO librarians (username, password_hash, name, email, role)
      VALUES (?, ?, ?, ?, 'admin')
    `;
    
    const [result] = await connection.execute(query, [username, passwordHash, name, email]);
    
    console.log('Admin user created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    
    return result;
    
  } catch (error) {
    console.error('Error adding admin:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Error: Username or email already exists');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Error: Cannot connect to database. Make sure MySQL is running.');
    } else {
      console.error('Unexpected error:', error.message);
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log('Usage: node add-admin.js <username> <password> <name> <email>');
    console.log('Example: node add-admin.js newadmin password123 "New Admin" admin@example.com');
    process.exit(1);
  }
  
  const [username, password, name, email] = args;
  
  addAdmin(username, password, name, email)
    .then(() => {
      console.log('Process completed.');
    })
    .catch((error) => {
      console.log('Process failed.');
      process.exit(1);
    });
}

module.exports = addAdmin;