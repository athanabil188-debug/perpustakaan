const mysql = require('mysql2/promise');

async function testBookAvailability() {
  console.log('Testing book availability...\n');

  try {
    // Create connection using the same config as the app
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT || 3306,
    });

    console.log('✅ Connected to database\n');

    // Check if books table exists and has data
    const [books] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`📚 Total books in database: ${books[0].count}`);

    if (books[0].count > 0) {
      // Show some book details
      const [sampleBooks] = await connection.execute(`
        SELECT id, title, quantity, available_quantity 
        FROM books 
        LIMIT 5
      `);
      
      console.log('\n📋 Sample book data (first 5):');
      sampleBooks.forEach(book => {
        console.log(`  ID: ${book.id}, Title: ${book.title}`);
        console.log(`    Quantity: ${book.quantity}, Available: ${book.available_quantity}`);
        console.log(`    Status: ${book.available_quantity > 0 ? '✅ Available' : '❌ Not Available'}\n`);
      });

      // Check how many books are available for borrowing
      const [availableBooks] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM books 
        WHERE available_quantity > 0
      `);
      
      console.log(`✅ Books available for borrowing: ${availableBooks[0].count}`);
      console.log(`❌ Books not available for borrowing: ${books[0].count - availableBooks[0].count}`);
    } else {
      console.log(`\n❌ No books found in database. You need to add books first.`);
      console.log(`💡 Try running the setup script: npm run db:setup`);
    }

    await connection.end();
    console.log('\n✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

testBookAvailability();