import { getConnection } from '@/lib/db';

// UPDATE a specific borrowing record for the current user (for returning books)
export async function PUT(req, { params }) {
  try {
    const connection = await getConnection();
    const borrowingId = params.id;
    const body = await req.json();

    const { status, return_date, fine_amount, member_id } = body;

    if (!member_id) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Member ID is required for this operation'
      }, { status: 400 });
    }

    // Check if borrowing exists and belongs to the requesting member
    const checkQuery = 'SELECT * FROM borrowings WHERE id = ? AND member_id = ?';
    const [existingRows] = await connection.execute(checkQuery, [borrowingId, member_id]);

    if (existingRows.length === 0) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Borrowing record not found or does not belong to you'
      }, { status: 404 });
    }

    const existingBorrowing = existingRows[0];

    if (status === 'returned') {
      // Update the borrowing status and set return details
      const updateBorrowingQuery = `
        UPDATE borrowings
        SET status = ?, return_date = ?, fine_amount = ?
        WHERE id = ?
      `;
      await connection.execute(updateBorrowingQuery, [status, return_date, fine_amount, borrowingId]);

      // Update book availability
      const updateBookQuery = `
        UPDATE books
        SET available_quantity = available_quantity + 1
        WHERE id = ?
      `;
      await connection.execute(updateBookQuery, [existingBorrowing.book_id]);

      // Also update any related borrowing requests to 'returned' status
      const updateRequestQuery = `
        UPDATE borrowing_requests
        SET status = 'returned', return_date = ?
        WHERE member_id = ? AND book_id = ? AND status IN ('approved', 'borrowed')
      `;
      await connection.execute(updateRequestQuery, [return_date, existingBorrowing.member_id, existingBorrowing.book_id]);
    } else {
      connection.release();
      return Response.json({
        success: false,
        message: 'Invalid status for return operation. Only "returned" status is allowed.'
      }, { status: 400 });
    }

    connection.release();

    return Response.json({
      success: true,
      message: `Borrowing record updated successfully`
    });
  } catch (error) {
    console.error('Error updating borrowing record:', error);
    return Response.json({
      success: false,
      message: `Error updating borrowing record: ${error.message}`
    }, { status: 500 });
  }
}