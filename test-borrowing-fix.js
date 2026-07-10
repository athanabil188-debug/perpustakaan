// Test the borrowing request functionality with the new books
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

async function testBorrowingLogic() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    console.log('Testing borrowing request logic with sample books...\n');

    // Get the first book
    const [books] = await connection.execute('SELECT id, title, quantity, available_quantity FROM books LIMIT 1');
    
    if (books.length > 0) {
      const testBook = books[0];
      console.log(`Testing with book: ${testBook.title} (ID: ${testBook.id})`);
      
      // Test the new availability logic
      const [bookRows] = await connection.execute('SELECT quantity, available_quantity FROM books WHERE id = ?', [testBook.id]);
      const book = bookRows[0];
      
      // Check active borrows
      const [activeBorrows] = await connection.execute(
        'SELECT COUNT(*) as active_count FROM borrowings WHERE book_id = ? AND status = ?', 
        [testBook.id, 'borrowed']
      );
      const activeBorrowCount = activeBorrows[0].active_count;

      // Check pending requests
      const [pendingRequests] = await connection.execute(
        'SELECT COUNT(*) as pending_count FROM borrowing_requests WHERE book_id = ? AND status = ?', 
        [testBook.id, 'pending']
      );
      const pendingRequestCount = pendingRequests[0].pending_count;

      console.log('Book quantity:', book.quantity);
      console.log('Current available:', book.available_quantity);
      console.log('Active borrows:', activeBorrowCount);
      console.log('Pending requests:', pendingRequestCount);

      const totalUnavailable = activeBorrowCount + pendingRequestCount;
      const isAvailable = totalUnavailable < book.quantity;
      
      console.log('Total unavailable:', totalUnavailable);
      console.log('Is available for request:', isAvailable);
      
      if (isAvailable) {
        console.log('✅ This book should be available for borrowing requests!');
      } else {
        console.log('❌ This book is not available for borrowing requests.');
      }
    } else {
      console.log('No books found in database.');
    }

    await connection.end();
    console.log('\n✅ Test completed successfully.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBorrowingLogic();