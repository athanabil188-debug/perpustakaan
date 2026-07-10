import { getConnection } from '@/lib/db';

export async function GET(req) {
  try {
    const connection = await getConnection();

    // Get various statistics for admin dashboard
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM borrowing_requests WHERE status = 'pending') AS pending_requests,
        (SELECT COUNT(*) FROM borrowings WHERE status = 'borrowed') AS active_borrowings,
        (SELECT COUNT(*) FROM borrowings WHERE status = 'overdue') AS overdue_borrowings,
        (SELECT COUNT(*) FROM borrowings WHERE status IN ('borrowed', 'overdue')) AS total_active_borrowings,
        (SELECT COUNT(*) FROM members) AS total_members,
        (SELECT COUNT(*) FROM books) AS total_books
    `;

    const [rows] = await connection.execute(statsQuery);
    connection.release();

    if (rows.length > 0) {
      return Response.json({
        success: true,
        data: rows[0]
      });
    } else {
      return Response.json({
        success: false,
        message: 'Could not retrieve statistics'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching admin statistics:', error);

    let errorMessage = `Error fetching admin statistics: ${error.message}`;

    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorMessage = "Database connection refused. Please make sure MySQL server is running and properly configured.";
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('ETIMEDOUT')) {
      errorMessage = "Database connection timeout. Please check if the MySQL server is running and accessible.";
    } else if (error.message.includes('database') || error.message.includes('Unknown database')) {
      errorMessage = "Database not found. Please run the database setup script first.";
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = "Database access denied. Please check your database credentials in the .env file.";
    }

    return Response.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}