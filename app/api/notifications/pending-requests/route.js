import { getConnection } from '@/lib/db';

// API to get pending borrowing requests count (for notification)
export async function GET(req) {
  try {
    const connection = await getConnection();

    const query = `
      SELECT COUNT(*) as pending_count
      FROM borrowing_requests
      WHERE status = 'pending'
    `;

    const [rows] = await connection.execute(query);
    connection.release();

    return Response.json({
      success: true,
      pending_count: rows[0].pending_count
    });
  } catch (error) {
    console.error('Error fetching pending requests count:', error);
    return Response.json({
      success: false,
      message: `Error fetching pending requests count: ${error.message}`
    }, { status: 500 });
  }
}