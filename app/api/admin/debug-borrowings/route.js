import { getConnection } from '@/lib/db';

// Debug API to check borrowing counts manually
export async function GET(req) {
  try {
    const connection = await getConnection();

    // Test query to see all borrowing counts by status
    const debugQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM borrowings
      GROUP BY status
    `;

    const [rows] = await connection.execute(debugQuery);
    connection.release();

    // Also get the specific count for 'borrowed' status
    const borrowedCountQuery = `
      SELECT COUNT(*) as borrowed_count
      FROM borrowings
      WHERE status = 'borrowed'
    `;

    const [borrowedRows] = await connection.execute(borrowedCountQuery);

    return Response.json({
      success: true,
      allStatusCounts: rows,
      borrowedCount: borrowedRows[0].borrowed_count
    });
  } catch (error) {
    console.error('Error fetching debug borrowing data:', error);
    
    let errorMessage = `Error fetching debug borrowing data: ${error.message}`;
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorMessage = "Database connection failed. Please make sure MySQL server is running and properly configured.";
    } else if (error.message.includes('database') || error.message.includes('Unknown database')) {
      errorMessage = "Database not found. Please run the database setup script first.";
    }

    return Response.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}