import { getConnection } from '@/lib/db';

// GET a specific book by ID
export async function GET(req, { params }) {
  try {
    const connection = await getConnection();
    const bookId = params.id;

    // Validate that bookId exists and is a valid value
    if (!bookId) {
      return Response.json({
        success: false,
        message: 'Book ID parameter is required'
      }, { status: 400 });
    }

    // Convert to string if it's not already (Next.js params can be strings)
    const id = String(bookId).trim();

    if (typeof id !== 'string' || id === '') {
      return Response.json({
        success: false,
        message: 'Book ID parameter must be a valid string'
      }, { status: 400 });
    }

    const query = `
      SELECT b.*,
             a.name as author_name,
             c.name as category_name,
             p.name as publisher_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN publishers p ON b.publisher_id = p.id
      WHERE b.id = ?
    `;

    const [rows] = await connection.execute(query, [id]);
    connection.release();

    if (rows.length === 0) {
      return Response.json({
        success: false,
        message: 'Book not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching book:', error);

    // More informative error message for debugging
    let errorMessage = `Error fetching book: ${error.message}`;

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

// UPDATE a specific book by ID
export async function PUT(req, { params }) {
  try {
    const connection = await getConnection();
    const bookId = params.id;

    // Validate that bookId exists and is a valid value
    if (!bookId) {
      return Response.json({
        success: false,
        message: 'Book ID parameter is required'
      }, { status: 400 });
    }

    // Convert to string if it's not already (Next.js params can be strings)
    const id = String(bookId).trim();

    if (typeof id !== 'string' || id === '') {
      return Response.json({
        success: false,
        message: 'Book ID parameter must be a valid string'
      }, { status: 400 });
    }

    const body = await req.json();

    const {
      title, subtitle, isbn, author_id, category_id, publisher_id,
      publication_year, edition, pages, language, description,
      quantity, rack_location, cover_image_url
    } = body;

    // First check if book exists
    const checkQuery = 'SELECT id FROM books WHERE id = ?';
    const [existingRows] = await connection.execute(checkQuery, [id]);

    if (existingRows.length === 0) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Book not found'
      }, { status: 404 });
    }

    // Update the book
    // Ensure available_quantity is properly adjusted when quantity changes
    const query = `
      UPDATE books
      SET title = ?, subtitle = ?, isbn = ?, author_id = ?, category_id = ?,
          publisher_id = ?, publication_year = ?, edition = ?, pages = ?,
          language = ?, description = ?, quantity = ?,
          available_quantity =
            CASE
              WHEN available_quantity > ? THEN ?  -- If available is more than new total, set to new total
              ELSE available_quantity  -- Otherwise keep current available
            END,
          rack_location = ?, cover_image_url = ?
      WHERE id = ?
    `;

    // Replace undefined values with null to prevent the "Bind parameters must not contain undefined" error
    const paramsForUpdate = [
      title ?? null, subtitle ?? null, isbn ?? null, author_id ?? null, category_id ?? null,
      publisher_id ?? null, publication_year ?? null, edition ?? null, pages ?? null,
      language ?? null, description ?? null, quantity ?? null,
      quantity ?? null, quantity ?? null,  // For quantity and available_quantity adjustment
      rack_location ?? null, cover_image_url ?? null, id
    ];

    await connection.execute(query, paramsForUpdate);

    connection.release();

    return Response.json({
      success: true,
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Error updating book:', error);

    // More informative error message for debugging
    let errorMessage = `Error updating book: ${error.message}`;

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

// DELETE a specific book by ID
export async function DELETE(req, { params }) {
  try {
    const connection = await getConnection();
    const bookId = params.id;

    // Validate that bookId exists and is a valid value
    if (!bookId) {
      return Response.json({
        success: false,
        message: 'Book ID parameter is required'
      }, { status: 400 });
    }

    // Convert to string if it's not already (Next.js params can be strings)
    const id = String(bookId).trim();

    if (typeof id !== 'string' || id === '') {
      return Response.json({
        success: false,
        message: 'Book ID parameter must be a valid string'
      }, { status: 400 });
    }

    // Check if book exists
    const checkQuery = 'SELECT id FROM books WHERE id = ?';
    const [existingRows] = await connection.execute(checkQuery, [id]);

    if (existingRows.length === 0) {
      connection.release();
      return Response.json({
        success: false,
        message: 'Book not found'
      }, { status: 404 });
    }

    // Delete the book
    const query = 'DELETE FROM books WHERE id = ?';
    await connection.execute(query, [id]);

    connection.release();

    return Response.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);

    // More informative error message for debugging
    let errorMessage = `Error deleting book: ${error.message}`;

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