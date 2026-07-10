// Script to add sample books to the database

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

async function addSampleBooks() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    console.log('Adding sample books to the database...\n');

    // First, let's add some authors if they don't exist
    const authors = [
      { name: 'J.K. Rowling', nationality: 'British' },
      { name: 'George Orwell', nationality: 'British' },
      { name: 'Agatha Christie', nationality: 'British' },
      { name: 'Mark Twain', nationality: 'American' },
      { name: 'Andrea Hirata', nationality: 'Indonesian' }
    ];

    for (const author of authors) {
      const [result] = await connection.execute(
        'INSERT IGNORE INTO authors (name, nationality) VALUES (?, ?)',
        [author.name, author.nationality]
      );
      console.log(`✓ Added/verified author: ${author.name}`);
    }

    // Add some categories if they don't exist
    const categories = [
      { name: 'Fiction', description: 'Fictional books and stories' },
      { name: 'Non-Fiction', description: 'Factual books and guides' },
      { name: 'Mystery', description: 'Mystery and detective stories' },
      { name: 'Classic Literature', description: 'Classic literary works' },
      { name: 'Indonesian Literature', description: 'Indonesian literature' }
    ];

    for (const category of categories) {
      const [result] = await connection.execute(
        'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
        [category.name, category.description]
      );
      console.log(`✓ Added/verified category: ${category.name}`);
    }

    // Add some publishers if they don't exist
    const publishers = [
      { name: 'Gramedia Pustaka Utama', address: 'Jakarta, Indonesia' },
      { name: 'Penguin Random House', address: 'London, UK' },
      { name: 'Simon & Schuster', address: 'New York, USA' }
    ];

    for (const publisher of publishers) {
      const [result] = await connection.execute(
        'INSERT IGNORE INTO publishers (name, address) VALUES (?, ?)',
        [publisher.name, publisher.address]
      );
      console.log(`✓ Added/verified publisher: ${publisher.name}`);
    }

    // Now get the IDs of the created/verified entries
    const [authorRows] = await connection.execute('SELECT id, name FROM authors WHERE name IN (?, ?, ?, ?, ?)', 
      authors.map(a => a.name));
    const authorMap = {};
    authorRows.forEach(row => {
      authorMap[row.name] = row.id;
    });

    const [categoryRows] = await connection.execute('SELECT id, name FROM categories WHERE name IN (?, ?, ?, ?, ?)', 
      categories.map(c => c.name));
    const categoryMap = {};
    categoryRows.forEach(row => {
      categoryMap[row.name] = row.id;
    });

    const [publisherRows] = await connection.execute('SELECT id, name FROM publishers WHERE name IN (?, ?, ?)', 
      publishers.map(p => p.name));
    const publisherMap = {};
    publisherRows.forEach(row => {
      publisherMap[row.name] = row.id;
    });

    // Sample books to add
    const books = [
      {
        title: 'Harry Potter and the Philosopher\'s Stone',
        isbn: '9780747532699',
        author_id: authorMap['J.K. Rowling'],
        category_id: categoryMap['Fiction'],
        publisher_id: publisherMap['Penguin Random House'],
        publication_year: 1997,
        pages: 223,
        language: 'English',
        description: 'A young wizard begins his journey at Hogwarts School of Witchcraft and Wizardry.',
        quantity: 5,
        rack_location: 'Fiction F1'
      },
      {
        title: '1984',
        isbn: '9780451524935',
        author_id: authorMap['George Orwell'],
        category_id: categoryMap['Classic Literature'],
        publisher_id: publisherMap['Penguin Random House'],
        publication_year: 1949,
        pages: 328,
        language: 'English',
        description: 'A dystopian social science fiction novel about totalitarian control.',
        quantity: 3,
        rack_location: 'Classic L2'
      },
      {
        title: 'Andrea Hirata: The Rainbow Troops',
        isbn: '9789792245671',
        author_id: authorMap['Andrea Hirata'],
        category_id: categoryMap['Indonesian Literature'],
        publisher_id: publisherMap['Gramedia Pustaka Utama'],
        publication_year: 2005,
        pages: 528,
        language: 'Indonesian',
        description: 'Story of the students in a poor Muhammadiyah school on Belitung Island.',
        quantity: 4,
        rack_location: 'Indonesian L3'
      },
      {
        title: 'The Adventures of Tom Sawyer',
        isbn: '9780486400778',
        author_id: authorMap['Mark Twain'],
        category_id: categoryMap['Classic Literature'],
        publisher_id: publisherMap['Simon & Schuster'],
        publication_year: 1876,
        pages: 224,
        language: 'English',
        description: 'Classic adventure novel about a boy growing up along the Mississippi River.',
        quantity: 2,
        rack_location: 'Classic L1'
      },
      {
        title: 'Murder on the Orient Express',
        isbn: '9780062693662',
        author_id: authorMap['Agatha Christie'],
        category_id: categoryMap['Mystery'],
        publisher_id: publisherMap['Penguin Random House'],
        publication_year: 1934,
        pages: 256,
        language: 'English',
        description: 'Detective Hercule Poirot solves a murder on a train journey.',
        quantity: 3,
        rack_location: 'Mystery M1'
      }
    ];

    // Add books to the database
    for (const book of books) {
      const query = `
        INSERT INTO books (isbn, title, author_id, category_id, publisher_id,
                          publication_year, pages, language, description,
                          quantity, available_quantity, rack_location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        book.isbn, book.title, book.author_id, book.category_id, book.publisher_id,
        book.publication_year, book.pages, book.language, book.description,
        book.quantity, book.quantity, book.rack_location // available_quantity starts equal to quantity
      ]);

      console.log(`✓ Added book: ${book.title} (${book.quantity} copies)`);
    }

    await connection.end();
    console.log('\n🎉 All sample books added successfully!');
    console.log('You can now borrow books from the system.');
  } catch (error) {
    console.error('❌ Error adding sample books:', error.message);
  }
}

addSampleBooks();