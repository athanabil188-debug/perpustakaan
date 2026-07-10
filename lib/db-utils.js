import { getConnection } from './db';

/**
 * Utility function to fix book availability by ensuring available_quantity
 * is properly set based on quantity and current borrowing status
 */
export async function fixBookAvailability() {
  try {
    const connection = await getConnection();

    // First, reset all available_quantity to match quantity
    const resetQuery = `
      UPDATE books
      SET available_quantity = quantity
    `;
    await connection.execute(resetQuery);

    // Then, subtract borrowed copies to get accurate available quantity
    const borrowedQuery = `
      SELECT book_id, COUNT(*) as borrowed_count
      FROM borrowings
      WHERE status = 'borrowed'
      GROUP BY book_id
    `;

    const [borrowedRows] = await connection.execute(borrowedQuery);

    // Update available_quantity for each book by subtracting borrowed copies
    for (const row of borrowedRows) {
      const updateQuery = `
        UPDATE books
        SET available_quantity = GREATEST(0, quantity - ?)
        WHERE id = ?
      `;
      await connection.execute(updateQuery, [row.borrowed_count, row.book_id]);
    }

    connection.release();

    console.log(`Updated availability for ${borrowedRows.length} borrowed book types`);

    return {
      success: true,
      message: `Fixed book availability: ${borrowedRows.length} book types had their availability adjusted based on active borrows`
    };
  } catch (error) {
    console.error('Error fixing book availability:', error);
    return {
      success: false,
      message: `Error fixing book availability: ${error.message}`
    };
  }
}

/**
 * Utility function to reset ALL book availability to full quantity
 * Use this carefully - only when all books should be available
 */
export async function resetAllBookAvailability() {
  try {
    const connection = await getConnection();

    // Reset all books to have available_quantity equal to quantity
    const query = `
      UPDATE books
      SET available_quantity = quantity
    `;

    const [result] = await connection.execute(query);
    connection.release();

    console.log(`Reset available_quantity for all ${result.affectedRows} books`);
    return {
      success: true,
      message: `Reset availability for all ${result.affectedRows} books. All books are now available for borrowing.`
    };
  } catch (error) {
    console.error('Error resetting book availability:', error);
    return {
      success: false,
      message: `Error resetting book availability: ${error.message}`
    };
  }
}

/**
 * Utility function to get book availability status
 */
export async function getBookAvailabilityStats() {
  try {
    const connection = await getConnection();

    const query = `
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN available_quantity > 0 THEN 1 END) as available_books,
        COUNT(CASE WHEN available_quantity = 0 THEN 1 END) as unavailable_books
      FROM books
    `;
    
    const [stats] = await connection.execute(query);
    connection.release();
    
    return {
      success: true,
      data: stats[0]
    };
  } catch (error) {
    console.error('Error getting book availability stats:', error);
    return {
      success: false,
      message: `Error getting book availability stats: ${error.message}`
    };
  }
}