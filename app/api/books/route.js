import { getConnection } from '@/lib/db';

// API to get all books
export async function GET(req) {
  try {
    const connection = await getConnection();

    const query = `
      SELECT b.id, b.title, b.isbn, b.publication_year, b.quantity, b.available_quantity,
             a.name as author_name, c.name as category_name, p.name as publisher_name,
             b.subtitle, b.edition, b.pages, b.language, b.description, b.rack_location, b.cover_image_url
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN publishers p ON b.publisher_id = p.id
      ORDER BY b.title
    `;

    const [rows] = await connection.execute(query);
    connection.release();

    return Response.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching books:', error);

    // More informative error message for debugging
    let errorMessage = `Error fetching books: ${error.message}`;

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

// API to add a new book
export async function POST(req) {
  try {
    const connection = await getConnection();
    const body = await req.json();

    const {
      isbn, title, subtitle, author_id, category_id, publisher_id,
      publication_year, edition, pages, language, description,
      quantity, rack_location, cover_image_url
    } = body;

    const query = `
      INSERT INTO books (isbn, title, subtitle, author_id, category_id, publisher_id,
                         publication_year, edition, pages, language, description,
                         quantity, available_quantity, rack_location, cover_image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Replace undefined values with null to prevent the "Bind parameters must not contain undefined" error
    const paramsForInsert = [
      isbn ?? null, title ?? null, subtitle ?? null, author_id ?? null, category_id ?? null,
      publisher_id ?? null, publication_year ?? null, edition ?? null, pages ?? null,
      language ?? null, description ?? null, quantity ?? null, quantity ?? null, // available_quantity starts equal to quantity
      rack_location ?? null, cover_image_url ?? null
    ];

    const [result] = await connection.execute(query, paramsForInsert);

    connection.release();

    return Response.json({
      success: true,
      message: 'Book added successfully',
      bookId: result.insertId
    });
  } catch (error) {
    console.error('Error adding book:', error);

    // More informative error message for debugging
    let errorMessage = `Error adding book: ${error.message}`;

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