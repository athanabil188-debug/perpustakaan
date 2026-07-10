// Test the borrowing request functionality with books and members
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

async function testBorrowingPrerequisites() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });

    console.log('Testing borrowing request prerequisites...\n');

    // Check books
    const [bookCount] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`📚 Books in database: ${bookCount[0].count}`);

    // Check members
    const [memberCount] = await connection.execute('SELECT COUNT(*) as count FROM members');
    console.log(`👥 Members in database: ${memberCount[0].count}`);

    // Get a sample book and member to test with
    const [sampleBook] = await connection.execute('SELECT id, title FROM books LIMIT 1');
    const [sampleMember] = await connection.execute('SELECT id, name FROM members LIMIT 1');
    
    if (sampleBook.length > 0 && sampleMember.length > 0) {
      console.log(`\n📝 Testing with:`);
      console.log(`   Book: ${sampleBook[0].title} (ID: ${sampleBook[0].id})`);
      console.log(`   Member: ${sampleMember[0].name} (ID: ${sampleMember[0].id})`);
      
      // Test the borrowing request logic
      const [activeBorrows] = await connection.execute(
        'SELECT COUNT(*) as active_count FROM borrowings WHERE book_id = ? AND status = ?', 
        [sampleBook[0].id, 'borrowed']
      );
      const activeBorrowCount = activeBorrows[0].active_count;

      const [pendingRequests] = await connection.execute(
        'SELECT COUNT(*) as pending_count FROM borrowing_requests WHERE book_id = ? AND status = ?', 
        [sampleBook[0].id, 'pending']
      );
      const pendingRequestCount = pendingRequests[0].pending_count;
      
      // Get the book quantity
      const [bookData] = await connection.execute(
        'SELECT quantity FROM books WHERE id = ?', 
        [sampleBook[0].id]
      );
      
      const totalUnavailable = activeBorrowCount + pendingRequestCount;
      const isAvailable = totalUnavailable < bookData[0].quantity;
      
      console.log(`\n📋 Availability check for ${sampleBook[0].title}:`);
      console.log(`   Total copies: ${bookData[0].quantity}`);
      console.log(`   Active borrows: ${activeBorrowCount}`);
      console.log(`   Pending requests: ${pendingRequestCount}`);
      console.log(`   Total unavailable: ${totalUnavailable}`);
      console.log(`   Available for request: ${isAvailable}`);

      if (isAvailable) {
        console.log(`\n✅ A borrowing request can be created for this book!`);
      } else {
        console.log(`\n❌ No more copies available for borrowing requests.`);
      }
    } else {
      console.log('\n❌ Not enough data to test borrowing requests.');
    }

    await connection.end();
    console.log('\n✅ Prerequisites test completed successfully.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBorrowingPrerequisites();