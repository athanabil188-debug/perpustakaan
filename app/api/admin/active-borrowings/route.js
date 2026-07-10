import { getConnection } from '@/lib/db';

// API to get all active borrowings (borrowed and overdue)
export async function GET(req) {
  try {
    const connection = await getConnection();

    const query = `
      SELECT b.*,
             m.name as member_name,
             m.email as member_email,
             m.phone as member_phone,
             bk.title as book_title,
             bk.isbn as book_isbn,
             CONCAT(l.name, ' (', l.username, ')') as librarian_name
      FROM borrowings b
      LEFT JOIN members m ON b.member_id = m.id
      LEFT JOIN books bk ON b.book_id = b.id
      LEFT JOIN librarians l ON b.librarian_id = l.id
      WHERE b.status IN ('borrowed', 'overdue')
      ORDER BY b.borrow_date DESC
    `;

    const [rows] = await connection.execute(query);
    connection.release();

    return Response.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching active borrowings:', error);

    // More informative error message for debugging
    let errorMessage = `Error fetching active borrowings: ${error.message}`;

    // Check if it's a database connection error
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

// API to update a borrowing record (for returning books)
export async function PUT(req, { params }) {
  try {
    const connection = await getConnection();
    const body = await req.json();

    const { id } = params;  // This needs to be handled differently
    // Since we're in [id]/route.js, we need to extract id from the URL differently
    // Actually, let me reconsider this - I need to fix the file structure
    // We should create a specific route for updating by ID
    // Let me cancel this approach and create a separate route file
    
    return Response.json({
      success: false,
      message: 'Method not implemented in this route. Use /api/admin/active-borrowings/[id] for updates.'
    }, { status: 405 });
  } catch (error) {
    console.error('Error in PUT request for active borrowings:', error);
    return Response.json({
      success: false,
      message: `Error updating borrowing: ${error.message}`
    }, { status: 500 });
  }
}