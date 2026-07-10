import { getConnection } from '@/lib/db';

// API to get all borrowing requests
export async function GET(req) {
  try {
    const connection = await getConnection();
    
    const query = `
      SELECT br.*, 
             m.name as member_name, 
             b.title as book_title,
             CONCAT(l1.name, ' (', l1.username, ')') as approved_by_name,
             CONCAT(l2.name, ' (', l2.username, ')') as rejected_by_name
      FROM borrowing_requests br
      LEFT JOIN members m ON br.member_id = m.id
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN librarians l1 ON br.approved_by = l1.id
      LEFT JOIN librarians l2 ON br.rejected_by = l2.id
      ORDER BY br.request_date DESC
    `;
    
    const [rows] = await connection.execute(query);
    connection.release();
    
    return Response.json({ 
      success: true, 
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching borrowing requests:', error);

    // More informative error message for debugging
    let errorMessage = `Error fetching borrowing requests: ${error.message}`;

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

// API to create a new borrowing request
export async function POST(req) {
  try {
    const connection = await getConnection();
    const body = await req.json();
    
    const { member_id, book_id, request_note } = body;
    
    // Get book details (quantity and current available quantity)
    const bookQuery = 'SELECT quantity, available_quantity FROM books WHERE id = ?';
    const [bookRows] = await connection.execute(bookQuery, [book_id]);

    if (bookRows.length === 0) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Book not found'
      }, { status: 400 });
    }

    const book = bookRows[0];

    // Check if there are available copies considering both active borrows and pending requests
    // We need to check if total borrows (active + pending) exceed the book quantity
    const activeBorrowsQuery = `
      SELECT COUNT(*) as active_count
      FROM borrowings
      WHERE book_id = ? AND status = 'borrowed'
    `;
    const [activeBorrows] = await connection.execute(activeBorrowsQuery, [book_id]);
    const activeBorrowCount = activeBorrows[0].active_count;

    // Count pending borrowing requests for this book (excluding this user's request, if any)
    const pendingRequestsQuery = `
      SELECT COUNT(*) as pending_count
      FROM borrowing_requests
      WHERE book_id = ? AND status = 'pending'
    `;
    const [pendingRequests] = await connection.execute(pendingRequestsQuery, [book_id]);
    const pendingRequestCount = pendingRequests[0].pending_count;

    // Total unavailable copies = active borrows + pending requests
    const totalUnavailable = activeBorrowCount + pendingRequestCount;

    // Check if all copies are already borrowed or requested
    if (totalUnavailable >= book.quantity) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Book is not available for borrowing'
      }, { status: 400 });
    }
    
    // Check if member already has a pending request for this book
    const requestCheckQuery = 'SELECT id FROM borrowing_requests WHERE member_id = ? AND book_id = ? AND status = ?';
    const [requestCheckRows] = await connection.execute(requestCheckQuery, [member_id, book_id, 'pending']);
    
    if (requestCheckRows.length > 0) {
      connection.release();
      return Response.json({ 
        success: false, 
        message: 'You already have a pending request for this book' 
      }, { status: 400 });
    }
    
    // Check if member already borrowed this book and hasn't returned it
    const borrowCheckQuery = 'SELECT id FROM borrowings WHERE member_id = ? AND book_id = ? AND status = ?';
    const [borrowCheckRows] = await connection.execute(borrowCheckQuery, [member_id, book_id, 'borrowed']);
    
    if (borrowCheckRows.length > 0) {
      connection.release();
      return Response.json({ 
        success: false, 
        message: 'You already borrowed this book and haven\'t returned it' 
      }, { status: 400 });
    }
    
    const query = `
      INSERT INTO borrowing_requests (member_id, book_id, request_note)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await connection.execute(query, [member_id, book_id, request_note]);
    
    connection.release();
    
    return Response.json({ 
      success: true, 
      message: 'Borrowing request submitted successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error creating borrowing request:', error);

    // More informative error message for debugging
    let errorMessage = `Error creating borrowing request: ${error.message}`;

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