const mysql = require('mysql2/promise');

async function fixBookAvailability() {
  console.log('🔧 Starting availability fix...\n');

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

    // Check if books exist first
    const [books] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`📚 Total books found: ${books[0].count}`);

    if (books[0].count === 0) {
      console.log('\n❌ No books found in database!');
      console.log('💡 Hint: Run database setup first: npm run db:setup');
      await connection.end();
      return;
    }

    // Get initial state of availability
    const [before] = await connection.execute(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN available_quantity > 0 THEN 1 END) as available_books,
        COUNT(CASE WHEN available_quantity <= 0 THEN 1 END) as unavailable_books
      FROM books
    `);
    
    console.log(`📊 Before fix: ${before[0].available_books} available, ${before[0].unavailable_books} unavailable`);

    // Reset all available_quantity to match quantity (make everything available)
    const [result] = await connection.execute(`
      UPDATE books 
      SET available_quantity = quantity
      WHERE available_quantity <= 0 OR available_quantity != quantity
    `);
    
    console.log(`✅ Reset availability for ${result.affectedRows} books`);

    // Check final state
    const [after] = await connection.execute(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN available_quantity > 0 THEN 1 END) as available_books,
        COUNT(CASE WHEN available_quantity <= 0 THEN 1 END) as unavailable_books
      FROM books
    `);
    
    console.log(`📊 After fix: ${after[0].available_books} available, ${after[0].unavailable_books} unavailable`);

    // Show some samples
    const [samples] = await connection.execute(`
      SELECT id, title, quantity, available_quantity 
      FROM books 
      ORDER BY id 
      LIMIT 3
    `);
    
    console.log('\n📋 Sample after fix:');
    samples.forEach(book => {
      console.log(`  Book ID ${book.id}: ${book.title} - Available: ${book.available_quantity}/${book.quantity}`);
    });

    await connection.end();
    console.log('\n✅ Availability fix completed successfully!');
    console.log('🔄 Now all books should be available for borrowing.');
    
  } catch (error) {
    console.error('❌ Error during fix:', error.message);
    console.error('💡 Make sure MySQL is running in Laragon!');
  }
}

fixBookAvailability();