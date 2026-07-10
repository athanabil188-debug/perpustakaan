import { getConnection } from '@/lib/db';

// GET a specific borrowing request by ID
export async function GET(req, { params }) {
  try {
    const connection = await getConnection();
    const requestId = params.id;
    
    const query = `
      SELECT br.*, 
             m.name as member_name, 
             b.title as book_title,
             b.isbn,
             b.author_id,
             a.name as author_name,
             CONCAT(l1.name, ' (', l1.username, ')') as approved_by_name,
             CONCAT(l2.name, ' (', l2.username, ')') as rejected_by_name
      FROM borrowing_requests br
      LEFT JOIN members m ON br.member_id = m.id
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN librarians l1 ON br.approved_by = l1.id
      LEFT JOIN librarians l2 ON br.rejected_by = l2.id
      WHERE br.id = ?
    `;
    
    const [rows] = await connection.execute(query, [requestId]);
    connection.release();
    
    if (rows.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'Borrowing request not found' 
      }, { status: 404 });
    }
    
    return Response.json({ 
      success: true, 
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching borrowing request:', error);
    return Response.json({ 
      success: false, 
      message: `Error fetching borrowing request: ${error.message}` 
    }, { status: 500 });
  }
}

// UPDATE a specific borrowing request (for approval/rejection)
export async function PUT(req, { params }) {
  try {
    const connection = await getConnection();
    const requestId = params.id;
    const body = await req.json();

    // Safely extract values with default fallbacks to avoid undefined
    const status = body.status;
    const approved_by = 'approved_by' in body ? body.approved_by : null;
    const rejected_by = 'rejected_by' in body ? body.rejected_by : null;
    const rejection_reason = 'rejection_reason' in body ? body.rejection_reason : null;
    const due_date = 'due_date' in body ? body.due_date : null;

    // Check if request exists
    const checkQuery = 'SELECT * FROM borrowing_requests WHERE id = ?';
    const [existingRows] = await connection.execute(checkQuery, [requestId]);

    if (existingRows.length === 0) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Borrowing request not found'
      }, { status: 404 });
    }

    const existingRequest = existingRows[0];

    if (status === 'approved') {
      // Begin transaction to ensure atomicity
      await connection.beginTransaction();

      try {
        // Update book availability - check if book is still available and update atomically
        const updateBookQuery = `
          UPDATE books
          SET available_quantity = available_quantity - 1
          WHERE id = ? AND available_quantity > 0
        `;
        const [bookResult] = await connection.execute(updateBookQuery, [existingRequest.book_id]);

        if (bookResult.affectedRows === 0) {
          await connection.rollback();
          connection.release();
          return Response.json({
            success: false,
            message: 'Book is no longer available for borrowing'
          }, { status: 400 });
        }

        // Update the borrowing request status and set approval details
        // Explicitly use null for any undefined values
        const updateRequestQuery = `
          UPDATE borrowing_requests
          SET status = ?, approved_by = ?, approved_date = NOW(),
              borrow_date = CURDATE(), due_date = ?
          WHERE id = ?
        `;
        await connection.execute(updateRequestQuery, [
          status,
          approved_by !== undefined ? approved_by : null,
          due_date !== undefined ? due_date : null,
          requestId
        ]);

        // Create a borrowing transaction record
        const insertBorrowingQuery = `
          INSERT INTO borrowings (member_id, book_id, librarian_id, borrow_date, due_date, status)
          VALUES (?, ?, ?, CURDATE(), ?, 'borrowed')
        `;
        await connection.execute(insertBorrowingQuery, [
          existingRequest.member_id,
          existingRequest.book_id,
          approved_by !== undefined ? approved_by : null,
          due_date !== undefined ? due_date : null
        ]);

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } else if (status === 'rejected') {
      // Update the borrowing request status and set rejection details
      const updateRequestQuery = `
        UPDATE borrowing_requests
        SET status = ?, rejected_by = ?, rejected_date = NOW(),
            rejection_reason = ?
        WHERE id = ?
      `;
      await connection.execute(updateRequestQuery, [
        status,
        rejected_by !== undefined ? rejected_by : null,
        rejection_reason !== undefined ? rejection_reason : null,
        requestId
      ]);
    } else if (status === 'returned') {
      // Begin transaction to ensure atomicity
      await connection.beginTransaction();

      try {
        // Update the borrowing request status to returned
        const updateRequestQuery = `
          UPDATE borrowing_requests
          SET status = ?, return_date = CURDATE()
          WHERE id = ?
        `;
        await connection.execute(updateRequestQuery, [status, requestId]);

        // Also update the corresponding borrowing record to returned
        const updateBorrowingQuery = `
          UPDATE borrowings
          SET status = 'returned', return_date = CURDATE()
          WHERE member_id = ? AND book_id = ? AND status = 'borrowed'
        `;
        const [borrowingResult] = await connection.execute(updateBorrowingQuery, [existingRequest.member_id, existingRequest.book_id]);

        if (borrowingResult.affectedRows === 0) {
          await connection.rollback();
          connection.release();
          return Response.json({
            success: false,
            message: 'Borrowing record not found or already returned'
          }, { status: 400 });
        }

        // Update book availability
        const updateBookQuery = `
          UPDATE books
          SET available_quantity = available_quantity + 1
          WHERE id = ?
        `;
        await connection.execute(updateBookQuery, [existingRequest.book_id]);

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } else {
      // For other status changes
      const updateRequestQuery = `
        UPDATE borrowing_requests
        SET status = ?
        WHERE id = ?
      `;
      await connection.execute(updateRequestQuery, [status, requestId]);
    }

    connection.release();

    return Response.json({
      success: true,
      message: `Borrowing request ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating borrowing request:', error);
    return Response.json({
      success: false,
      message: `Error updating borrowing request: ${error.message}`
    }, { status: 500 });
  }
}