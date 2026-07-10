import { getConnection } from '@/lib/db';

// GET borrowed books for the current user
export async function GET(req) {
  try {
    const connection = await getConnection();
    
    // Extract member_id from query parameters
    const { searchParams } = new URL(req.url);
    const member_id = searchParams.get('member_id');

    if (!member_id) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Member ID is required'
      }, { status: 400 });
    }

    const query = `
      SELECT b.*,
             m.name as member_name,
             bk.title as book_title,
             bk.cover_image_url as book_cover,
             l.name as librarian_name
      FROM borrowings b
      LEFT JOIN members m ON b.member_id = m.id
      LEFT JOIN books bk ON b.book_id = bk.id
      LEFT JOIN librarians l ON b.librarian_id = l.id
      WHERE b.member_id = ? AND b.status = 'borrowed'
      ORDER BY b.borrow_date DESC
    `;

    const [rows] = await connection.execute(query, [member_id]);
    connection.release();

    return Response.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching user borrowings:', error);

    let errorMessage = `Error fetching user borrowings: ${error.message}`;

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