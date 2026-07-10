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

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
};

// SQL schema - split into separate queries since 'USE' isn't allowed in prepared statements
const createDatabaseSQL = `
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS perpustakaan;
`;

// SQL statements for tables, using database name explicitly in connection
const createTablesSQL = `
-- Table for librarians/admins (created first to resolve foreign key dependencies)
CREATE TABLE IF NOT EXISTS librarians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('admin', 'librarian') DEFAULT 'librarian',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for library members
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    membership_date DATE NOT NULL,
    membership_expiry DATE,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for book categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for book authors
CREATE TABLE IF NOT EXISTS authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    biography TEXT,
    birth_date DATE,
    nationality VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for book publishers
CREATE TABLE IF NOT EXISTS publishers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for books
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    author_id INT,
    category_id INT,
    publisher_id INT,
    publication_year YEAR,
    edition VARCHAR(50),
    pages INT,
    language VARCHAR(50) DEFAULT 'Indonesian',
    description TEXT,
    quantity INT DEFAULT 1,
    available_quantity INT DEFAULT 1,
    rack_location VARCHAR(50),
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (publisher_id) REFERENCES publishers(id) ON DELETE SET NULL
);

-- Table for borrowing transactions (after approval)
CREATE TABLE IF NOT EXISTS borrowings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    book_id INT NOT NULL,
    librarian_id INT,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (librarian_id) REFERENCES librarians(id) ON DELETE SET NULL
);

-- Table for borrowing requests (before approval)
CREATE TABLE IF NOT EXISTS borrowing_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    book_id INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending',
    request_note TEXT,
    approved_by INT NULL,
    approved_date TIMESTAMP NULL,
    rejected_by INT NULL,
    rejected_date TIMESTAMP NULL,
    rejection_reason TEXT,
    borrow_date DATE NULL,  -- Will be set when approved
    due_date DATE NULL,     -- Will be set when approved
    return_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES librarians(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES librarians(id) ON DELETE SET NULL
);
`;

const insertDataSQL = `
-- Insert default admin user (password: admin123, hashed)
-- Default admin: username=admin, password=admin123
INSERT INTO librarians (username, password_hash, name, email, role)
VALUES ('admin', '$2a$10$NQ41DO0Fz2B8hj4Kp7nNtuY5kqZ8K6JH5rL3V0P9Y2b1N0Z3K7R1.', 'Administrator', 'admin@library.com', 'admin')
ON DUPLICATE KEY UPDATE name=name;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Fiction', 'Fictional books and stories'),
('Non-Fiction', 'Factual books and guides'),
('Science', 'Science and technology books'),
('History', 'Historical books and accounts'),
('Biography', 'Biographical accounts'),
('Children', 'Books for children'),
('Religion', 'Religious books and texts'),
('Education', 'Educational materials'),
('Business', 'Business and management books')
ON DUPLICATE KEY UPDATE name=name;
`;

async function setupDatabase() {
  let connection;

  try {
    console.log('Connecting to MySQL server...');
    // First connect without specifying database to create it
    const connectionNoDB = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });

    console.log('Creating database...');
    await connectionNoDB.query(createDatabaseSQL);
    await connectionNoDB.end();

    // Now connect to the specific database to create tables
    console.log('Connecting to perpustakaan database...');
    connection = await mysql.createConnection({
      ...dbConfig,
      database: 'perpustakaan',
      multipleStatements: true,  // Allow multiple statements in one query
    });

    console.log('Creating tables...');
    await connection.query(createTablesSQL);

    console.log('Inserting default data...');
    await connection.query(insertDataSQL);

    console.log('Database setup completed successfully!');
    console.log('Database: perpustakaan');
    console.log('Default admin user created:');
    console.log('  Username: admin');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('Error setting up database:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\nError: Cannot connect to MySQL server.');
      console.error('Please make sure:');
      console.error('1. MySQL server is running in Laragon');
      console.error('2. The connection details in .env file are correct');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nError: Access denied. Please check your username and password in .env file');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;